// Ported 1:1 from src/lib/climb-calc.js. This file's `interpYRefAtT` clamps at BOTH ends
// (T below first point -> first.yRef, T above last point -> last.yRef) — do not unify this
// with CruiseCalc.swift/EngineCalc.swift's same-named helper, which instead returns nil above
// the last point. That asymmetry is present in the original JS and must be preserved exactly.

import Foundation

public enum ClimbCalc {
    static func interpYRefAtT(_ points: [YRefPoint], _ T: Double) -> Double {
        if T <= points[0].t { return points[0].yRef }
        if T >= points[points.count - 1].t { return points[points.count - 1].yRef }
        for i in 0..<(points.count - 1) {
            if T >= points[i].t && T <= points[i + 1].t {
                let p0 = points[i], p1 = points[i + 1]
                return p0.yRef + (p1.yRef - p0.yRef) * (T - p0.t) / (p1.t - p0.t)
            }
        }
        return 0
    }

    public static func getClimbYRef(_ data: ClimbData, _ pa: Double, _ T: Double) -> Double {
        if pa <= 0 { return 0 }
        let yRefLookup = data.yRefLookup
        if pa <= yRefLookup[0].pa { return interpYRefAtT(yRefLookup[0].points, T) }
        if pa >= yRefLookup[yRefLookup.count - 1].pa { return interpYRefAtT(yRefLookup[yRefLookup.count - 1].points, T) }
        for i in 0..<(yRefLookup.count - 1) {
            if pa >= yRefLookup[i].pa && pa <= yRefLookup[i + 1].pa {
                let yRef0 = interpYRefAtT(yRefLookup[i].points, T)
                let yRef1 = interpYRefAtT(yRefLookup[i + 1].points, T)
                return yRef0 + (yRef1 - yRef0) * (pa - yRefLookup[i].pa) / (yRefLookup[i + 1].pa - yRefLookup[i].pa)
            }
        }
        return 0
    }

    public static func getDist(_ data: ClimbData, _ yRef: Double) -> Double {
        let lookup = data.climbDistLookup
        if yRef <= 0 { return 0 }
        if yRef >= lookup[lookup.count - 1].yRef { return lookup[lookup.count - 1].value }
        for i in 0..<(lookup.count - 1) {
            if yRef >= lookup[i].yRef && yRef <= lookup[i + 1].yRef {
                let d0 = lookup[i], d1 = lookup[i + 1]
                return d0.value + (d1.value - d0.value) * (yRef - d0.yRef) / (d1.yRef - d0.yRef)
            }
        }
        return 0
    }

    public static func getTime(_ data: ClimbData, _ yRef: Double) -> Double {
        let lookup = data.timeLookup
        if yRef <= 0 { return 0 }
        if yRef >= lookup[lookup.count - 1].yRef { return lookup[lookup.count - 1].value }
        for i in 0..<(lookup.count - 1) {
            if yRef >= lookup[i].yRef && yRef <= lookup[i + 1].yRef {
                let t0 = lookup[i], t1 = lookup[i + 1]
                return t0.value + (t1.value - t0.value) * (yRef - t0.yRef) / (t1.yRef - t0.yRef)
            }
        }
        return 0
    }

    public static func getFuel(_ data: ClimbData, _ yRef: Double) -> Double {
        let lookup = data.fuelLookup
        if yRef <= 0 { return 0 }
        if yRef >= lookup[lookup.count - 1].yRef { return lookup[lookup.count - 1].value }
        for i in 0..<(lookup.count - 1) {
            if yRef >= lookup[i].yRef && yRef <= lookup[i + 1].yRef {
                let f0 = lookup[i], f1 = lookup[i + 1]
                return f0.value + (f1.value - f0.value) * (yRef - f0.yRef) / (f1.yRef - f0.yRef)
            }
        }
        return 0
    }

    public static func calculateDensityAltitude(_ indicatedAltitude: Double, _ altimeterSetting: Double, _ T: Double) -> (pa: Double, stdTemp: Double, da: Double) {
        let pa = indicatedAltitude + (29.92 - altimeterSetting) * 1000
        let stdTemp = 15 - (2 * (pa / 1000))
        let da = pa + (120 * (T - stdTemp))
        return (pa, stdTemp, da)
    }

    /// JS returns { pa } only (no stdTemp) — matched here as a plain Double.
    public static func calculatePressureAltitude(_ indicatedAltitude: Double, _ altimeterSetting: Double) -> Double {
        return indicatedAltitude + (29.92 - altimeterSetting) * 1000
    }

    public static func getClimbChartLimits(_ data: ClimbData) -> (minTemp: Double, maxTemp: Double, maxPA: Double) {
        let temps = data.yRefLookup.flatMap { $0.points.map { $0.t } }
        let minTemp = temps.min() ?? 0
        let maxTemp = temps.max() ?? 0
        let maxPA = data.yRefLookup.map { $0.pa }.max() ?? 0
        return (minTemp, maxTemp, maxPA)
    }

    /// JS: `calcStartClimbTemp(t, ia, sa, as_)` returns `Math.round(...).toString()` or null.
    /// Returned here as a nullable Double (rounded); the JS side already stringifies whatever
    /// value it receives (`applyStartClimbTemp`'s `setStartClimbTemp(String(temp))`).
    public static func calcStartClimbTemp(_ t: Double, _ ia: Double, _ sa: Double, _ altimeter: Double) -> Double? {
        if t.isNaN || ia.isNaN || sa.isNaN || altimeter.isNaN { return nil }
        let paTarget = calculatePressureAltitude(ia, altimeter)
        let paStart = calculatePressureAltitude(sa, altimeter)
        return (t + 2 * (paTarget - paStart) / 1000).rounded()
    }
}
