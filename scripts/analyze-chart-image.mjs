// Chart-scan gridline detector, used to pin calibration anchors precisely instead
// of eyeballing pixel coordinates. Decodes a PNG (no dependencies — node:zlib +
// manual unfilter), builds darkness profiles along rows/columns, and reports the
// strongest line positions near given approximate coordinates, so a human-read
// axis label ("the -40°C tick is roughly here") snaps to the actual printed line.
//
// Usage:
//   node scripts/analyze-chart-image.mjs <image.png> cols <yBand0> <yBand1> [approx...]
//   node scripts/analyze-chart-image.mjs <image.png> rows <xBand0> <xBand1> [approx...]
//
//   cols: detect vertical lines; darkness summed over rows yBand0..yBand1.
//   rows: detect horizontal lines; darkness summed over cols xBand0..xBand1.
//   approx...: optional approximate positions; output snaps each to the nearest
//              strong detected line. With no approx args, lists all strong lines.

import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

/*
 * decodePng(path)
 * Intent: Minimal PNG decode to an 8-bit grayscale buffer. Supports bit depth 8
 *         color types 0/2/3/4/6 and bit depths 1/2/4 for grayscale & palette
 *         (common for document scans), non-interlaced only.
 * Params: path — PNG file path.
 * Returns: { width, height, gray: Uint8Array } where gray[y*width+x] in 0..255.
 */
export function decodePng(path) {
    const buf = readFileSync(path);
    if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
    let pos = 8;
    let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
    let palette = null;
    const idat = [];
    while (pos < buf.length) {
        const len = buf.readUInt32BE(pos);
        const type = buf.toString('ascii', pos + 4, pos + 8);
        const data = buf.subarray(pos + 8, pos + 8 + len);
        if (type === 'IHDR') {
            width = data.readUInt32BE(0); height = data.readUInt32BE(4);
            bitDepth = data[8]; colorType = data[9]; interlace = data[12];
        } else if (type === 'PLTE') {
            palette = data;
        } else if (type === 'IDAT') {
            idat.push(data);
        } else if (type === 'IEND') break;
        pos += 12 + len;
    }
    if (interlace !== 0) throw new Error('interlaced PNG not supported');
    const raw = inflateSync(Buffer.concat(idat));

    const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
    const bitsPerPixel = channels * bitDepth;
    const bytesPerRow = Math.ceil((width * bitsPerPixel) / 8);
    const stride = bytesPerRow + 1;
    const bpp = Math.max(1, Math.ceil(bitsPerPixel / 8));

    // Unfilter (PNG filter types 0-4), in place on a copy.
    const out = Buffer.alloc(bytesPerRow * height);
    for (let y = 0; y < height; y++) {
        const filter = raw[y * stride];
        const row = raw.subarray(y * stride + 1, y * stride + 1 + bytesPerRow);
        const prev = y > 0 ? out.subarray((y - 1) * bytesPerRow, y * bytesPerRow) : null;
        const cur = out.subarray(y * bytesPerRow, (y + 1) * bytesPerRow);
        for (let x = 0; x < bytesPerRow; x++) {
            const a = x >= bpp ? cur[x - bpp] : 0;
            const b = prev ? prev[x] : 0;
            const c = prev && x >= bpp ? prev[x - bpp] : 0;
            let val = row[x];
            if (filter === 1) val += a;
            else if (filter === 2) val += b;
            else if (filter === 3) val += (a + b) >> 1;
            else if (filter === 4) {
                const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
                val += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
            }
            cur[x] = val & 0xff;
        }
    }

    // Convert to grayscale.
    const gray = new Uint8Array(width * height);
    const readSample = (row, x) => {
        if (bitDepth === 8) return row[x];
        const bitPos = x * bitDepth;
        const byte = row[bitPos >> 3];
        const shift = 8 - bitDepth - (bitPos & 7);
        const maxVal = (1 << bitDepth) - 1;
        return Math.round(((byte >> shift) & maxVal) * 255 / maxVal);
    };
    for (let y = 0; y < height; y++) {
        const row = out.subarray(y * bytesPerRow, (y + 1) * bytesPerRow);
        for (let x = 0; x < width; x++) {
            let g;
            if (colorType === 0) g = readSample(row, x);
            else if (colorType === 4) g = row[x * 2];
            else if (colorType === 2) g = Math.round(0.299 * row[x * 3] + 0.587 * row[x * 3 + 1] + 0.114 * row[x * 3 + 2]);
            else if (colorType === 6) g = Math.round(0.299 * row[x * 4] + 0.587 * row[x * 4 + 1] + 0.114 * row[x * 4 + 2]);
            else if (colorType === 3) {
                const idx = readSample(row, x) * (bitDepth === 8 ? 1 : 255 / ((1 << bitDepth) - 1));
                const i = bitDepth === 8 ? row[x] : Math.round(idx / (255 / ((1 << bitDepth) - 1)));
                g = Math.round(0.299 * palette[i * 3] + 0.587 * palette[i * 3 + 1] + 0.114 * palette[i * 3 + 2]);
            }
            gray[y * width + x] = g;
        }
    }
    return { width, height, gray };
}

