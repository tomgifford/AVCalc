// Transcribed from test/climb-scenario-test.js's "Original net-climb scenarios" (the rows
// with real, non-TBD expected values) — hand-verified against the POH climb charts.
// Uses the same >10% relative-error failure threshold as the original JS script.

import XCTest
@testable import AvCalcEngineKit

final class ClimbCalcTests: XCTestCase {
    struct Scenario {
        let name: String
        let data: ClimbData
        let paStart: Double, tStart: Double
        let paTarget: Double, tTarget: Double
        let time: Double, dist: Double, fuel: Double
    }

    static let scenarios: [Scenario] = [
        Scenario(name: "PA28-161 — 1500/27 to 5000/16", data: PA28161Data.climb,
                 paStart: 1500, tStart: 27, paTarget: 5000, tTarget: 16, time: 9, dist: 12, fuel: 1.54),
        Scenario(name: "PA28-161 — 0/27 to 5000/16", data: PA28161Data.climb,
                 paStart: 0, tStart: 27, paTarget: 5000, tTarget: 16, time: 12.0, dist: 15.8, fuel: 2.24),
        Scenario(name: "PA28-161 — 0/27 to 1500/27", data: PA28161Data.climb,
                 paStart: 0, tStart: 27, paTarget: 1500, tTarget: 27, time: 3.4, dist: 4.2, fuel: 0.7),
        Scenario(name: "PA28-181 — 1000/23 to 5000/16", data: PA28181Data.climb,
                 paStart: 1000, tStart: 23, paTarget: 5000, tTarget: 16, time: 7, dist: 10.0, fuel: 1.7),
        Scenario(name: "PA28-181 — 0/15 to 5000/16", data: PA28181Data.climb,
                 paStart: 0, tStart: 15, paTarget: 5000, tTarget: 16, time: 10.0, dist: 13.75, fuel: 2.2),
        Scenario(name: "PA28-181 — 0/15 to 1000/23", data: PA28181Data.climb,
                 paStart: 0, tStart: 15, paTarget: 1000, tTarget: 23, time: 2.8, dist: 3.75, fuel: 0.5),
        Scenario(name: "PA28-181 — 0/23 to 2000/21", data: PA28181Data.climb,
                 paStart: 0, tStart: 23, paTarget: 2000, tTarget: 21, time: 4.0, dist: 5.8, fuel: 1.0),
        Scenario(name: "PA28-181 — 0/23 to 6000/13", data: PA28181Data.climb,
                 paStart: 0, tStart: 23, paTarget: 6000, tTarget: 13, time: 12.5, dist: 17.5, fuel: 3.0),
    ]

