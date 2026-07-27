// Run with: node test/takeoff-scenario-test.js  (from server/ directory)
import { calculateTakeoffPerformance } from '../src/lib/takeoff-calc.js';
import * as pa28161Takeoff50 from '../src/data/pa28-161-takeoff50-data.js';

// null = TBD: computed value will be printed without comparison
// Expected distances are in feet (takeoff over 50 ft obstacle).
// altimeterInHg defaults to 29.92 (standard) so PA ≈ field elevation.
const SCENARIOS = [

    // --- PA28-161 Takeoff Over 50 ft Obstacle (Figure 5-9) ---

    {
        name: 'PA28-161 Takeoff50 — 2000 ft / 14°C / 2200 lbs / 5 kt HW',
        data:          pa28161Takeoff50,
        altitudeFt:    2000,
        altimeterInHg: 29.92,
        oatC:          14,
        weightLbs:     2200,
        windKts:       5,       // positive = headwind
        expected:      1900,
    },

    {
        name: 'PA28-161 Takeoff50 — 2000 ft / 14°C / 2200 lbs / 5 kt TW',
        data:          pa28161Takeoff50,
        altitudeFt:    2000,
        altimeterInHg: 29.92,
        oatC:          14,
        weightLbs:     2200,
        windKts:       -5,      // negative = tailwind
        expected:      2400,
    },

    {
        name: 'PA28-161 Takeoff50 — 2000 ft / 14°C / 2200 lbs / 3 kt TW',
        data:          pa28161Takeoff50,
        altitudeFt:    2000,
        altimeterInHg: 29.92,
        oatC:          14,
        weightLbs:     2200,
        windKts:       -3,      // negative = tailwind
        expected:      2270,
    },

    // POH worked example (Figure 5-9): PA 1500 ft / 27°C / 2316 lbs / 15 kt HW → 2100 ft
    {
        name: 'PA28-161 Takeoff50 — POH example: 1500 ft / 27°C / 2316 lbs / 15 kt HW',
        data:          pa28161Takeoff50,
        altitudeFt:    1500,
        altimeterInHg: 29.92,
        oatC:          27,
        weightLbs:     2316,
        windKts:       15,
        expected:      2100,
    },

    // Example based on July 2026 KBUM flight plan 8 kt HW est., 27°C, PA 812 ft, 2100 lbs
    {
        name: 'PA28-161 Takeoff50 — KBUM July example: 812 ft / 27°C / 2100 lbs / 8 kt HW',
        data:          pa28161Takeoff50,
        altitudeFt:    812,
        altimeterInHg: 29.92,
        oatC:          27,
        weightLbs:     2100,
        windKts:       8,
        expected:      1600,
    },

    // --- Coverage Tests: Weight-Panel Reference Lines × Wind Variants × ISA PA Intersections ---
    //
    // Expected values are computed from the current implementation (DRAFT chart data).
    // These serve as regression baselines; values will shift when chart data is calibrated.
    //
    // Req 1: below lowest ref line (yRef1<20), between each pair, above highest (>44.4)
    // Req 2: headwind (positive) and tailwind (negative) variant for each yRef1 band
    // Req 3: ISA standard temp (15 - 2×PA_thousands °C) at every PA line (0–7000 ft)
    // A single scenario satisfies multiple requirements where possible.

    // === Below lowest weight reference line (yRef1 < 20) ===   [Req 1+2]
    {
        name: 'PA28-161 Takeoff50 — 0 ft / 0°C / 2440 lbs / 5 kt HW  [below yRef1=20]',
        data:          pa28161Takeoff50,
        altitudeFt:    0,
        altimeterInHg: 29.92,
        oatC:          0,
        weightLbs:     2440,
        windKts:       5,
        expected:      1880,
    },
    {
        name: 'PA28-161 Takeoff50 — 0 ft / 0°C / 2440 lbs / 3 kt TW  [below yRef1=20]',
        data:          pa28161Takeoff50,
        altitudeFt:    0,
        altimeterInHg: 29.92,
        oatC:          0,
        weightLbs:     2440,
        windKts:       -3,
        expected:      2228,
    },

    // === yRef1 band 20–26 + ISA PA=2000 ===   [Req 1+2+3: PA 2000 ft, ISA=11°C, yRef1≈25.0]
    {
        name: 'PA28-161 Takeoff50 — 2000 ft / 11°C (ISA) / 2440 lbs / 5 kt HW  [yRef1≈25]',
        data:          pa28161Takeoff50,
        altitudeFt:    2000,
        altimeterInHg: 29.92,
        oatC:          11,
        weightLbs:     2440,
        windKts:       5,
        expected:      2352,
    },
    {
        name: 'PA28-161 Takeoff50 — 2000 ft / 11°C (ISA) / 2440 lbs / 3 kt TW  [yRef1≈25]',
        data:          pa28161Takeoff50,
        altitudeFt:    2000,
        altimeterInHg: 29.92,
        oatC:          11,
        weightLbs:     2440,
        windKts:       -3,
        expected:      2773,
    },

    // === ISA PA=0 (lighter weight, in 20–26 band) ===   [Req 3: PA 0 ft, ISA=15°C, yRef1≈20.3]
    {
        name: 'PA28-161 Takeoff50 — 0 ft / 15°C (ISA) / 2200 lbs / 8 kt HW  [yRef1≈20]',
        data:          pa28161Takeoff50,
        altitudeFt:    0,
        altimeterInHg: 29.92,
        oatC:          15,
        weightLbs:     2200,
        windKts:       8,
        expected:      1398,
    },

    // === ISA PA=1000 ===   [Req 3: PA 1000 ft, ISA=13°C, yRef1≈22.7]
    {
        name: 'PA28-161 Takeoff50 — 1000 ft / 13°C (ISA) / 2000 lbs / 2 kt TW  [yRef1≈22.7]',
        data:          pa28161Takeoff50,
        altitudeFt:    1000,
        altimeterInHg: 29.92,
        oatC:          13,
        weightLbs:     2000,
        windKts:       -2,
        expected:      1496,
    },

    // === yRef1 band 26–32 + ISA PA=3000 ===   [Req 1+2+3: PA 3000 ft, ISA=9°C, yRef1≈27.9]
    {
        name: 'PA28-161 Takeoff50 — 3000 ft / 9°C (ISA) / 2200 lbs / 10 kt HW  [yRef1≈27.9]',
        data:          pa28161Takeoff50,
        altitudeFt:    3000,
        altimeterInHg: 29.92,
        oatC:          9,
        weightLbs:     2200,
        windKts:       10,
        expected:      1912,
    },
    {
        name: 'PA28-161 Takeoff50 — 3000 ft / 9°C (ISA) / 2200 lbs / 5 kt TW  [yRef1≈27.9]',
        data:          pa28161Takeoff50,
        altitudeFt:    3000,
        altimeterInHg: 29.92,
        oatC:          9,
        weightLbs:     2200,
        windKts:       -5,
        expected:      2576,
    },

    // === ISA PA=4000 (upper part of 26–32 band) ===   [Req 3: PA 4000 ft, ISA=7°C, yRef1≈30.9]
    {
        name: 'PA28-161 Takeoff50 — 4000 ft / 7°C (ISA) / 2440 lbs / 3 kt HW  [yRef1≈30.9]',
        data:          pa28161Takeoff50,
        altitudeFt:    4000,
        altimeterInHg: 29.92,
        oatC:          7,
        weightLbs:     2440,
        windKts:       3,
        expected:      2977,
    },

    // === yRef1 band 32–37 + ISA PA=5000 ===   [Req 1+2+3: PA 5000 ft, ISA=5°C, yRef1≈34.1]
    {
        name: 'PA28-161 Takeoff50 — 5000 ft / 5°C (ISA) / 2440 lbs / 7 kt HW  [yRef1≈34.1]',
        data:          pa28161Takeoff50,
        altitudeFt:    5000,
        altimeterInHg: 29.92,
        oatC:          5,
        weightLbs:     2440,
        windKts:       7,
        expected:      3154,
    },
    {
        name: 'PA28-161 Takeoff50 — 5000 ft / 5°C (ISA) / 2440 lbs / 3 kt TW  [yRef1≈34.1]',
        data:          pa28161Takeoff50,
        altitudeFt:    5000,
        altimeterInHg: 29.92,
        oatC:          5,
        weightLbs:     2440,
        windKts:       -3,
        expected:      3888,
    },

    // === yRef1 band 37–44.4 + ISA PA=6000 ===   [Req 1+2+3: PA 6000 ft, ISA=3°C, yRef1≈37.3]
    {
        name: 'PA28-161 Takeoff50 — 6000 ft / 3°C (ISA) / 2440 lbs / 5 kt HW  [yRef1≈37.3]',
        data:          pa28161Takeoff50,
        altitudeFt:    6000,
        altimeterInHg: 29.92,
        oatC:          3,
        weightLbs:     2440,
        windKts:       5,
        expected:      3616,
    },
    {
        name: 'PA28-161 Takeoff50 — 6000 ft / 3°C (ISA) / 2440 lbs / 3 kt TW  [yRef1≈37.3]',
        data:          pa28161Takeoff50,
        altitudeFt:    6000,
        altimeterInHg: 29.92,
        oatC:          3,
        weightLbs:     2440,
        windKts:       -3,
        expected:      4285,
    },

    // === ISA PA=7000 (upper part of 37–44.4 band) ===   [Req 3: PA 7000 ft, ISA=1°C, yRef1≈41.0]
    {
        name: 'PA28-161 Takeoff50 — 7000 ft / 1°C (ISA) / 2200 lbs / 5 kt HW  [yRef1≈41.0]',
        data:          pa28161Takeoff50,
        altitudeFt:    7000,
        altimeterInHg: 29.92,
        oatC:          1,
        weightLbs:     2200,
        windKts:       5,
        expected:      3106,
    },

    // === Above highest weight reference line (yRef1 > 44.4) ===   [Req 1+2: hot day, PA 6000]
    {
        name: 'PA28-161 Takeoff50 — 6000 ft / 24°C / 2440 lbs / 5 kt HW  [above yRef1=44.4]',
        data:          pa28161Takeoff50,
        altitudeFt:    6000,
        altimeterInHg: 29.92,
        oatC:          24,
        weightLbs:     2440,
        windKts:       5,
        expected:      3767,
    },
    {
        name: 'PA28-161 Takeoff50 — 6000 ft / 24°C / 2440 lbs / 3 kt TW  [above yRef1=44.4]',
        data:          pa28161Takeoff50,
        altitudeFt:    6000,
        altimeterInHg: 29.92,
        oatC:          24,
        weightLbs:     2440,
        windKts:       -3,
        expected:      4441,
    },

];

