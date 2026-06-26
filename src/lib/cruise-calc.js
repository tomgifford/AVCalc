function interpYRefAtT(points, T) {
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

function interpTASOnMaxCurve(maxCurve, yRef) {
    if (yRef <= maxCurve[0].yRef) return maxCurve[0].tas;
    if (yRef >= maxCurve.at(-1).yRef) return maxCurve.at(-1).tas;
    for (let i = 0; i < maxCurve.length - 1; i++) {
        if (yRef >= maxCurve[i].yRef && yRef <= maxCurve[i + 1].yRef) {
            const p0 = maxCurve[i], p1 = maxCurve[i + 1];
            return p0.tas + (p1.tas - p0.tas) * (yRef - p0.yRef) / (p1.yRef - p0.yRef);
        }
    }
    return maxCurve.at(-1).tas;
}

export function getCruiseYRef(data, pa, oat) {
    const { cruiseYRefLookup } = data;
    if (pa <= cruiseYRefLookup[0].pa) return interpYRefAtT(cruiseYRefLookup[0].points, oat);
    if (pa >= cruiseYRefLookup.at(-1).pa) return interpYRefAtT(cruiseYRefLookup.at(-1).points, oat);
    for (let i = 0; i < cruiseYRefLookup.length - 1; i++) {
        if (pa >= cruiseYRefLookup[i].pa && pa <= cruiseYRefLookup[i + 1].pa) {
            const yRef0 = interpYRefAtT(cruiseYRefLookup[i].points, oat);
            const yRef1 = interpYRefAtT(cruiseYRefLookup[i + 1].points, oat);
            return yRef0 + (yRef1 - yRef0) * (pa - cruiseYRefLookup[i].pa) / (cruiseYRefLookup[i + 1].pa - cruiseYRefLookup[i].pa);
        }
    }
    return 0;
}

export function getCruiseTAS(data, pa, oat, power, wheelFairings) {
    const { cruiseTASLookup, cruiseMaxTAS } = data;
    const yRef = getCruiseYRef(data, pa, oat);
    const table = cruiseTASLookup[power];
    if (!table) return null;
    let tas;
    if (yRef <= table[0].yRef) tas = table[0].tas;
    else if (yRef > table.at(-1).yRef) tas = cruiseMaxTAS ? interpTASOnMaxCurve(cruiseMaxTAS, yRef) : table.at(-1).tas;
    else {
        tas = null;
        for (let i = 0; i < table.length - 1; i++) {
            if (yRef >= table[i].yRef && yRef <= table[i + 1].yRef) {
                const t0 = table[i], t1 = table[i + 1];
                tas = t0.tas + (t1.tas - t0.tas) * (yRef - t0.yRef) / (t1.yRef - t0.yRef);
                break;
            }
        }
    }
    if (tas !== null && wheelFairings === 'no') tas -= data.noFairingsTASDeduction;
    return tas;
}
