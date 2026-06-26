function interpYRefAtT(points, T) {
    if (T <= points[0].t) return points[0].yRef;
    if (T >= points.at(-1).t) return points.at(-1).yRef;
    for (let i = 0; i < points.length - 1; i++) {
        if (T >= points[i].t && T <= points[i + 1].t) {
            const p0 = points[i], p1 = points[i + 1];
            return p0.yRef + (p1.yRef - p0.yRef) * (T - p0.t) / (p1.t - p0.t);
        }
    }
    return null;
}

function interpRPMAtYRef(table, yRef) {
    if (yRef <= table[0].yRef) return { rpm: table[0].rpm, outOfRange: false };
    if (yRef > table.at(-1).yRef) return { rpm: null, outOfRange: true };
    for (let i = 0; i < table.length - 1; i++) {
        if (yRef >= table[i].yRef && yRef <= table[i + 1].yRef) {
            const a = table[i], b = table[i + 1];
            return { rpm: a.rpm + (b.rpm - a.rpm) * (yRef - a.yRef) / (b.yRef - a.yRef), outOfRange: false };
        }
    }
    return { rpm: null, outOfRange: true };
}

function interpRPMOnMaxCurve(maxCurve, yRef) {
    if (yRef <= maxCurve[0].yRef) return maxCurve[0].rpm;
    if (yRef >= maxCurve.at(-1).yRef) return maxCurve.at(-1).rpm;
    for (let i = 0; i < maxCurve.length - 1; i++) {
        if (yRef >= maxCurve[i].yRef && yRef <= maxCurve[i + 1].yRef) {
            const a = maxCurve[i], b = maxCurve[i + 1];
            return a.rpm + (b.rpm - a.rpm) * (yRef - a.yRef) / (b.yRef - a.yRef);
        }
    }
    return maxCurve.at(-1).rpm;
}

// Returns { rpm, outOfRange } — outOfRange true when yRef exceeds the table max for the chosen power line.
// Two signatures:
//   getEngineRPM(data, yRef, power)       — yRef already computed
//   getEngineRPM(data, pa, T, power)      — computes yRef internally
export function getEngineRPM(data, ...args) {
    let yRef, power;
    if (args.length === 2) {
        [yRef, power] = args;
    } else {
        const [pa, T, pwr] = args;
        yRef = getEngineYRef(data, pa, T);
        power = pwr;
    }
    if (yRef === null) return null;
    const table = data.rpmLookup?.[power];
    if (!table || table.length === 0) return null;
    const result = interpRPMAtYRef(table, yRef);
    if (result.outOfRange && data.engineMaxRPM) {
        return { rpm: interpRPMOnMaxCurve(data.engineMaxRPM, yRef), outOfRange: true };
    }
    return result;
}

// Returns { power, outOfRange } — interpolated % power for a given RPM at the computed YREF.
// Two signatures:
//   getPowerFromRPM(data, yRef, userRPM)     — yRef already computed
//   getPowerFromRPM(data, pa, T, userRPM)    — computes yRef internally
export function getPowerFromRPM(data, ...args) {
    let yRef, userRPM;
    if (args.length === 2) {
        [yRef, userRPM] = args;
    } else {
        const [pa, T, rpm] = args;
        yRef = getEngineYRef(data, pa, T);
        userRPM = rpm;
    }
    if (yRef === null || userRPM === null) return null;

    const keys = Object.keys(data.rpmLookup).map(Number).sort((a, b) => a - b);
    if (keys.length < 2) return null;

    const points = [];
    for (const key of keys) {
        const table = data.rpmLookup[key];
        if (!table || table.length === 0) continue;
        const { rpm, outOfRange } = interpRPMAtYRef(table, yRef);
        if (outOfRange || rpm === null) continue;
        points.push({ power: key, rpm });
    }

    if (points.length < 2) return { power: null, outOfRange: true };
    points.sort((a, b) => a.power - b.power);

    if (userRPM < points[0].rpm) return { power: null, outOfRange: true };

    if (userRPM <= points.at(-1).rpm) {
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i], p1 = points[i + 1];
            if (userRPM >= p0.rpm && userRPM <= p1.rpm) {
                const power = p0.power + (p1.power - p0.power) * (userRPM - p0.rpm) / (p1.rpm - p0.rpm);
                return { power, outOfRange: false };
            }
        }
        return { power: points.at(-1).power, outOfRange: false };
    }

    // userRPM exceeds highest in-range power line — extrapolate using top two lines
    if (userRPM > 2700) return { power: null, outOfRange: true };
    const p0 = points.at(-2), p1 = points.at(-1);
    if (p1.rpm === p0.rpm) return { power: null, outOfRange: true };
    const slope = (p1.power - p0.power) / (p1.rpm - p0.rpm);
    return { power: p1.power + (userRPM - p1.rpm) * slope, outOfRange: false };
}

export function getEngineYRef(data, pa, T) {
    const { yRefLookup } = data;
    if (!yRefLookup || yRefLookup.length === 0) return null;
    if (pa <= yRefLookup[0].pa) return interpYRefAtT(yRefLookup[0].points, T);
    if (pa >= yRefLookup.at(-1).pa) return interpYRefAtT(yRefLookup.at(-1).points, T);
    for (let i = 0; i < yRefLookup.length - 1; i++) {
        if (pa >= yRefLookup[i].pa && pa <= yRefLookup[i + 1].pa) {
            const yRef0 = interpYRefAtT(yRefLookup[i].points, T);
            const yRef1 = interpYRefAtT(yRefLookup[i + 1].points, T);
            return yRef0 + (yRef1 - yRef0) * (pa - yRefLookup[i].pa) / (yRefLookup[i + 1].pa - yRefLookup[i].pa);
        }
    }
    return null;
}
