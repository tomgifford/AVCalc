import { cruiseYRefLookup, cruiseTASLookup, cruiseFuelGPH } from './pa28-161-cruise-data.js';

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

export function getCruiseYRef(pa, oat) {
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

export function getCruiseTAS(pa, oat, power) {
    const yRef = getCruiseYRef(pa, oat);
    const table = cruiseTASLookup[power];
    if (!table) return null;
    if (yRef <= table[0].yRef) return table[0].tas;
    if (yRef >= table.at(-1).yRef) return table.at(-1).tas;
    for (let i = 0; i < table.length - 1; i++) {
        if (yRef >= table[i].yRef && yRef <= table[i + 1].yRef) {
            const t0 = table[i], t1 = table[i + 1];
            return t0.tas + (t1.tas - t0.tas) * (yRef - t0.yRef) / (t1.yRef - t0.yRef);
        }
    }
    return null;
}

export { cruiseFuelGPH };
