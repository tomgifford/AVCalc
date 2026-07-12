// Transcribed from test/airspeed-test.js — a representative subset of the IAS<->CAS
// calibration-table scenarios (exact endpoints, interpolation, and extrapolation on both
// sides) across all three aircraft/flap combinations, plus all five TAS->CAS scenarios.
// Uses the same tight 0.001/0.01 tolerances as the original script (these are closed-form
// arithmetic checks, not chart-digitization estimates, so a loose tolerance would be wrong).

import XCTest
@testable import AvCalcEngineKit

final class AirspeedCalcTests: XCTestCase {
    struct IasCasCase { let name: String; let data: AirspeedCalData; let ias: Double?; let cas: Double?; let flaps: String; let expected: Double }

    static let cases: [IasCasCase] = [
        // PA-28-151 flapsUp
        IasCasCase(name: "151 flapsUp exact min IAS 50", data: PA28151Data.airspeedCal, ias: 50, cas: nil, flaps: "flapsUp", expected: 58),
        IasCasCase(name: "151 flapsUp exact max IAS 160", data: PA28151Data.airspeedCal, ias: 160, cas: nil, flaps: "flapsUp", expected: 153),
        IasCasCase(name: "151 flapsUp interp IAS 55", data: PA28151Data.airspeedCal, ias: 55, cas: nil, flaps: "flapsUp", expected: 61.25),
        IasCasCase(name: "151 flapsUp below-min extrap IAS 40", data: PA28151Data.airspeedCal, ias: 40, cas: nil, flaps: "flapsUp", expected: 51.5),
        IasCasCase(name: "151 flapsUp above-max extrap IAS 170", data: PA28151Data.airspeedCal, ias: 170, cas: nil, flaps: "flapsUp", expected: 162),
        IasCasCase(name: "151 flapsUp inv exact CAS 58", data: PA28151Data.airspeedCal, ias: nil, cas: 58, flaps: "flapsUp", expected: 50),
        IasCasCase(name: "151 flapsUp inv interp CAS 61.25", data: PA28151Data.airspeedCal, ias: nil, cas: 61.25, flaps: "flapsUp", expected: 55),
        // PA-28-151 flaps40
        IasCasCase(name: "151 flaps40 exact min IAS 43.5", data: PA28151Data.airspeedCal, ias: 43.5, cas: nil, flaps: "flaps40", expected: 50),
        IasCasCase(name: "151 flaps40 interp IAS 51.75", data: PA28151Data.airspeedCal, ias: 51.75, cas: nil, flaps: "flaps40", expected: 56),
        IasCasCase(name: "151 flaps40 below-min extrap IAS 33.5", data: PA28151Data.airspeedCal, ias: 33.5, cas: nil, flaps: "flaps40", expected: 42.7273),
        // PA-28-161 flapsUp
        IasCasCase(name: "161 flapsUp exact min IAS 50", data: PA28161Data.airspeedCal, ias: 50, cas: nil, flaps: "flapsUp", expected: 58),
        IasCasCase(name: "161 flapsUp interp IAS 150", data: PA28161Data.airspeedCal, ias: 150, cas: nil, flaps: "flapsUp", expected: 144),
        IasCasCase(name: "161 flapsUp inv below-min extrap CAS 48", data: PA28161Data.airspeedCal, ias: nil, cas: 48, flaps: "flapsUp", expected: 35.7143),
        // PA-28-161 flaps40
        IasCasCase(name: "161 flaps40 exact min IAS 43", data: PA28161Data.airspeedCal, ias: 43, cas: nil, flaps: "flaps40", expected: 50),
        IasCasCase(name: "161 flaps40 above-max extrap IAS 114", data: PA28161Data.airspeedCal, ias: 114, cas: nil, flaps: "flaps40", expected: 108.75),
        // PA-28-181 flapsUp
        IasCasCase(name: "181 flapsUp exact min IAS 70", data: PA28181Data.airspeedCal, ias: 70, cas: nil, flaps: "flapsUp", expected: 75),
        IasCasCase(name: "181 flapsUp interp IAS 75", data: PA28181Data.airspeedCal, ias: 75, cas: nil, flaps: "flapsUp", expected: 78.75),
        IasCasCase(name: "181 flapsUp inv above-max extrap CAS 155", data: PA28181Data.airspeedCal, ias: nil, cas: 155, flaps: "flapsUp", expected: 161.1111),
        // PA-28-181 flaps40
        IasCasCase(name: "181 flaps40 exact min IAS 60", data: PA28181Data.airspeedCal, ias: 60, cas: nil, flaps: "flaps40", expected: 64),
        IasCasCase(name: "181 flaps40 interp IAS 97.5", data: PA28181Data.airspeedCal, ias: 97.5, cas: nil, flaps: "flaps40", expected: 98.5),
    ]

    func testIasCasScenarios() throws {
        for c in Self.cases {
            let computed: Double
            if let ias = c.ias {
                computed = try XCTUnwrap(AirspeedCalc.getCASfromIAS(c.data, ias, flaps: c.flaps), c.name)
            } else {
                computed = try XCTUnwrap(AirspeedCalc.getIASfromCAS(c.data, c.cas!, flaps: c.flaps), c.name)
            }
            XCTAssertEqual(computed, c.expected, accuracy: 0.001, c.name)
        }
    }

    struct TasCasCase { let name: String; let tas: Double; let pa: Double; let oat: Double; let expected: Double }

    static let tasCasCases: [TasCasCase] = [
        TasCasCase(name: "TAS 160 PA 8500 OAT -2", tas: 160, pa: 8500, oat: -2, expected: 141.09),
        TasCasCase(name: "TAS 102.4 PA 4000 OAT 10", tas: 102.4, pa: 4000, oat: 10, expected: 96.04),
        TasCasCase(name: "TAS 120 PA 6000 OAT 5", tas: 120, pa: 6000, oat: 5, expected: 109.43),
        TasCasCase(name: "TAS 80 PA 2000 OAT 15", tas: 80, pa: 2000, oat: 15, expected: 77.15),
        TasCasCase(name: "TAS 0 edge case", tas: 0, pa: 5000, oat: 5, expected: 0),
    ]

    func testTasToCasScenarios() {
        for c in Self.tasCasCases {
            let computed = UtilityCalc.convertTasToCas(c.tas, c.pa, c.oat)
            XCTAssertEqual(computed, c.expected, accuracy: 0.01, c.name)
        }
    }
}
