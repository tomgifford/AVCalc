// Ported 1:1 from src/lib/engine-calc.js.
//
// JS's `getEngineRPM`/`getPowerFromRPM` use variadic-argument overload dispatch
// (2-arg yRef-based vs 3-arg pa/T-based calling conventions). Swift has no equivalent
// for overloads that differ only by argument count with the same base types in this
// shape, so each JS "signature" becomes its own explicitly-named Swift overload below
// rather than attempting a variadic trick.

import Foundation

public enum EngineCalc {
    // Same null-above-range behavior as CruiseCalc's interpYRefAtT (NOT ClimbCalc's,
    // which clamps at both ends) — this file's own copy, kept separate per-file to
    // mirror the original JS structure exactly.
    static func interpYRefAtT(_ points: [YRefPoint], _ T: Double) -> Double? {
        if T <= points[0].t { return points[0].yRef }
        if T > points[points.count - 1].t { return nil }
        for i in 0..<(points.count - 1) {
            if T >= points[i].t && T <= points[i + 1].t {
                let p0 = points[i], p1 = points[i + 1]
                return p0.yRef + (p1.yRef - p0.yRef) * (T - p0.t) / (p1.t - p0.t)
            }
        }
        return nil
    }

    static func interpRPMAtYRef(_ table: [YRefValue], _ yRef: Double) -> (rpm: Double?, outOfRange: Bool) {
        if yRef <= table[0].yRef { return (table[0].value, false) }
        if yRef > table[table.count - 1].yRef { return (nil, true) }
        for i in 0..<(table.count - 1) {
            if yRef >= table[i].yRef && yRef <= table[i + 1].yRef {
                let a = table[i], b = table[i + 1]
                return (a.value + (b.value - a.value) * (yRef - a.yRef) / (b.yRef - a.yRef), false)
            }
        }
        return (nil, true)
    }

    static func interpRPMOnMaxCurve(_ maxCurve: [YRefValue], _ yRef: Double) -> Double {
        if yRef <= maxCurve[0].yRef { return maxCurve[0].value }
        if yRef >= maxCurve[maxCurve.count - 1].yRef { return maxCurve[maxCurve.count - 1].value }
        for i in 0..<(maxCurve.count - 1) {
            if yRef >= maxCurve[i].yRef && yRef <= maxCurve[i + 1].yRef {
                let a = maxCurve[i], b = maxCurve[i + 1]
                return a.value + (b.value - a.value) * (yRef - a.yRef) / (b.yRef - a.yRef)
            }
        }
        return maxCurve[maxCurve.count - 1].value
    }

    public static func getEngineYRef(_ data: EngineData, _ pa: Double, _ T: Double) -> Double? {
        let lookup = data.yRefLookup
        if lookup.isEmpty { return nil }
        if pa <= lookup[0].pa { return interpYRefAtT(lookup[0].points, T) }
        if pa > lookup[lookup.count - 1].pa { return nil }
        for i in 0..<(lookup.count - 1) {
            if pa >= lookup[i].pa && pa <= lookup[i + 1].pa {
                guard let yRef0 = interpYRefAtT(lookup[i].points, T),
                      let yRef1 = interpYRefAtT(lookup[i + 1].points, T) else { return nil }
                return yRef0 + (yRef1 - yRef0) * (pa - lookup[i].pa) / (lookup[i + 1].pa - lookup[i].pa)
            }
        }
        return nil
    }

    /// yRef-based signature — this is the one actually called from App.jsx today
    /// (yRef already computed via getEngineYRef before calling in).
    public static func getEngineRPM(_ data: EngineData, yRef: Double?, power: Int) -> (rpm: Double?, outOfRange: Bool)? {
        guard let yRef = yRef else { return nil }
        guard let table = data.rpmLookup[power], !table.isEmpty else { return nil }
        let result = interpRPMAtYRef(table, yRef)
        if result.outOfRange {
            return (interpRPMOnMaxCurve(data.engineMaxRPM, yRef), true)
        }
        return result
    }

    /// pa/T-based signature — computes yRef internally. Kept for parity with the JS API surface.
    public static func getEngineRPM(_ data: EngineData, pa: Double, T: Double, power: Int) -> (rpm: Double?, outOfRange: Bool)? {
        return getEngineRPM(data, yRef: getEngineYRef(data, pa, T), power: power)
    }

    /// yRef-based signature — this is the one actually called from App.jsx today.
    public static func getPowerFromRPM(_ data: EngineData, yRef: Double?, userRPM: Double?) -> (power: Double?, outOfRange: Bool)? {
        guard let yRef = yRef, let userRPM = userRPM else { return nil }

        let keys = data.rpmLookup.keys.sorted()
        if keys.count < 2 { return nil }

        var points: [(power: Int, rpm: Double)] = []
        for key in keys {
            guard let table = data.rpmLookup[key], !table.isEmpty else { continue }
            let result = interpRPMAtYRef(table, yRef)
            guard !result.outOfRange, let rpm = result.rpm else { continue }
            points.append((power: key, rpm: rpm))
        }

        if points.count < 2 { return (nil, true) }
        points.sort { $0.power < $1.power }

        if userRPM < points[0].rpm { return (nil, true) }

        if userRPM <= points[points.count - 1].rpm {
            for i in 0..<(points.count - 1) {
                let p0 = points[i], p1 = points[i + 1]
                if userRPM >= p0.rpm && userRPM <= p1.rpm {
                    let power = Double(p0.power) + Double(p1.power - p0.power) * (userRPM - p0.rpm) / (p1.rpm - p0.rpm)
                    return (power, false)
                }
            }
            return (Double(points[points.count - 1].power), false)
        }

        // userRPM exceeds the highest in-range power line — extrapolate using the top two
        // lines. The `2700` cutoff is a magic number from the original JS, specific to this
        // aircraft family's redline RPM — ported verbatim, not "fixed" or generalized.
        if userRPM > 2700 { return (nil, true) }
        let p0 = points[points.count - 2], p1 = points[points.count - 1]
        if p1.rpm == p0.rpm { return (nil, true) }
        let slope = Double(p1.power - p0.power) / (p1.rpm - p0.rpm)
        return (Double(p1.power) + (userRPM - p1.rpm) * slope, false)
    }

    /// pa/T-based signature — computes yRef internally. Kept for parity with the JS API surface.
    public static func getPowerFromRPM(_ data: EngineData, pa: Double, T: Double, userRPM: Double?) -> (power: Double?, outOfRange: Bool)? {
        return getPowerFromRPM(data, yRef: getEngineYRef(data, pa, T), userRPM: userRPM)
    }
}