/*
 * profile(img, axis, band0, band1)
 * Intent: Darkness profile — for each column (axis='cols') or row (axis='rows'),
 *         the fraction of pixels darker than threshold within the given band of
 *         the perpendicular axis. Printed gridlines show up as sharp maxima.
 * Params: img — from decodePng; axis — 'cols' | 'rows'; band0/band1 — inclusive
 *         pixel range on the perpendicular axis to sum over.
 * Returns: Float64Array of length width (cols) or height (rows).
 */
export function profile(img, axis, band0, band1) {
    const { width, height, gray } = img;
    const dark = v => v < 128;
    if (axis === 'cols') {
        const p = new Float64Array(width);
        for (let x = 0; x < width; x++) {
            let n = 0;
            for (let y = band0; y <= band1; y++) if (dark(gray[y * width + x])) n++;
            p[x] = n / (band1 - band0 + 1);
        }
        return p;
    }
    const p = new Float64Array(height);
    for (let y = 0; y < height; y++) {
        let n = 0;
        for (let x = band0; x <= band1; x++) if (dark(gray[y * width + x])) n++;
        p[y] = n / (band1 - band0 + 1);
    }
    return p;
}

/*
 * findPeaks(p, minStrength)
 * Intent: Locate local maxima in a darkness profile — candidate gridline centers.
 *         Adjacent above-threshold positions are merged into one peak at the
 *         darkness-weighted centroid.
 * Params: p — profile array; minStrength — minimum darkness fraction (0..1).
 * Returns: array of { pos, strength } sorted by position.
 */
export function findPeaks(p, minStrength) {
    const peaks = [];
    let start = -1;
    for (let i = 0; i <= p.length; i++) {
        const above = i < p.length && p[i] >= minStrength;
        if (above && start < 0) start = i;
        if (!above && start >= 0) {
            let sum = 0, wsum = 0, best = 0;
            for (let j = start; j < i; j++) { sum += p[j]; wsum += j * p[j]; best = Math.max(best, p[j]); }
            peaks.push({ pos: wsum / sum, strength: best });
            start = -1;
        }
    }
    return peaks;
}

// CLI mode only when invoked directly (the functions above are importable).
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
const [, , path, axis, b0, b1, ...approx] = process.argv;
const img = decodePng(path);
console.log(`# ${path} — ${img.width}x${img.height}`);
const p = profile(img, axis, parseInt(b0), parseInt(b1));
// MINSTR env var tunes the peak threshold for lighter scans (default 0.5).
const peaks = findPeaks(p, parseFloat(process.env.MINSTR ?? '0.5'));
if (approx.length === 0) {
    for (const pk of peaks) console.log(`${axis === 'cols' ? 'x' : 'y'}=${pk.pos.toFixed(1)}  strength=${pk.strength.toFixed(2)}`);
} else {
    for (const a of approx) {
        const target = parseFloat(a);
        let best = null;
        for (const pk of peaks) {
            if (!best || Math.abs(pk.pos - target) < Math.abs(best.pos - target)) best = pk;
        }
        console.log(`approx ${target} -> ${best ? best.pos.toFixed(1) : 'none'} (strength ${best ? best.strength.toFixed(2) : '-'}, delta ${best ? (best.pos - target).toFixed(1) : '-'})`);
    }
}
}
