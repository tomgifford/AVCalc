// Shared assertion helper mirroring the percent-error methodology the original JS
// scenario scripts (test/*-scenario-test.js) use, rather than a fixed absolute epsilon —
// keeps the pass/fail bar consistent with what was already hand-verified against the POH charts.

import XCTest

func assertWithinPercent(_ computed: Double, _ expected: Double, percent: Double = 10, _ message: String = "", file: StaticString = #filePath, line: UInt = #line) {
    if expected == 0 {
        XCTAssertEqual(computed, 0, accuracy: 0.01, message, file: file, line: line)
        return
    }
    let err = abs((computed - expected) / expected * 100)
    XCTAssertLessThanOrEqual(err, percent, "\(message) — computed \(computed), expected \(expected), err \(err)%", file: file, line: line)
}
