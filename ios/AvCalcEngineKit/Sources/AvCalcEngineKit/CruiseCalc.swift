// Ported 1:1 from src/lib/cruise-calc.js. This file's `interpYRefAtT` clamps only the LOW end
// (T below first point -> first.yRef) and returns nil above the last point — unlike
// ClimbCalc.swift's same-named helper, which clamps at both ends. Preserve this asymmetry.

import Foundation

public enum CruiseCalc {
    static func interpYRefAtT(_ points: [YRefPoint], _ T: Double) -> Double? {
        if T <= points[0].t { return points[0].yRef }
        if T > points[points.count - 1].t { return nil }
        for i in 0..<(points.count - 1) {
            if T >= points[i].t && T <= points[i + 1].t {
                let p0 = points[i], p1 = points[i + 1]
                return p0.yRef + (p1.yRef - p0.yRef) * (T - p0.t) / (p1.t - p0.t)
            }
        }
        return 0
    }

    static func interpTASOnMaxCurve(_ maxCurve: [YRefValue], _ yRef: Double) -> Double {
        if yRef <= maxCurve[0].yRef { return maxCurve[0].value }
        if yRef >= maxCurve[maxCurve.count - 1].yRef { return maxCurve[maxCurve.count - 1].value }
        for i in 0..<(maxCurve.count - 1) {
            if yRef >= maxCurve[i].yRef && yRef <= maxCurve[i + 1].yRef {
                let p0 = maxCurve[i], p1 = maxCurve[i + 1]
                return p0.value + (p1.value - p0.value) * (yRef - p0.yRef) / (p1.yRef - p0.yRef)
            }
        }
        return maxCurve[maxCurve.count - 1].value
    }

    public static func getCruiseYRef(_ data: CruiseData, _ pa: Double, _ oat: Double) -> Double? {
        let lookup = data.cruiseYRefLookup
        if pa <= lookup[0].pa { return interpYRefAtT(lookup[0].points, oat) }
        if pa > lookup[lookup.count - 1].pa { return nil }
        for i in 0..<(lookup.count - 1) {
            if pa >= lookup[i].pa && pa <= lookup[i + 1].pa {
                guard let yRef0 = interpYRefAtT(lookup[i].points, oat),
                      let yRef1 = interpYRefAtT(lookup[i + 1].points, oat) else { return nil }
                return yRef0 + (yRef1 - yRef0) * (pa - lookup[i].pa) / (lookup[i + 1].pa - lookup[i].pa)
            }
        }
        return nil
    }

    public static func getCruiseTAS(_ data: CruiseData, _ pa: Double, _ oat: Double, _ power: Int, _ wheelFairings: String) -> Double? {
        guard let yRef = getCruiseYRef(data, pa, oat) else { return nil }
        guard let table = data.cruiseTASLookup[power] else { return nil }

        var tas: Double?
        if yRef <= table[0].yRef {
            tas = table[0].value
        } else if yRef > table[table.count - 1].yRef {
            let maxCurve = data.cruiseMaxTAS
            if maxCurve.isEmpty || yRef > maxCurve[maxCurve.count - 1].yRef { return nil }
            tas = interpTASOnMaxCurve(maxCurve, yRef)
        } else {
            for i in 0..<(table.count - 1) {
                if yRef >= table[i].yRef && yRef <= table[i + 1].yRef {
                    let t0 = table[i], t1 = table[i + 1]
                    tas = t0.value + (t1.value - t0.value) * (yRef - t0.yRef) / (t1.yRef - t0.yRef)
                    break
                }
            }
        }

        if var result = tas, wheelFairings == "no" {
            result -= data.noFairingsTASDeduction
            tas = result
        }
        return tas
    }
}
