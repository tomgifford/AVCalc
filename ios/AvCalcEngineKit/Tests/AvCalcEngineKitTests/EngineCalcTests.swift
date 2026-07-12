// Transcribed from test/engine-scenario-test.js's MAX_CURVE_TESTS, EXTRAP_TESTS, and
// BOUNDARY_TESTS — these are regression tests for exact boundary/extrapolation behavior
// (in-range vs. out-of-range transitions, the max-RPM curve fallback, and the >2700 RPM
// redline extrapolation guard), so they use a tight 1% tolerance, matching the originals.

import XCTest
@testable import AvCalcEngineKit

final class EngineCalcTests: XCTestCase {
    // MARK: - Max curve / boundary tests (explicit yRef, aircraft-specific power lines)

    func testMaxCurveBoundaries() throws {
        struct T { let name: String; let data: EngineData; let yRef: Double; let power: Int; let rpm: Double; let outOfRange: Bool }
        let cases: [T] = [
            T(name: "PA28-151 yRef=16 75%: endpoint in-range", data: PA28151Data.engine, yRef: 16, power: 75, rpm: 2700, outOfRange: false),
            T(name: "PA28-151 yRef=17 75%: beyond end -> max curve", data: PA28151Data.engine, yRef: 17, power: 75, rpm: 2700, outOfRange: true),
            T(name: "PA28-151 yRef=17 65%: in-range", data: PA28151Data.engine, yRef: 17, power: 65, rpm: 2525, outOfRange: false),
            T(name: "PA28-161 yRef=40 75%: endpoint in-range", data: PA28161Data.engine, yRef: 40, power: 75, rpm: 2665, outOfRange: false),
            T(name: "PA28-161 yRef=45 75%: beyond end -> max curve", data: PA28161Data.engine, yRef: 45, power: 75, rpm: 2700, outOfRange: true),
            T(name: "PA28-181 yRef=18 75%: endpoint in-range", data: PA28181Data.engine, yRef: 18, power: 75, rpm: 2660, outOfRange: false),
            T(name: "PA28-181 yRef=20 75%: beyond end -> max curve", data: PA28181Data.engine, yRef: 20, power: 75, rpm: 2633, outOfRange: true),
        ]
        for c in cases {
            let result = try XCTUnwrap(EngineCalc.getEngineRPM(c.data, yRef: c.yRef, power: c.power), c.name)
            XCTAssertEqual(result.outOfRange, c.outOfRange, c.name)
            let rpm = try XCTUnwrap(result.rpm, "\(c.name) rpm")
            assertWithinPercent(rpm, c.rpm, percent: 1, c.name)
        }
    }

    // MARK: - Above-75% extrapolation tests (getPowerFromRPM, explicit yRef=0)

    func testAboveMaxPowerExtrapolation() throws {
        struct T { let name: String; let data: EngineData; let yRef: Double; let rpm: Double; let power: Double?; let outOfRange: Bool }
        let cases: [T] = [
            T(name: "PA28-151 yRef=0 RPM 2570 -> ~85.8%", data: PA28151Data.engine, yRef: 0, rpm: 2570, power: 85.83, outOfRange: false),
            T(name: "PA28-151 yRef=0 RPM 2700 -> ~96.7%", data: PA28151Data.engine, yRef: 0, rpm: 2700, power: 96.67, outOfRange: false),
            T(name: "PA28-151 yRef=0 RPM 2701 -> above redline", data: PA28151Data.engine, yRef: 0, rpm: 2701, power: nil, outOfRange: true),
            T(name: "PA28-161 yRef=0 RPM 2600 -> ~83.6%", data: PA28161Data.engine, yRef: 0, rpm: 2600, power: 83.57, outOfRange: false),
            T(name: "PA28-161 yRef=0 RPM 2700 -> ~90.7%", data: PA28161Data.engine, yRef: 0, rpm: 2700, power: 90.71, outOfRange: false),
            T(name: "PA28-181 yRef=0 RPM 2570 -> ~85.8%", data: PA28181Data.engine, yRef: 0, rpm: 2570, power: 85.83, outOfRange: false),
            T(name: "PA28-181 yRef=0 RPM 2700 -> ~96.7%", data: PA28181Data.engine, yRef: 0, rpm: 2700, power: 96.67, outOfRange: false),
        ]
        for c in cases {
            let result = try XCTUnwrap(EngineCalc.getPowerFromRPM(c.data, yRef: c.yRef, userRPM: c.rpm), c.name)
            XCTAssertEqual(result.outOfRange, c.outOfRange, c.name)
            if let expectedPower = c.power {
                let power = try XCTUnwrap(result.power, "\(c.name) power")
                assertWithinPercent(power, expectedPower, percent: 1, c.name)
            } else {
                XCTAssertNil(result.power, c.name)
            }
        }
    }

    // MARK: - PA/T-based boundary tests (real pa/T inputs feeding getEngineYRef)

    func testPATBoundaries() throws {
        struct T { let name: String; let pa: Double; let t: Double; let power: Int; let rpm: Double; let outOfRange: Bool }
        let data = PA28161Data.engine
        let cases: [T] = [
            T(name: "PA 11500 / 8C / 65%: in range", pa: 11500, t: 8, power: 65, rpm: 2639, outOfRange: false),
            T(name: "PA 11500 / 9C / 65%: out of range", pa: 11500, t: 9, power: 65, rpm: 2638, outOfRange: true),
            T(name: "PA 11500 / 9C / 55%: in range", pa: 11500, t: 9, power: 55, rpm: 2506, outOfRange: false),
        ]
        for c in cases {
            let yRef = try XCTUnwrap(EngineCalc.getEngineYRef(data, c.pa, c.t), "\(c.name) yRef")
            let result = try XCTUnwrap(EngineCalc.getEngineRPM(data, yRef: yRef, power: c.power), c.name)
            XCTAssertEqual(result.outOfRange, c.outOfRange, c.name)
            let rpm = try XCTUnwrap(result.rpm, "\(c.name) rpm")
            assertWithinPercent(rpm, c.rpm, percent: 1, c.name)
        }
    }

    /// PA28-181's rpmLookup has 5 power keys (75/70/65/60/55), not just the 3 the UI exposes —
    /// getPowerFromRPM must iterate all of them, matching JS's `Object.keys(data.rpmLookup)`.
    func testGetPowerFromRPMUsesAllPowerKeysNotJustUIExposedOnes() {
        XCTAssertEqual(PA28181Data.engine.rpmLookup.keys.sorted(), [55, 60, 65, 70, 75])
        let result = EngineCalc.getPowerFromRPM(PA28181Data.engine, yRef: 0, userRPM: 2300)
        XCTAssertNotNil(result)
    }
}
