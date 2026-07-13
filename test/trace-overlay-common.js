// Shared helpers for the *-trace-overlay.html calibration verification pages.
// Each page renders a POH chart scan with an SVG overlay of (a) a reference
// lattice, (b) the digitized curves, and (c) an example trace — all mapped
// through the calibration in src/lib/chart-calibrations.js. If calibration and
// digitization are correct, everything sits exactly on the printed chart.

import { fitAffine, dataToPx } from '../src/lib/chart-calibration.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/*
 * fitPanels(calibration)
 * Intent: Fit affine transforms for every panel of a calibration entry.
 * Params: calibration — { panels: { name: { refPoints } } } entry.
 * Returns: { transforms: {name: transform}, residualText: "oat 0.00 px · ..." }.
 */
export function fitPanels(calibration) {
    const transforms = {};
    const parts = [];
    for (const [name, panel] of Object.entries(calibration.panels)) {
        transforms[name] = fitAffine(panel.refPoints);
        parts.push(`${name} ${transforms[name].rmsError.toFixed(2)} px`);
    }
    return { transforms, residualText: parts.join(' · ') };
}

/*
 * addPolyline(svg, transform, points, stroke, width, dash)
 * Intent: Map data-space points through a panel transform and append an SVG
 *         polyline to the overlay.
 * Params: svg — target <svg>; transform — fitted affine; points — [{x,y},...]
 *         in data space; stroke/width/dash — styling.
 * Returns: nothing (appends to the DOM).
 */
export function addPolyline(svg, transform, points, stroke, width = 2, dash = null) {
    const el = document.createElementNS(SVG_NS, 'polyline');
    el.setAttribute('points', points.map(p => {
        const q = dataToPx(transform, p);
        return `${q.x.toFixed(1)},${q.y.toFixed(1)}`;
    }).join(' '));
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke', stroke);
    el.setAttribute('stroke-width', width);
    el.setAttribute('vector-effect', 'non-scaling-stroke');
    if (dash) el.setAttribute('stroke-dasharray', dash);
    svg.appendChild(el);
}

/*
 * addDot(svg, transform, point, fill, r)
 * Intent: Map one data-space point through a panel transform and append a marker
 *         circle to the overlay.
 * Params: svg — target <svg>; transform — fitted affine; point — {x,y} data
 *         space; fill — color; r — radius in image pixels.
 * Returns: nothing (appends to the DOM).
 */
export function addDot(svg, transform, point, fill, r = 8) {
    const q = dataToPx(transform, point);
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', q.x); c.setAttribute('cy', q.y); c.setAttribute('r', r);
    c.setAttribute('fill', fill); c.setAttribute('stroke', 'white'); c.setAttribute('stroke-width', 2.5);
    svg.appendChild(c);
}

/*
 * drawLattice(svg, transform, panel, xStep, yStep)
 * Intent: Draw the red calibration reference lattice for one panel — verticals
 *         every xStep and horizontals every yStep across the panel's data
 *         ranges. Misalignment against the printed grid is the tuning signal.
 * Params: svg — target <svg>; transform — fitted affine; panel — calibration
 *         panel (xRange/yRange); xStep/yStep — lattice spacing in data units.
 * Returns: nothing (appends to the DOM).
 */
export function drawLattice(svg, transform, panel, xStep, yStep) {
    const [x0, x1] = panel.xRange;
    const [y0, y1] = panel.yRange;
    for (let x = x0; x <= x1 + 1e-9; x += xStep) {
        addPolyline(svg, transform, [{ x, y: y0 }, { x, y: y1 }], '#dc2626', 1);
    }
    for (let y = y0; y <= y1 + 1e-9; y += yStep) {
        addPolyline(svg, transform, [{ x: x0, y }, { x: x1, y }], '#dc2626', 1);
    }
}

/*
 * drawTraces(svg, transforms, traces, color)
 * Intent: Draw example result traces (from src/lib/chart-trace.js builders) —
 *         solid for the primary/cruise trace, dashed for the start trace. A
 *         polyline's points normally share its line.panel, but individual
 *         points may set their own `panel` to bridge into another panel's
 *         transform (used to draw the yRef line as one contiguous polyline
 *         across the gap between a chart's two panels) — mirrors the
 *         point-level override in src/ChartTraceOverlay.jsx.
 * Params: svg — target <svg>; transforms — {panelName: transform}; traces —
 *         builder output array; color — stroke color.
 * Returns: nothing (appends to the DOM).
 */
