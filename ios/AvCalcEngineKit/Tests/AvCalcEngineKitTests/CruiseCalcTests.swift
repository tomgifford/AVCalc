// Transcribed from test/cruise-scenario-test.js's scenarios with real (non-TBD) expected
// values, including the max-curve cases exercising CruiseCalc's "yRef beyond the highest
// power-line point falls back to the max-TAS curve" branch. Uses the same 5%-error
// threshold as the original JS script (tighter than climb's 10%, matching the source).

import XCTest
@testable import AvCalcEngineKit

final class CruiseCalcTests: XCTestCase {
    struct Scenario {
        let name: String
        let pa: Double, oat: Double
        let yRef: Double
        let tas75: Double, tas65: Double, tas55: Double
    }

    static let scenarios: [Scenario] = [
        Scenario(name: "PA 1000 / Std 13", pa: 1000, oat: 13, yRef: 2, tas75: 112.4, tas65: 104.2, tas55: 92.75),
        Scenario(name: "PA 4000 / Std 7", pa: 4000, oat: 7, yRef: 8, tas75: 116.9, tas65: 108.6, tas55: 96.5),
        Scenario(name: "PA 8000 / Std -1", pa: 8000, oat: -1, yRef: 16.3, tas75: 123.7, tas65: 114.9, tas55: 101.8),
        // Max-curve scenario: yRef=20 is above the 75% line's endpoint (yRef=18), so TAS
        // must come from the max-TAS curve, not a straight power-line interpolation.
        Scenario(name: "PA 10000 / Std -5 [max curve]", pa: 10000, oat: -5, yRef: 20, tas75: 123.8, tas65: 117.3, tas55: 104.3),
    ]

    func testCruiseScenarios() throws {
        let data = PA28181Data.cruise
        for s in Self.scenarios {
            let yRef = try XCTUnwrap(CruiseCalc.getCruiseYRef(data, s.pa, s.oat), "\(s.name) yRef")
            assertWithinPercent(yRef, s.yRef, percent: 5, "\(s.name) yRef")

            let tas75 = try XCTUnwrap(CruiseCalc.getCruiseTAS(data, s.pa, s.oat, 75, "yes"), "\(s.name) tas75")
            assertWithinPercent(tas75, s.tas75, percent: 5, "\(s.name) tas75")

            let tas65 = try XCTUnwrap(CruiseCalc.getCruiseTAS(data, s.pa, s.oat, 65, "yes"), "\(s.name) tas65")
            assertWithinPercent(tas65, s.tas65, percent: 5, "\(s.name) tas65")

            let tas55 = try XCTUnwrap(CruiseCalc.getCruiseTAS(data, s.pa, s.oat, 55, "yes"), "\(s.name) tas55")
            assertWithinPercent(tas55, s.tas55, percent: 5, "\(s.name) tas55")
        }
    }

    /// pa beyond the last yRefLookup row's `pa` must return nil (cruise/engine's clamp-vs-null
    /// asymmetry vs. ClimbCalc — see CruiseCalc.swift's header comment).
    func testGetCruiseYRefReturnsNilAbovePAMax() {
        let data = PA28181Data.cruise
        let lastPA = data.cruiseYRefLookup.last!.pa
        XCTAssertNil(CruiseCalc.getCruiseYRef(data, lastPA + 1000, 15))
    }

    func testNoFairingsDeduction() throws {
        let data = PA28181Data.cruise
        let withFairings = try XCTUnwrap(CruiseCalc.getCruiseTAS(data, 1000, 13, 75, "yes"))
        let withoutFairings = try XCTUnwrap(CruiseCalc.getCruiseTAS(data, 1000, 13, 75, "no"))
        XCTAssertEqual(withFairings - withoutFairings, data.noFairingsTASDeduction, accuracy: 0.001)
    }
}
