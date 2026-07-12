// Capacitor plugin bridge exposing AvCalcEngineKit's composite calc functions to JS.
// This file must be added to the App target in Xcode (a manual step — see
// AWSDeploymentNextSteps.md-style setup notes / the plan for this branch), and
// AvCalcEngineKit must be added as a local Swift Package dependency of the App target
// (File > Add Package Dependencies > Add Local... > select ios/AvCalcEngineKit).
//
// This file is intentionally a thin JSON-marshaling shim — all actual calc logic and
// the digitized POH data live in AvCalcEngineKit, not here.

import Foundation
import Capacitor
import AvCalcEngineKit

@objc(AvCalcEnginePlugin)
public class AvCalcEnginePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "AvCalcEnginePlugin"
    public let jsName = "AvCalcEngine"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getClimbChartLimits", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "calcStartClimbTemp", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "calculateClimb", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "calculateCruise", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "calculateEngine", returnType: CAPPluginReturnPromise),
    ]

    @objc func getClimbChartLimits(_ call: CAPPluginCall) {
        guard let aircraftType = call.getString("aircraftType") else {
            call.reject("aircraftType is required")
            return
        }
        guard let limits = AvCalcEngine.getClimbChartLimits(aircraftType: aircraftType) else {
            call.reject("Unknown aircraft: \(aircraftType)")
            return
        }
        call.resolve([
            "minTemp": limits.minTemp,
            "maxTemp": limits.maxTemp,
            "maxPA": limits.maxPA,
        ])
    }

    @objc func calcStartClimbTemp(_ call: CAPPluginCall) {
        guard let cruiseTemp = call.getDouble("cruiseTemp"),
              let altitude = call.getDouble("altitude"),
              let startAlt = call.getDouble("startAlt"),
              let altimeter = call.getDouble("altimeter") else {
            call.resolve(["startClimbTemp": NSNull()])
            return
        }
        let result = AvCalcEngine.calcStartClimbTemp(cruiseTemp: cruiseTemp, altitude: altitude, startAlt: startAlt, altimeter: altimeter)
        call.resolve(["startClimbTemp": result ?? NSNull()])
    }

    @objc func calculateClimb(_ call: CAPPluginCall) {
        guard let aircraftType = call.getString("aircraftType"),
              let altitude = call.getDouble("altitude"),
              let altimeter = call.getDouble("altimeter"),
              let cruiseTemp = call.getDouble("cruiseTemp"),
              let startAlt = call.getDouble("startAlt"),
              let startClimbTemp = call.getDouble("startClimbTemp") else {
            call.reject("Missing required parameters")
            return
        }
        guard let result = AvCalcEngine.calculateClimb(
            aircraftType: aircraftType, altitude: altitude, altimeter: altimeter,
            cruiseTemp: cruiseTemp, startAlt: startAlt, startClimbTemp: startClimbTemp
        ) else {
            call.reject("Unknown aircraft: \(aircraftType)")
            return
        }
        call.resolve([
            "paTarget": result.paTarget,
            "paStart": result.paStart,
            "distTarget": result.distTarget,
            "distStart": result.distStart,
            "netDist": result.netDist,
            "timeTarget": result.timeTarget,
            "timeStart": result.timeStart,
            "netTime": result.netTime,
            "fuelTarget": result.fuelTarget,
            "fuelStart": result.fuelStart,
            "netFuel": result.netFuel,
            "aboveMax": result.aboveMax,
        ])
    }

    @objc func calculateCruise(_ call: CAPPluginCall) {
        guard let aircraftType = call.getString("aircraftType"),
              let altitude = call.getDouble("altitude"),
              let altimeter = call.getDouble("altimeter"),
              let oat = call.getDouble("oat"),
              let power = call.getInt("power"),
              let wheelFairings = call.getString("wheelFairings") else {
            call.reject("Missing required parameters")
            return
        }
        guard let result = AvCalcEngine.calculateCruise(
            aircraftType: aircraftType, altitude: altitude, altimeter: altimeter,
            oat: oat, power: power, wheelFairings: wheelFairings
        ) else {
            call.resolve(["tas": NSNull(), "cas": NSNull(), "ias": NSNull(), "fuelFlow": NSNull(), "yRef": NSNull()])
            return
        }
        call.resolve([
            "tas": result.tas,
            "cas": result.cas,
            "ias": result.ias ?? NSNull(),
            "fuelFlow": result.fuelFlow ?? NSNull(),
            "yRef": result.yRef,
        ])
    }

    @objc func calculateEngine(_ call: CAPPluginCall) {
        guard let aircraftType = call.getString("aircraftType"),
              let altitude = call.getDouble("altitude"),
              let altimeter = call.getDouble("altimeter"),
              let oat = call.getDouble("oat"),
              let power = call.getInt("power") else {
            call.reject("Missing required parameters")
            return
        }
        let rpm = call.getDouble("rpm") // optional — manual RPM entry or max-RPM cross-check
        guard let result = AvCalcEngine.calculateEngine(
            aircraftType: aircraftType, altitude: altitude, altimeter: altimeter,
            oat: oat, power: power, rpm: rpm
        ) else {
            call.reject("Unknown aircraft: \(aircraftType)")
            return
        }
        call.resolve([
            "yRef": result.yRef ?? NSNull(),
            "rpm": result.rpm ?? NSNull(),
            "outOfRange": result.outOfRange,
            "powerFromRpm": result.powerFromRpm ?? NSNull(),
            "powerFromRpmOutOfRange": result.powerFromRpmOutOfRange ?? NSNull(),
        ])
    }
}
