import { calculatePressureAltitude } from './climb-calc.js';

/*
 * interpYRef1AtT(points, T)
 * Intent: Interpolate yRef1 at a given temperature along one PA line's points.
 * Params: points — array of {t, yRef}; T — OAT in °C.
 * Returns: interpolated yRef value.
 */
function interpYRef1AtT(points, T) {
    if (T <= points[0].t) return points[0].yRef;
    if (T >= points.at(-1).t) return points.at(-1).yRef;
    for (let i = 0; i < points.length - 1; i++) {
        if (T >= points[i].t && T <= points[i + 1].t) {
            const p0 = points[i], p1 = points[i + 1];
            return p0.yRef + (p1.yRef - p0.yRef) * (T - p0.t) / (p1.t - p0.t);
        }
    }
    return 0;
}

/*
 * getTakeoffYRef1(data, pa, T)
 * Intent: Map pressure altitude and OAT through the left pane to produce yRef1.
 *         Uses the same 2D interpolation algorithm as getClimbYRef.
 * Params: data — takeoff data module (yRef1Lookup required).
 *         pa — pressure altitude (ft); T — OAT at field elevation (°C).
 * Returns: interpolated yRef1 value.
 */
export function getTakeoffYRef1(data, pa, T) {
    const { yRef1Lookup } = data;
    if (pa <= yRef1Lookup[0].pa) return interpYRef1AtT(yRef1Lookup[0].points, T);
    if (pa >= yRef1Lookup.at(-1).pa) return interpYRef1AtT(yRef1Lookup.at(-1).points, T);
    for (let i = 0; i < yRef1Lookup.length - 1; i++) {
        if (pa >= yRef1Lookup[i].pa && pa <= yRef1Lookup[i + 1].pa) {
            const lo = interpYRef1AtT(yRef1Lookup[i].points, T);
            const hi = interpYRef1AtT(yRef1Lookup[i + 1].points, T);
            return lo + (hi - lo) * (pa - yRef1Lookup[i].pa) / (yRef1Lookup[i + 1].pa - yRef1Lookup[i].pa);
        }
    }
    return 0;
}

/*
 * interpWeightAtW(points, weight)
 * Intent: Interpolate yRef2 at a given weight along one weightLookup row.
 * Params: points — array of {weight, yRef2}; weight — gross weight (lbs).
 * Returns: interpolated yRef2 value.
 */
function interpWeightAtW(points, weight) {
    if (weight <= points[0].weight) return points[0].yRef2;
    if (weight >= points.at(-1).weight) return points.at(-1).yRef2;
    for (let i = 0; i < points.length - 1; i++) {
        if (weight >= points[i].weight && weight <= points[i + 1].weight) {
            const p0 = points[i], p1 = points[i + 1];
            return p0.yRef2 + (p1.yRef2 - p0.yRef2) * (weight - p0.weight) / (p1.weight - p0.weight);
        }
    }
    return 0;
}

/*
 * getTakeoffYRef2(data, yRef1, weight)
 * Intent: Map yRef1 and gross weight through the middle pane to produce yRef2.
 *         Bilinear interpolation: outer dim = yRef1, inner dim = weight.
 *         When yRef1 falls below the lowest table row, extrapolates using the
 *         slope between the first two rows (parallel to the bottom reference
 *         line on the printed chart) rather than clamping.
 * Params: data — takeoff data module (weightLookup required).
 *         yRef1 — output of getTakeoffYRef1; weight — gross weight (lbs).
 * Returns: interpolated yRef2 value.
 */
export function getTakeoffYRef2(data, yRef1, weight) {
    const { weightLookup } = data;
    if (yRef1 <= weightLookup[0].yRef1) {
        const lo = interpWeightAtW(weightLookup[0].points, weight);
        const hi = interpWeightAtW(weightLookup[1].points, weight);
        return lo + (hi - lo) * (yRef1 - weightLookup[0].yRef1) / (weightLookup[1].yRef1 - weightLookup[0].yRef1);
    }
    if (yRef1 >= weightLookup.at(-1).yRef1) return interpWeightAtW(weightLookup.at(-1).points, weight);
    for (let i = 0; i < weightLookup.length - 1; i++) {
        if (yRef1 >= weightLookup[i].yRef1 && yRef1 <= weightLookup[i + 1].yRef1) {
            const lo = interpWeightAtW(weightLookup[i].points, weight);
            const hi = interpWeightAtW(weightLookup[i + 1].points, weight);
            return lo + (hi - lo) * (yRef1 - weightLookup[i].yRef1) / (weightLookup[i + 1].yRef1 - weightLookup[i].yRef1);
        }
    }
    return 0;
}