function fmtField(label, computed, expected) {
    if (computed === null) return `    ${label}: null (off-chart or missing data)`;
    const c = computed.toFixed(0);
    if (expected === null) return `    ${label}: ${c} ft [TBD]`;
    const err = ((computed - expected) / expected * 100).toFixed(1);
    const flag = Math.abs(parseFloat(err)) > 10 ? '✗ LARGE ERROR' : '✓';
    return `    ${label}: ${c} ft  exp ${expected} ft  err ${err}%  ${flag}`;
}

let passed = 0, failed = 0, tbd = 0;

for (const s of SCENARIOS) {
    const result = calculateTakeoffPerformance(
        s.data, s.altitudeFt, s.altimeterInHg, s.oatC, s.weightLbs, s.windKts
    );

    console.log(`\n=== ${s.name} ===`);
    console.log(`    PA: ${result.pa.toFixed(0)} ft  yRef1: ${result.yRef1?.toFixed(3)}  yRef2: ${result.yRef2?.toFixed(3)}`);

    const line = fmtField('Dist (ft)', result.distanceFt, s.expected);
    console.log(line);

    if (s.expected === null)         tbd++;
    else if (line.includes('✗'))    failed++;
    else                            passed++;
}

console.log(`\n${'═'.repeat(58)}`);
console.log(`  Results: ${passed} passed  ${failed} failed  ${tbd} TBD`);
console.log(`${'═'.repeat(58)}\n`);
if (failed > 0) process.exit(1);
