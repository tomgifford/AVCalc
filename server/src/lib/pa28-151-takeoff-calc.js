import { calculatePressureAltitude } from './climb-calc.js';
import { getTakeoffYRef1 } from './takeoff-calc.js';

/*
 * interpDistAtYRef(points, yRef)
 * Intent: Piecewise-linear interpolation of distance along one named wind curve.
 * Params: points — array of { yRef, dist } sorted ascending by yRef.
 *         yRef — reference value from the OAT panel.
 * Returns: interpolated distance (ft), clamped at the table endpoints.
 */
function interpDistAtYRef(points, yRef) {
    if (yRef <= points[0].yRef) return points[0].dist;
    if (yRef >= points.at(-1).yRef) return points.at(-1).dist;
    for (let i = 0; i < points.length - 1; i++) {
        if (yRef >= points[i].yRef && yRef <= points[i + 1].yRef) {
            const p0 = points[i], p1 = points[i + 1];
            return p0.dist + (p1.dist - p0.dist) * (yRef - p0.yRef) / (p1.yRef - p0.yRef);
        }
    }
    return points.at(-1).dist;
}

/*
 * getPA151TakeoffYRef(data, pa, T)
 * Intent: Map pressure altitude and OAT through the left pane to produce yRef.
 *         Thin wrapper around getTakeoffYRef1 — the PA-28-151 left pane has the
 *         same structure as all other supported aircraft.
 * Params: data — PA-151 takeoff data module (yRef1Lookup required).
 *         pa — pressure altitude (ft); T — OAT at field elevation (°C).
 * Returns: interpolated yRef value.
 */
export function getPA151TakeoffYRef(data, pa, T) {
    return getTakeoffYRef1(data, pa, T);
}

/*
 * getPA151TakeoffDist(lookup, yRef, windKts)
 * Intent: Interpolate takeoff distance from a three-curve wind lookup table.
 *         The lookup has named curves: 'calm' (0 kt), 'hw15' (15 kt headwind),
 *         'tw5' (5 kt tailwind). Positive windKts = headwind, negative = tailwind.
 *         Interpolation is linear between calm and the relevant boundary curve,
 *         clamped at the boundary (no extrapolation beyond hw15 or tw5).
 * Params: lookup — groundRollLookup or takeoffPerfLookup array from data module.
 *         yRef — output of getPA151TakeoffYRef.
 *         windKts — wind component (positive = headwind, negative = tailwind).
 * Returns: takeoff distance (ft).
 */
export function getPA151TakeoffDist(lookup, yRef, windKts) {
    const calm = lookup.find(c => c.name === 'calm');
    const hw15 = lookup.find(c => c.name === 'hw15');
    const tw5  = lookup.find(c => c.name === 'tw5');

    const distCalm = interpDistAtYRef(calm.points, yRef);

    if (windKts >= 0) {
        const t = Math.min(windKts / 15, 1);
        const distHW15 = interpDistAtYRef(hw15.points, yRef);
        return distCalm + (distHW15 - distCalm) * t;
    } else {
        const t = Math.min(Math.abs(windKts) / 5, 1);
        const distTW5 = interpDistAtYRef(tw5.points, yRef);
        return distCalm + (distTW5 - distCalm) * t;
    }
}

/*
 * calculatePA151TakeoffPerformance(data, chartType, altitudeFt, altimeterInHg, oatC, windKts)
 * Intent: Full two-stage takeoff distance calculation for PA-28-151 charts:
 *         pressure altitude → yRef → distance. Weight is always max gross.
 * Params: data       — PA-151 takeoff data module (yRef1Lookup, groundRollLookup,
 *                      takeoffPerfLookup required).
 *         chartType  — 'obstacle' for 50 ft clearance, 'roll' for ground roll.
 *         altitudeFt — field indicated altitude (ft MSL).
 *         altimeterInHg — altimeter setting (inHg).
 *         oatC       — outside air temperature at field (°C).
 *         windKts    — wind component on takeoff heading (positive = headwind,
 *                      negative = tailwind, 0 = calm).
 * Returns: { pa, yRef, distanceFt }
 */
export function calculatePA151TakeoffPerformance(data, chartType, altitudeFt, altimeterInHg, oatC, windKts) {
    const { pa } = calculatePressureAltitude(altitudeFt, altimeterInHg);
    const yRef = getPA151TakeoffYRef(data, pa, oatC);
    const lookup = chartType === 'obstacle' ? data.takeoffPerfLookup : data.groundRollLookup;
    const distanceFt = getPA151TakeoffDist(lookup, yRef, windKts);
    return { pa, yRef, distanceFt };
}
