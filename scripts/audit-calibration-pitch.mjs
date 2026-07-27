// Calibration sanity audit: for every panel of every chart calibration, measure
// the actual printed gridline pitch inside that panel's own pixel region and
// compare it to the calibration's px-per-data-unit. Real charts use a clean
// number of data units per printed line (0.5, 1, 2, 2.5, 5, 10, 20, 25, 50...).
// A non-clean ratio means an anchor probably snapped to the wrong line — the
// exact failure that put the PA-28-161 climb chart's "80" anchor on the page
// sidebar rule instead of the axis line.
//
// Run with: node scripts/audit-calibration-pitch.mjs

import { decodePng, profile, findPeaks } from './analyze-chart-image.mjs';
import { fitAffine } from '../src/lib/chart-calibration.js';
import { getChartCalibration } from '../src/lib/chart-calibrations.js';

const IMAGES = {
    'pa28-151': { climb: 'PA28-151-ClimbPerformanceChart.png', cruise: 'PA28-151-CruisePerformanceChart.png', engine: 'PA28-151-EnginePerformanceChart.png', airspeedCal: 'PA28-151-AirspeedCalChart.png' },
    'pa28-161': { climb: 'PA28-161-ClimbPerformanceChart.png', cruise: 'PA28-161-CruisePerfPowerChart.png', engine: 'PA28-161-EnginePerformanceChart.png', airspeedCal: 'PA28-161-AirspeedCalChart.png' },
    'pa28-181': { climb: 'PA28-181-ClimbPerformanceChart.png', cruise: 'PA28-181-CruisePerfPowerChart.png', engine: 'PA28-181-EnginePerformanceChart.png', airspeedCal: 'PA28-181-AirspeedCalChart.png' },
};

// Clean unit-per-line ratios include cross-unit cases: °C data on a °F-pitched
// grid (10 °F line = 5.556 °C, 20 °F = 11.111 °C) and KTS data on an MPH-pitched
// grid (2.5 MPH line = 2.172 kt, 5 MPH = 4.345 kt).
const CLEAN_RATIOS = [0.5, 1, 2, 2.172, 2.5, 4.345, 5, 5.556, 10, 11.111, 20, 25, 50, 100];

/*
 * medianSpacing(peaks)
 * Intent: Median gap between consecutive detected lines — robust estimate of the
 *         printed grid pitch even when some lines are missed or spurious.
 * Params: peaks — findPeaks() output (sorted by position).
 * Returns: median spacing in px, or null with <4 peaks.
 */
function medianSpacing(peaks) {
    if (peaks.length < 4) return null;
    const gaps = [];
    for (let i = 1; i < peaks.length; i++) gaps.push(peaks[i].pos - peaks[i - 1].pos);
    gaps.sort((a, b) => a - b);
    return gaps[Math.floor(gaps.length / 2)];
}

/*
 * auditPanel(img, name, panel)
 * Intent: Measure x- and y-pitch inside the panel's bounding box (shrunk 15% to
 *         avoid frames) and report data-units-per-printed-line for both axes.
 * Params: img — decoded PNG; name — panel name; panel — calibration panel.
 * Returns: array of { axis, pitch, pxPerUnit, unitsPerLine, clean } rows.
 */
function auditPanel(img, name, panel) {
    const t = fitAffine(panel.refPoints);
    const xs = panel.refPoints.map(r => r.px.x);
    const ys = panel.refPoints.map(r => r.px.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const y0 = Math.min(...ys), y1 = Math.max(...ys);
    const shrink = (a, b) => [Math.round(a + (b - a) * 0.15), Math.round(b - (b - a) * 0.15)];
    const [bx0, bx1] = shrink(x0, x1);
    const [by0, by1] = shrink(y0, y1);

    const rows = [];
    for (const [axis, band0, band1, pxPerUnit] of [
        ['x', by0, by1, Math.hypot(t.a, t.d)],
        ['y', bx0, bx1, Math.hypot(t.b, t.e)],
    ]) {
        const p = profile(img, axis === 'x' ? 'cols' : 'rows', band0, band1);
        // Only consider peaks inside the panel's own extent on the measured axis.
        const lo = axis === 'x' ? bx0 : by0, hi = axis === 'x' ? bx1 : by1;
        const peaks = findPeaks(p, 0.45).filter(pk => pk.pos >= lo && pk.pos <= hi);
        const pitch = medianSpacing(peaks);
        if (pitch === null) { rows.push({ axis, pitch: null }); continue; }
        const unitsPerLine = pitch / pxPerUnit;
        const nearest = CLEAN_RATIOS.reduce((a, b) => Math.abs(b - unitsPerLine) < Math.abs(a - unitsPerLine) ? b : a);
        const clean = Math.abs(nearest - unitsPerLine) / nearest < 0.06;
        rows.push({ axis, pitch, pxPerUnit, unitsPerLine, nearest, clean });
    }
    return rows;
}

for (const [aircraft, charts] of Object.entries(IMAGES)) {
    for (const [type, file] of Object.entries(charts)) {
        const cal = getChartCalibration(aircraft, type);
        if (!cal) continue;
        const img = decodePng(`public/charts/${file}`);
        for (const [name, panel] of Object.entries(cal.panels)) {
            for (const r of auditPanel(img, name, panel)) {
                if (r.pitch === null) {
                    console.log(`${aircraft} ${type} ${name} ${r.axis}: too few lines detected`);
                    continue;
                }
                const flag = r.clean ? 'ok  ' : '*** SUSPECT';
                console.log(`${flag} ${aircraft} ${type} ${name} ${r.axis}: pitch ${r.pitch.toFixed(1)}px, ${r.pxPerUnit.toFixed(2)}px/unit -> ${r.unitsPerLine.toFixed(2)} units/line (nearest clean: ${r.nearest})`);
            }
        }
    }
}