    // Additional single-PA lookup checks with real expected values (from the
    // per-aircraft chart-lookup blocks in climb-scenario-test.js).
    static let singlePAScenarios: [Scenario] = [
        Scenario(name: "PA28-181 — PA 1000 / Std 13.0", data: PA28181Data.climb,
                 paStart: 0, tStart: 15, paTarget: 1000, tTarget: 13.0, time: 1.2, dist: 1.5, fuel: 0.2),
        Scenario(name: "PA28-181 — PA 1000 / Max 37.8", data: PA28181Data.climb,
                 paStart: 0, tStart: 15, paTarget: 1000, tTarget: 37.8, time: 5, dist: 7, fuel: 1.25),
        Scenario(name: "PA28-181 — PA 4000 / Max 37.8", data: PA28181Data.climb,
                 paStart: 0, tStart: 15, paTarget: 4000, tTarget: 37.8, time: 13.5, dist: 18, fuel: 3),
        Scenario(name: "PA28-181 — PA 5000 / Min -28.9", data: PA28181Data.climb,
                 paStart: 0, tStart: 15, paTarget: 5000, tTarget: -28.9, time: 1.05, dist: 1.2, fuel: 0.15),
        Scenario(name: "PA28-181 — PA 7000 / Max 37.8", data: PA28181Data.climb,
                 paStart: 0, tStart: 15, paTarget: 7000, tTarget: 37.8, time: 26, dist: 36.25, fuel: 5.2),
        Scenario(name: "PA28-181 — PA 8000 / Std -1.0", data: PA28181Data.climb,
                 paStart: 0, tStart: 15, paTarget: 8000, tTarget: -1.0, time: 15, dist: 20, fuel: 3.2),
        Scenario(name: "PA28-181 — PA 8000 / Min -28.9", data: PA28181Data.climb,
                 paStart: 0, tStart: 15, paTarget: 8000, tTarget: -28.9, time: 7, dist: 9.5, fuel: 1.7),
        Scenario(name: "PA28-181 — PA 10000 / Max 31.7", data: PA28181Data.climb,
                 paStart: 0, tStart: 15, paTarget: 10000, tTarget: 31.7, time: 45, dist: 69, fuel: 8.6),
        Scenario(name: "PA28-181 — PA 11000 / Min -28.9", data: PA28181Data.climb,
                 paStart: 0, tStart: 15, paTarget: 11000, tTarget: -28.9, time: 16, dist: 21.5, fuel: 3.5),
        Scenario(name: "PA28-181 — PA 12000 / Std -9.0", data: PA28181Data.climb,
                 paStart: 0, tStart: 15, paTarget: 12000, tTarget: -9.0, time: 31.2, dist: 42.7, fuel: 6.3),
        Scenario(name: "PA28-161 — PA 3000 / Std 9", data: PA28161Data.climb,
                 paStart: 0, tStart: 15, paTarget: 3000, tTarget: 9, time: 6, dist: 8, fuel: 1.1),
        Scenario(name: "PA28-161 — PA 3000 / Min -40", data: PA28161Data.climb,
                 paStart: 0, tStart: 15, paTarget: 3000, tTarget: -40, time: 5, dist: 6.5, fuel: 1.0),
        Scenario(name: "PA28-161 — PA 4000 / Std 7", data: PA28161Data.climb,
                 paStart: 0, tStart: 15, paTarget: 4000, tTarget: 7, time: 8.2, dist: 10.2, fuel: 1.8),
        Scenario(name: "PA28-161 — PA 6000 / Min -40", data: PA28161Data.climb,
                 paStart: 0, tStart: 15, paTarget: 6000, tTarget: -40, time: 9.5, dist: 12, fuel: 1.8),
        Scenario(name: "PA28-161 — PA 7000 / Min -40", data: PA28161Data.climb,
                 paStart: 0, tStart: 15, paTarget: 7000, tTarget: -40, time: 10.5, dist: 14.3, fuel: 1.9),
        Scenario(name: "PA28-161 — PA 8000 / Min -40", data: PA28161Data.climb,
                 paStart: 0, tStart: 15, paTarget: 8000, tTarget: -40, time: 13, dist: 17, fuel: 2.4),
        Scenario(name: "PA28-151 — PA 2000 / Max 40", data: PA28151Data.climb,
                 paStart: 0, tStart: 15, paTarget: 2000, tTarget: 40, time: 9.2, dist: 12.5, fuel: 2.0),
        Scenario(name: "PA28-151 — PA 8000 / Std -1", data: PA28151Data.climb,
                 paStart: 0, tStart: 15, paTarget: 8000, tTarget: -1, time: 17.5, dist: 23.75, fuel: 2.8),
        Scenario(name: "PA28-151 — PA 10000 / Std -5", data: PA28151Data.climb,
                 paStart: 0, tStart: 15, paTarget: 10000, tTarget: -5, time: 25.0, dist: 35.0, fuel: 4.0),
    ]

    func runScenario(_ s: Scenario) {
        let yRefTarget = ClimbCalc.getClimbYRef(s.data, s.paTarget, s.tTarget)
        let yRefStart = ClimbCalc.getClimbYRef(s.data, s.paStart, s.tStart)

        let netTime = max(0, ClimbCalc.getTime(s.data, yRefTarget) - ClimbCalc.getTime(s.data, yRefStart))
        let netDist = max(0, ClimbCalc.getDist(s.data, yRefTarget) - ClimbCalc.getDist(s.data, yRefStart))
        let netFuel = max(0, ClimbCalc.getFuel(s.data, yRefTarget) - ClimbCalc.getFuel(s.data, yRefStart))

        assertWithinPercent(netTime, s.time, "\(s.name) time")
        assertWithinPercent(netDist, s.dist, "\(s.name) dist")
        assertWithinPercent(netFuel, s.fuel, "\(s.name) fuel")
    }

    func testNetClimbScenarios() {
        for s in Self.scenarios { runScenario(s) }
    }

    func testSinglePAScenarios() {
        for s in Self.singlePAScenarios { runScenario(s) }
    }

    /// The composite AvCalcEngine.calculateClimb facade should reproduce the same
    /// net values as calling the individual ClimbCalc functions directly.
    func testCalculateClimbFacadeMatchesDirectCalls() throws {
        let altimeter = 29.92
        let result = try XCTUnwrap(AvCalcEngine.calculateClimb(
            aircraftType: "pa28-161", altitude: 5000, altimeter: altimeter,
            cruiseTemp: 16, startAlt: 1500, startClimbTemp: 27
        ))
        assertWithinPercent(result.netTime, 9, "facade netTime")
        assertWithinPercent(result.netDist, 12, "facade netDist")
        assertWithinPercent(result.netFuel, 1.54, "facade netFuel")
    }
}
