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

export function getClimbYRef(data, pa, T) {
    const { yRefLookup } = data;
    if (pa <= yRefLookup[0].pa) return interpYRefAtT(yRefLookup[0].points, T);
    if (pa >= yRefLookup.at(-1).pa) return interpYRefAtT(yRefLookup.at(-1).points, T);
    for (let i = 0; i < yRefLookup.length - 1; i++) {
        if (pa >= yRefLookup[i].pa && pa <= yRefLookup[i + 1].pa) {
            const yRef0 = interpYRefAtT(yRefLookup[i].points, T);
            const yRef1 = interpYRefAtT(yRefLookup[i + 1].points, T);
            return yRef0 + (yRef1 - yRef0) * (pa - yRefLookup[i].pa) / (yRefLookup[i + 1].pa - yRefLookup[i].pa);
        }
    }
    return 0;
}

export function getDist(data, yRef) {
    const { climbDistLookup } = data;
    if (yRef <= 0) return 0;
    if (yRef >= climbDistLookup.at(-1).yRef) return climbDistLookup.at(-1).dist;
    for (let i = 0; i < climbDistLookup.length - 1; i++) {
        if (yRef >= climbDistLookup[i].yRef && yRef <= climbDistLookup[i + 1].yRef) {
            const d0 = climbDistLookup[i], d1 = climbDistLookup[i + 1];
            return d0.dist + (d1.dist - d0.dist) * (yRef - d0.yRef) / (d1.yRef - d0.yRef);
        }
    }
    return 0;
}

export function getTime(data, yRef) {
    const { timeLookup } = data;
    if (yRef <= 0) return 0;
    if (yRef >= timeLookup.at(-1).yRef) return timeLookup.at(-1).time;
    for (let i = 0; i < timeLookup.length - 1; i++) {
        if (yRef >= timeLookup[i].yRef && yRef <= timeLookup[i + 1].yRef) {
            const t0 = timeLookup[i], t1 = timeLookup[i + 1];
            return t0.time + (t1.time - t0.time) * (yRef - t0.yRef) / (t1.yRef - t0.yRef);
        }
    }
    return 0;
}

export function getFuel(data, yRef) {
    const { fuelLookup } = data;
    if (yRef <= 0) return 0;
    if (yRef >= fuelLookup.at(-1).yRef) return fuelLookup.at(-1).fuel;
    for (let i = 0; i < fuelLookup.length - 1; i++) {
        if (yRef >= fuelLookup[i].yRef && yRef <= fuelLookup[i + 1].yRef) {
            const f0 = fuelLookup[i], f1 = fuelLookup[i + 1];
            return f0.fuel + (f1.fuel - f0.fuel) * (yRef - f0.yRef) / (f1.yRef - f0.yRef);
        }
    }
    return 0;
}

export function calculateDensityAltitude(indicatedAltitude, altimeterSetting, T) {
    const pa = indicatedAltitude + (29.92 - altimeterSetting) * 1000;
    const stdTemp = 15 - (2 * (pa / 1000));
    const da = pa + (120 * (T - stdTemp));
    return { pa, stdTemp, da };
}

export function calculatePressureAltitude(indicatedAltitude, altimeterSetting) {
    const pa = indicatedAltitude + (29.92 - altimeterSetting) * 1000;
    return { pa };
}

export function calcStartClimbTemp(t, ia, sa, as_) {
    if ([t, ia, sa, as_].every(v => !isNaN(v))) {
        const { pa: paTarget } = calculatePressureAltitude(ia, as_);
        const { pa: paStart }  = calculatePressureAltitude(sa, as_);
        return (t + 2 * (paTarget - paStart) / 1000).toFixed(1);
    }
    return null;
}