export function drawTraces(svg, transforms, traces, color = '#0f766e') {
    for (const trace of traces) {
        const dash = trace.id === 'start' ? '10 7' : null;
        for (const line of trace.polylines) {
            const el = document.createElementNS(SVG_NS, 'polyline');
            el.setAttribute('points', line.points.map(p => {
                const q = dataToPx(transforms[p.panel ?? line.panel], p);
                return `${q.x.toFixed(1)},${q.y.toFixed(1)}`;
            }).join(' '));
            el.setAttribute('fill', 'none');
            el.setAttribute('stroke', color);
            el.setAttribute('stroke-width', 3);
            el.setAttribute('vector-effect', 'non-scaling-stroke');
            if (dash) el.setAttribute('stroke-dasharray', dash);
            svg.appendChild(el);
        }
        for (const dot of trace.dots) {
            addDot(svg, transforms[dot.panel], dot, color);
        }
    }
}

/*
 * renderTracePoints(traces, el)
 * Intent: List, in plain numbers, exactly which data points the example trace is
 *         depicting — each dot's label and its data-space coordinates (x value on
 *         that panel's axis, y = yRef or CAS). This is the ground truth for
 *         judging the drawn trace: the dot must sit at these axis coordinates,
 *         regardless of where the printed curve lies.
 * Params: traces — builder output (dots carry label/x/y; traces carry inputs);
 *         el — element to render into.
 * Returns: nothing (fills el).
 */
export function renderTracePoints(traces, el) {
    if (!traces || traces.length === 0) {
        el.textContent = 'No trace drawn (inputs are off-chart).';
        return;
    }
    const fmt = n => (Math.round(n * 100) / 100).toString();
    el.innerHTML = traces.map(trace => {
        const inputs = trace.inputs
            ? Object.entries(trace.inputs).filter(([, v]) => v != null).map(([k, v]) => `${k} ${v}`).join(', ')
            : '';
        const dots = trace.dots
            .map(d => `<li>${d.label ?? d.panel}: <code>(${fmt(d.x)}, ${fmt(d.y)})</code> on the <b>${d.panel}</b> panel</li>`)
            .join('');
        return `<div><b>${trace.id} trace</b>${inputs ? ` — inputs: ${inputs}` : ''}<ul>${dots}</ul></div>`;
    }).join('');
}

/*
 * installClickReadout(img, calibration, outputEl)
 * Intent: Click anywhere on the chart image to read the click position in
 *         natural-pixel coordinates — the unit refPoints are written in — so
 *         anchors can be tuned by clicking true landmark positions.
 * Params: img — the chart <img>; calibration — entry (for natural size);
 *         outputEl — element whose textContent receives the readout.
 * Returns: nothing (installs a listener).
 */
export function installClickReadout(img, calibration, outputEl) {
    img.addEventListener('click', e => {
        const rect = img.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * calibration.image.width;
        const y = ((e.clientY - rect.top) / rect.height) * calibration.image.height;
        outputEl.textContent = `x: ${x.toFixed(0)}, y: ${y.toFixed(0)}`;
    });
}

/*
 * setupStage(imgId, svgId, calibration, imageFile)
 * Intent: Common page boot — point the <img> at the chart file (via Vite's
 *         BASE_URL so it works under the dev server's base path) and size the
 *         <svg> viewBox to the image's natural resolution.
 * Params: imgId/svgId — element ids; calibration — entry; imageFile — filename
 *         under public/charts/.
 * Returns: { img, svg } elements.
 */
export function setupStage(imgId, svgId, calibration, imageFile) {
    const img = document.getElementById(imgId);
    img.src = `${import.meta.env.BASE_URL}charts/${imageFile}`;
    const svg = document.getElementById(svgId);
    svg.setAttribute('viewBox', `0 0 ${calibration.image.width} ${calibration.image.height}`);
    return { img, svg };
}
