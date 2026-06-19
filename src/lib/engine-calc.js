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
    if (yRef <= table[0].yRef) return { rpm: table[0].rpm, outOfRange: false };
    if (yRef >= table.at(-1).yRef) return { rpm: null, outOfRange: true };
    for (let i = 0; i < table.length - 1; i++) {
        if (yRef >= table[i].yRef && yRef <= table[i + 1].yRef) {
            const a = table[i], b = table[i + 1];
            return { rpm: a.rpm + (b.rpm - a.rpm) * (yRef - a.yRef) / (b.yRef - a.yRef), outOfRange: false };
        }
    }
    return null;
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
