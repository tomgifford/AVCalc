// Builds the data-space geometry for tracing a climb calculation on the POH chart,
// exactly the way a pilot uses the paper chart: up from the temperature axis to the
// (interpolated) pressure-altitude position, horizontally across to the fuel/time/
// distance curves, then down from each intersection to the output axis. All
// coordinates returned here are in chart DATA space; ChartTraceOverlay maps them to
// pixels through the per-chart calibration. Values come from the same calc engine
// the app displays, so the trace is by construction consistent with the results.

import { getClimbYRef, getDist, getTime, getFuel } from './climb-calc.js';
import { getCruiseYRef, getCruiseTAS } from './cruise-calc.js';
import { getEngineYRef, getEngineRPM } from './engine-calc.js';
import { getIASfromCAS } from './airspeedcal-calc.js';

/*
 * buildSingleClimbTrace(climbData, panels, temp, pa, id)
 * Intent: Build one trace (one temperature/altitude point) as polylines + dots in
 *         data space. The horizontal segment intersects each output curve at
 *         exactly (outputValue, yRef), because the digitized curves are the
 *         functions value(yRef) — no curve-intersection search is needed.
 * Params: climbData — an aircraft's climb data module (yRefLookup, lookups).
 *         panels — calibration panels object (for axis ranges only).
 *         temp — OAT in °C at this altitude; pa — pressure altitude in ft.
 *         id — trace identifier ('cruise' | 'start') used for styling.
 * Returns: { id, polylines: [{ panel, points: [{x,y},...] }], dots: [{panel,x,y}] }
 *          or null when the point produces no drawable trace (yRef at/below 0, or
 *          above the chart's usable ceiling — the app already flags those results
 *          with a "> " prefix; we don't draw a misleading clamped trace).
 */
function buildSingleClimbTrace(climbData, panels, temp, pa, id) {
    const yRef = getClimbYRef(climbData, pa, temp);
    const [, oatMax] = panels.oat.xRange;
    const [outputMin] = panels.output.xRange;
    const [yMin, yMax] = panels.oat.yRange;
    if (!(yRef > yMin) || yRef > yMax || isNaN(yRef)) return null;

    const fuel = getFuel(climbData, yRef);
    const time = getTime(climbData, yRef);
    const dist = getDist(climbData, yRef);
    const vMax = Math.max(fuel, time, dist);

    return {
        id,
        // Echo of the inputs this trace depicts — consumed by the verification
        // pages' "points depicted" readout (and available for future tooltips).
        inputs: { temp, pa },
        polylines: [
            // Up from the temp axis to the interpolated PA position, then right
            // across the OAT panel and on into the output panel's left edge — one
            // polyline bridging both panels' transforms, so it reads as a single
            // contiguous line across the gap between the two chart images.
            { panel: 'oat', points: [
                { x: temp, y: 0 }, { x: temp, y: yRef }, { x: oatMax, y: yRef },
                { panel: 'output', x: outputMin, y: yRef },
            ] },
            // Continue horizontally across the output panel to the farthest curve.
            { panel: 'output', points: [{ x: outputMin, y: yRef }, { x: vMax, y: yRef }] },
            // Drop from each curve intersection down to the output axis.
            { panel: 'output', points: [{ x: fuel, y: yRef }, { x: fuel, y: 0 }] },
            { panel: 'output', points: [{ x: time, y: yRef }, { x: time, y: 0 }] },
            { panel: 'output', points: [{ x: dist, y: yRef }, { x: dist, y: 0 }] },
        ],
        dots: [
            // The interpolated PA point — usually BETWEEN printed curves; showing it
            // is the point of the feature.
            { panel: 'oat', x: temp, y: yRef, label: `PA ${pa} ft @ ${temp} °C` },
            { panel: 'output', x: fuel, y: yRef, label: 'fuel (gal)' },
            { panel: 'output', x: time, y: yRef, label: 'time (min)' },
            { panel: 'output', x: dist, y: yRef, label: 'dist (nm)' },
        ],
    };
}

/*
 * buildClimbTraces(climbData, calibration, inputs)
 * Intent: Build both traces for a climb result — the cruise/target point and the
 *         start point — mirroring the worked example Piper prints on the chart
 *         itself (net values = target minus start).
 * Params: climbData — an aircraft's climb data module.
 *         calibration — the chart's calibration entry (panels provide axis ranges).
 *         inputs — { T, ST, paTarget, paStart }: cruise OAT °C, start OAT °C,
 *         cruise pressure altitude ft, start pressure altitude ft.
 * Returns: array of trace objects (0-2 entries; see buildSingleClimbTrace).
 */
export function buildClimbTraces(climbData, calibration, { T, ST, paTarget, paStart }) {
    const panels = calibration.panels;
    const traces = [];
    const cruise = buildSingleClimbTrace(climbData, panels, T, paTarget, 'cruise');
    const start = buildSingleClimbTrace(climbData, panels, ST, paStart, 'start');
    if (cruise) traces.push(cruise);
    if (start) traces.push(start);
    return traces;
}

/*
 * buildCruiseTraces(cruiseData, calibration, inputs)
 * Intent: Trace a cruise TAS lookup on the cruise chart: up from the OAT axis to
 *         the interpolated PA position, across to the selected %-power line (or
 *         the max-TAS curve when beyond it — getCruiseTAS already handles that
 *         fallback), then down to the TAS axis.
 * Params: cruiseData — aircraft cruise data module; calibration — chart entry
 *         (panels oat/tas); inputs — { oat °C, pa ft, power 75|65|55 }.
 * Returns: array with one trace, or [] when the point is off-chart. NOTE: the
 *          traced TAS is the CHART value (wheel fairings installed) — the app's
 *          displayed TAS may be lower by noFairingsTASDeduction, which is a
 *          printed-note adjustment applied after reading the chart, not a
 *          different chart position.
 */
