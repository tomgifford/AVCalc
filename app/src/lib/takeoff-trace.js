/*
 * buildTakeoffTraces(aircraftType, chartType, calibration, inputs)
 * Intent: Build example traces for a 3-pane takeoff chart by calling the
 *         REST API for intermediate values (pa, yRef1, yRef2, distanceFt),
 *         then mapping those to data-space polylines for drawTraces().
 * Params: aircraftType — e.g. 'pa28-161'.
 *         chartType    — 'obstacle' or 'roll'.
 *         calibration  — getChartCalibration() result for this chart.
 *         inputs       — { altitudeFt, altimeterInHg, oatC, weightLbs, windKts, flapDeg }
 *                        windKts > 0 = headwind, < 0 = tailwind, 0 = calm.
 *                        flapDeg defaults to 0 if omitted.
 * Returns: Promise resolving to an array of trace objects for drawTraces().
 */
export async function buildTakeoffTraces(aircraftType, chartType, calibration, { altitudeFt, altimeterInHg, oatC, weightLbs, windKts, flapDeg = 0 }) {
    const params = new URLSearchParams({
        aircraftType,
        altitude: altitudeFt,
        altimeter: altimeterInHg,
        oat: oatC,
        weight: weightLbs,
        windKts,
        flapDeg,
    });
    const res = await fetch(`/v1/aircraft/${aircraftType}/takeoff/${chartType}?${params}`);
    if (!res.ok) throw new Error(`Takeoff API error: ${res.status}`);
    const { pa, yRef1, yRef2, distanceFt } = await res.json();

    const { oat: oatPanel, weight: weightPanel, wind: windPanel } = calibration.panels;
    if (!oatPanel || !weightPanel || !windPanel) return [];

    const [yMin, yMax] = oatPanel.yRange;
    if (!(yRef1 > yMin) || yRef1 > yMax) return [];

    const isHeadwind = windKts >= 0;
    const absWind = Math.abs(windKts);
    const distOffset = windPanel.distOffset ?? 0;
    const distScale  = windPanel.distScale  ?? 100;
    const distToY = d => (d - distOffset) / distScale;

    return [{
        id: 'cruise',
        inputs: { pa: Math.round(pa), oatC, weightLbs, windKts, isHeadwind },
        polylines: [
            // Pane 1 (oat): vertical up from OAT axis to yRef1, then right to panel edge.
            { panel: 'oat', points: [
                { x: oatC, y: oatPanel.yRange[0] },
                { x: oatC, y: yRef1 },
                { x: oatPanel.xRange[1], y: yRef1 },
            ] },
            // Pane 2 (weight): enter at heavy edge at yRef1, diagonal to aircraft
            // weight at yRef2, then carry yRef2 horizontally to the light edge.
            { panel: 'weight', points: [
                { x: weightPanel.xRange[1], y: yRef1 },
                { x: weightLbs, y: yRef2 },
                { x: weightPanel.xRange[0], y: yRef2 },
            ] },
            // Pane 3 (wind): slope from (0, yRef2) along the wind curve to the
            // final distance, using per-chart distOffset/distScale from calibration.
            { panel: 'wind', points: [
                { x: windPanel.xRange[0], y: yRef2 },
                { x: absWind, y: distToY(distanceFt) },
            ] },
            // Drop from wind intercept down to wind axis.
            { panel: 'wind', points: [
                { x: absWind, y: distToY(distanceFt) },
                { x: absWind, y: windPanel.yRange[0] },
            ] },
        ],
        dots: [
            { panel: 'oat',    x: oatC,      y: yRef1,            label: `yRef1 ${yRef1.toFixed(1)} (PA ${Math.round(pa)} ft, ${oatC} °C)` },
            { panel: 'weight', x: weightLbs, y: yRef2,            label: `yRef2 ${yRef2.toFixed(1)} at ${weightLbs} lbs` },
            { panel: 'wind',   x: absWind,   y: distToY(distanceFt), label: `${distanceFt != null ? Math.round(distanceFt) : '?'} ft @ ${absWind} kt ${isHeadwind ? 'HW' : 'TW'}` },
        ],
    }];
}
