// Composite entry points bundling the underlying calc-module calls into the same shapes
// App.jsx's render logic currently computes inline. Bundling matters here specifically
// because each of these will cross the Capacitor JS<->Swift bridge as one async round trip
// (see AvCalcEnginePlugin.swift in the Xcode project) — keeping the number of bridge calls
// per input change low matters more here than it would for a plain local function call.

import Foundation

public struct ClimbResult {
    public let paTarget: Double
    public let paStart: Double
    public let distTarget: Double
    public let distStart: Double
    public let netDist: Double
    public let timeTarget: Double
    public let timeStart: Double
    public let netTime: Double
    public let fuelTarget: Double
    public let fuelStart: Double
    public let netFuel: Double
    public let aboveMax: Bool
}

public struct CruiseResult {
    public let tas: Double
    public let cas: Double
    public let ias: Double?
    public let fuelFlow: Double?
    public let yRef: Double
}

public struct EngineResult {
    public let yRef: Double?
    public let rpm: Double?
    public let outOfRange: Bool
    public let powerFromRpm: Double?
    public let powerFromRpmOutOfRange: Bool?
}

public enum AvCalcEngine {
    public static func getClimbChartLimits(aircraftType: String) -> (minTemp: Double, maxTemp: Double, maxPA: Double)? {
        guard let data = AircraftRegistry.data(for: aircraftType) else { return nil }
        return ClimbCalc.getClimbChartLimits(data.climb)
    }

    /// Mirrors climb-calc.js's calcStartClimbTemp — pure lapse-rate arithmetic, no
    /// aircraft-specific lookup table involved, so no aircraftType parameter needed.
    public static func calcStartClimbTemp(cruiseTemp: Double, altitude: Double, startAlt: Double, altimeter: Double) -> Double? {
        return ClimbCalc.calcStartClimbTemp(cruiseTemp, altitude, startAlt, altimeter)
    }

    /// Mirrors App.jsx's `results` block: pressure altitude for both target and start,
    /// climb yRef/dist/time/fuel for both, and the "above chart max" flag.
    public static func calculateClimb(aircraftType: String, altitude: Double, altimeter: Double, cruiseTemp: Double, startAlt: Double, startClimbTemp: Double) -> ClimbResult? {
        guard let data = AircraftRegistry.data(for: aircraftType) else { return nil }
        let climb = data.climb

        let paTarget = ClimbCalc.calculatePressureAltitude(altitude, altimeter)
        let paStart = ClimbCalc.calculatePressureAltitude(startAlt, altimeter)

        let yRefTarget = ClimbCalc.getClimbYRef(climb, paTarget, cruiseTemp)
        let yRefStart = ClimbCalc.getClimbYRef(climb, paStart, startClimbTemp)

        let distTarget = ClimbCalc.getDist(climb, yRefTarget)
        let distStart = ClimbCalc.getDist(climb, yRefStart)
        let timeTarget = ClimbCalc.getTime(climb, yRefTarget)
        let timeStart = ClimbCalc.getTime(climb, yRefStart)
        let fuelTarget = ClimbCalc.getFuel(climb, yRefTarget)
        let fuelStart = ClimbCalc.getFuel(climb, yRefStart)

        let aboveMax = yRefTarget > climb.timeLookup[climb.timeLookup.count - 1].yRef

        return ClimbResult(
            paTarget: paTarget, paStart: paStart,
            distTarget: distTarget, distStart: distStart, netDist: max(0, distTarget - distStart),
            timeTarget: timeTarget, timeStart: timeStart, netTime: max(0, timeTarget - timeStart),
            fuelTarget: fuelTarget, fuelStart: fuelStart, netFuel: max(0, fuelTarget - fuelStart),
            aboveMax: aboveMax
        )
    }

    /// Mirrors App.jsx's `cruiseResults` block. Note the all-or-nothing behavior: if `tas`
    /// can't be computed, the whole result is nil (matching JS leaving `cruiseResults` as
    /// `null` rather than partially populating it).
    public static func calculateCruise(aircraftType: String, altitude: Double, altimeter: Double, oat: Double, power: Int, wheelFairings: String) -> CruiseResult? {
        guard let data = AircraftRegistry.data(for: aircraftType) else { return nil }
        let paTarget = ClimbCalc.calculatePressureAltitude(altitude, altimeter)

        guard let yRef = CruiseCalc.getCruiseYRef(data.cruise, paTarget, oat) else { return nil }
        guard let tas = CruiseCalc.getCruiseTAS(data.cruise, paTarget, oat, power, wheelFairings) else { return nil }

        let cas = UtilityCalc.convertTasToCas(tas, paTarget, oat)
        let ias = AirspeedCalc.getIASfromCAS(data.airspeedCal, cas, flaps: "flapsUp")
        let fuelFlow = data.cruise.cruiseFuelGPH[power]

        return CruiseResult(tas: tas, cas: cas, ias: ias, fuelFlow: fuelFlow, yRef: yRef)
    }

    /// Mirrors App.jsx's engineYRef/engineRPM block, plus an optional getPowerFromRPM lookup
    /// when `rpm` is supplied — this serves both the Engine chart's manual-RPM-entry field
    /// and Cruise's "power from max RPM" cross-check (call once to get `outOfRange`/`rpm`;
    /// if out of range, call again passing that `rpm` back in to get `powerFromRpm`).
    public static func calculateEngine(aircraftType: String, altitude: Double, altimeter: Double, oat: Double, power: Int, rpm: Double?) -> EngineResult? {
        guard let data = AircraftRegistry.data(for: aircraftType) else { return nil }
        let paTarget = ClimbCalc.calculatePressureAltitude(altitude, altimeter)

        let yRef = EngineCalc.getEngineYRef(data.engine, paTarget, oat)
        let rpmResult = EngineCalc.getEngineRPM(data.engine, yRef: yRef, power: power)

        var powerFromRpm: Double? = nil
        var powerFromRpmOutOfRange: Bool? = nil
        if let rpm = rpm {
            let powerResult = EngineCalc.getPowerFromRPM(data.engine, yRef: yRef, userRPM: rpm)
            powerFromRpm = powerResult?.power
            powerFromRpmOutOfRange = powerResult?.outOfRange
        }

        return EngineResult(
            yRef: yRef,
            rpm: rpmResult?.rpm,
            outOfRange: rpmResult?.outOfRange ?? true,
            powerFromRpm: powerFromRpm,
            powerFromRpmOutOfRange: powerFromRpmOutOfRange
        )
    }
}