/*
 * interpDistAtWind(rows, yRef2, windKts)
 * Intent: 2D interpolation over a wind lookup table (headwind or tailwind).
 *         Outer dim = yRef2, inner dim = windKts.
 * Params: rows — headwindLookup or tailwindLookup array; yRef2 — index from
 *         middle pane; windKts — wind component magnitude (knots, always ≥ 0).
 * Returns: distance in feet, or null if yRef2 is completely off-chart.
 */
function interpDistAtWind(rows, yRef2, windKts) {
    let loRow, hiRow;
    if (yRef2 <= rows[0].yRef2) {
        loRow = hiRow = rows[0];
    } else if (yRef2 >= rows.at(-1).yRef2) {
        loRow = hiRow = rows.at(-1);
    } else {
        for (let i = 0; i < rows.length - 1; i++) {
            if (yRef2 >= rows[i].yRef2 && yRef2 <= rows[i + 1].yRef2) {
                loRow = rows[i];
                hiRow = rows[i + 1];
                break;
            }
        }
    }
    if (!loRow) return null;

    function interpWind(pts, w) {
        if (w <= pts[0].windKts) return pts[0].dist;
        if (w >= pts.at(-1).windKts) return pts.at(-1).dist;
        for (let i = 0; i < pts.length - 1; i++) {
            if (w >= pts[i].windKts && w <= pts[i + 1].windKts) {
                const p0 = pts[i], p1 = pts[i + 1];
                return p0.dist + (p1.dist - p0.dist) * (w - p0.windKts) / (p1.windKts - p0.windKts);
            }
        }
        return pts.at(-1).dist;
    }

    if (loRow === hiRow) return interpWind(loRow.points, windKts);
    const lo = interpWind(loRow.points, windKts);
    const hi = interpWind(hiRow.points, windKts);
    return lo + (hi - lo) * (yRef2 - loRow.yRef2) / (hiRow.yRef2 - loRow.yRef2);
}

/*
 * getTakeoffDist(data, yRef2, windKts, isHeadwind)
 * Intent: Map yRef2 and wind component through the right pane to produce
 *         takeoff distance (either over 50 ft or ground roll, per data module).
 * Params: data — takeoff data module (headwindLookup + tailwindLookup required).
 *         yRef2 — output of getTakeoffYRef2.
 *         windKts — wind speed magnitude (knots, always ≥ 0).
 *         isHeadwind — true for headwind (reduces distance), false for tailwind.
 * Returns: distance in feet.
 */
export function getTakeoffDist(data, yRef2, windKts, isHeadwind) {
    const table = isHeadwind ? data.headwindLookup : data.tailwindLookup;
    return interpDistAtWind(table, yRef2, windKts);
}

/*
 * calculateTakeoffPerformance(data, altitudeFt, altimeterInHg, oatC, weightLbs, windKts)
 * Intent: Full three-stage takeoff distance calculation matching the POH chart
 *         pipeline: pressure altitude → yRef1 → yRef2 → distance.
 * Params: data — takeoff data module (takeoff50 or takeoffroll).
 *         altitudeFt — field indicated altitude (ft MSL).
 *         altimeterInHg — altimeter setting (inHg).
 *         oatC — outside air temperature at field (°C).
 *         weightLbs — gross weight at takeoff (lbs).
 *         windKts — wind component on takeoff heading (positive = headwind,
 *                   negative = tailwind, 0 = calm).
 * Returns: { pa, yRef1, yRef2, distanceFt }
 */
export function calculateTakeoffPerformance(data, altitudeFt, altimeterInHg, oatC, weightLbs, windKts) {
    const { pa } = calculatePressureAltitude(altitudeFt, altimeterInHg);
    const yRef1 = getTakeoffYRef1(data, pa, oatC);
    const yRef2 = getTakeoffYRef2(data, yRef1, weightLbs);
    const isHeadwind = windKts >= 0;
    const absWind = Math.abs(windKts);
    const distanceFt = getTakeoffDist(data, yRef2, absWind, isHeadwind);
    return { pa, yRef1, yRef2, distanceFt };
}
