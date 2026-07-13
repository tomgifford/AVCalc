// Traces one vertical gridline's true position across many height slices and
// fits a line (x = m*y + b) via least squares, to precisely measure any
// rotation/skew in the scan — far more robust than sampling just two points,
// since it averages out per-slice detection noise.
//
// Usage: node scripts/trace-gridline-angle.mjs <image.png> <approxX> <y0> <y1> [sliceHeight] [searchRadius]

import { decodePng, profile, findPeaks } from './analyze-chart-image.mjs';

const [, , path, approxXArg, y0Arg, y1Arg, sliceHArg, radiusArg] = process.argv;
const approxX = parseFloat(approxXArg);
const y0 = parseInt(y0Arg), y1 = parseInt(y1Arg);
const sliceH = parseInt(sliceHArg ?? '15');
const radius = parseFloat(radiusArg ?? '12');

const img = decodePng(path);
const points = [];
for (let y = y0; y + sliceH <= y1; y += sliceH) {
    const p = profile(img, 'cols', y, y + sliceH);
    const peaks = findPeaks(p, 0.3).filter(pk => Math.abs(pk.pos - approxX) < radius);
    if (peaks.length === 0) continue;
    // Closest peak to the running expected position (approxX updates as we go,
    // so the search radius tracks a sloped line instead of losing it).
    const best = peaks.reduce((a, b) => Math.abs(a.pos - approxX) < Math.abs(b.pos - approxX) ? a : b);
    const yMid = y + sliceH / 2;
    points.push({ y: yMid, x: best.pos });
}

if (points.length < 3) {
    console.log('too few points found:', points.length);
    process.exit(1);
}

// Least-squares fit x = m*y + b.
const n = points.length;
let sy = 0, sx = 0, syy = 0, sxy = 0;
for (const { x, y } of points) { sy += y; sx += x; syy += y * y; sxy += x * y; }
const m = (n * sxy - sy * sx) / (n * syy - sy * sy);
const b = (sx - m * sy) / n;

console.log(`${points.length} points, slope m=${m.toFixed(5)} px_x/px_y, intercept b=${b.toFixed(2)}`);
console.log(`  x at y=${y0}: ${(m * y0 + b).toFixed(2)}`);
console.log(`  x at y=${y1}: ${(m * y1 + b).toFixed(2)}`);
const residuals = points.map(({ x, y }) => x - (m * y + b));
const rms = Math.sqrt(residuals.reduce((s, r) => s + r * r, 0) / n);
console.log(`  fit RMS residual: ${rms.toFixed(2)}px`);