export function buildCruiseTraces(cruiseData, calibration, { oat, pa, power }) {
    const { oat: oatPanel, tas: tasPanel } = calibration.panels;
    const yRef = getCruiseYRef(cruiseData, pa, oat);
    if (yRef === null || !(yRef > oatPanel.yRange[0]) || yRef > oatPanel.yRange[1]) return [];
    const tas = getCruiseTAS(cruiseData, pa, oat, power, 'yes');
    if (tas === null) return [];

    return [{
        id: 'cruise',
        inputs: { oat, pa, power },
        polylines: [
            // Bridges from the OAT panel into the TAS panel's left edge, so the
            // yRef line reads as one contiguous polyline across the panel gap.
            { panel: 'oat', points: [
                { x: oat, y: 0 }, { x: oat, y: yRef }, { x: oatPanel.xRange[1], y: yRef },
                { panel: 'tas', x: tasPanel.xRange[0], y: yRef },
            ] },
            { panel: 'tas', points: [{ x: tasPanel.xRange[0], y: yRef }, { x: tas, y: yRef }] },
            { panel: 'tas', points: [{ x: tas, y: yRef }, { x: tas, y: 0 }] },
        ],
        dots: [
            { panel: 'oat', x: oat, y: yRef, label: `PA ${pa} ft @ ${oat} °C` },
            { panel: 'tas', x: tas, y: yRef, label: `TAS (kt) @ ${power}%` },
        ],
    }];
}

/*
 * buildEngineTraces(engineData, calibration, inputs)
 * Intent: Trace an RPM lookup on the engine chart: up from the OAT axis to the
 *         interpolated PA position, across to the %-power line (or the max-RPM
 *         curve when beyond it), then down to the RPM axis. When an explicit rpm
 *         is given (manual RPM entry on the Engine view), the drop is at that
 *         RPM instead of the power line's value.
 * Params: engineData — aircraft engine data module; calibration — chart entry
 *         (panels oat/rpm); inputs — { oat °C, pa ft, power, rpm? }.
 * Returns: array with one trace, or [] when the point is off-chart.
 */
export function buildEngineTraces(engineData, calibration, { oat, pa, power, rpm }) {
    const { oat: oatPanel, rpm: rpmPanel } = calibration.panels;
    const yRef = getEngineYRef(engineData, pa, oat);
    if (yRef === null || !(yRef > oatPanel.yRange[0]) || yRef > oatPanel.yRange[1]) return [];

    let rpmValue = rpm;
    if (rpmValue == null) {
        const result = getEngineRPM(engineData, yRef, power);
        rpmValue = result?.rpm ?? null;
    }
    if (rpmValue == null || rpmValue < rpmPanel.xRange[0] || rpmValue > rpmPanel.xRange[1]) return [];

    return [{
        id: 'cruise',
        inputs: { oat, pa, power, rpm },
        polylines: [
            // Bridges from the OAT panel into the RPM panel's left edge, so the
            // yRef line reads as one contiguous polyline across the panel gap.
            { panel: 'oat', points: [
                { x: oat, y: 0 }, { x: oat, y: yRef }, { x: oatPanel.xRange[1], y: yRef },
                { panel: 'rpm', x: rpmPanel.xRange[0], y: yRef },
            ] },
            { panel: 'rpm', points: [{ x: rpmPanel.xRange[0], y: yRef }, { x: rpmValue, y: yRef }] },
            { panel: 'rpm', points: [{ x: rpmValue, y: yRef }, { x: rpmValue, y: 0 }] },
        ],
        dots: [
            { panel: 'oat', x: oat, y: yRef, label: `PA ${pa} ft @ ${oat} °C` },
            { panel: 'rpm', x: rpmValue, y: yRef, label: rpm != null ? 'RPM (manual entry)' : `RPM @ ${power}%` },
        ],
    }];
}

/*
 * buildAirspeedCalTrace(airspeedData, calibration, inputs)
 * Intent: Trace a CAS -> IAS conversion on the airspeed-calibration chart:
 *         horizontally from the CAS axis to the calibration curve, then down to
 *         the IAS axis.
 * Params: airspeedData — aircraft airspeedCal data; calibration — chart entry
 *         (single panel 'cal', or per-flap panels 'flapsUp'/'flaps40' on charts
 *         with separate sub-charts); inputs — { cas kt, flaps }.
 * Returns: array with one trace, or [] when off-chart / not computable.
 */
export function buildAirspeedCalTrace(airspeedData, calibration, { cas, flaps = 'flapsUp' }) {
    const panelName = calibration.panels[flaps] ? flaps : 'cal';
    const panel = calibration.panels[panelName];
    if (!panel) return [];
    const ias = getIASfromCAS(airspeedData, cas, flaps);
    if (ias === null) return [];
    if (cas < panel.yRange[0] || cas > panel.yRange[1] || ias < panel.xRange[0] || ias > panel.xRange[1]) return [];

    return [{
        id: 'cruise',
        inputs: { cas, flaps },
        polylines: [
            { panel: panelName, points: [{ x: panel.xRange[0], y: cas }, { x: ias, y: cas }] },
            { panel: panelName, points: [{ x: ias, y: cas }, { x: ias, y: panel.yRange[0] }] },
        ],
        dots: [{ panel: panelName, x: ias, y: cas, label: `IAS (kt) @ CAS ${cas} kt, ${flaps}` }],
    }];
}
