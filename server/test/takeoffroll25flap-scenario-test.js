// Run with: node test/takeoffroll25flap-scenario-test.js  (from server/ directory)
import { calculateTakeoffPerformance } from '../src/lib/takeoff-calc.js';
import * as pa28161TakeoffRollFlap25 from '../src/data/pa28-161-takeoffroll-25flap-data.js';

// DRAFT — expected values computed from placeholder data (copied from 0° flap Figure 5-7).
// All expected values must be re-baselined once the actual 25° flap chart data is digitized.
//
// null = TBD: computed value will be printed without comparison.
// altimeterInHg = 29.92 throughout (standard, so PA = field elevation).

const SCENARIOS = [

    // --- POH Worked Example (Figure 5-8) ---
    // TBD: replace with actual 25° flap POH example inputs and expected distance.
    {
        name: 'PA28-161 TakeoffRoll 25°F — POH example: TBD (placeholder)',
        data:          pa28161TakeoffRollFlap25,
        altitudeFt:    1500,
        altimeterInHg: 29.92,
        oatC:          27,
        weightLbs:     2316,
        windKts:       15,
        expected:      null,    // TBD: validate against Figure 5-8
    },

    // --- Representative scenarios (placeholders — same values as 0° flap chart) ---

    // Below lowest weight reference line, HW
    {
        name: 'PA28-161 TakeoffRoll 25°F — 0 ft / 0°C / 2440 lbs / 5 kt HW  [below yRef1=22, PLACEHOLDER]',
        data:          pa28161TakeoffRollFlap25,
        altitudeFt:    0,
        altimeterInHg: 29.92,
        oatC:          0,
        weightLbs:     2440,
        windKts:       5,
        expected:      770,
    },

    // Below lowest weight reference line, TW
    {
        name: 'PA28-161 TakeoffRoll 25°F — 0 ft / 0°C / 2440 lbs / 5 kt TW  [below yRef1=22, PLACEHOLDER]',
        data:          pa28161TakeoffRollFlap25,
        altitudeFt:    0,
        altimeterInHg: 29.92,
        oatC:          0,
        weightLbs:     2440,
        windKts:       -5,
        expected:      1104,
    },

    // Mid-range: ISA PA=3000, max weight, HW
    {
        name: 'PA28-161 TakeoffRoll 25°F — 3000 ft / 9°C (ISA) / 2440 lbs / 10 kt HW  [yRef1≈33, PLACEHOLDER]',
        data:          pa28161TakeoffRollFlap25,
        altitudeFt:    3000,
        altimeterInHg: 29.92,
        oatC:          9,
        weightLbs:     2440,
        windKts:       10,
        expected:      1411,
    },

    // Mid-range: same conditions, TW
    {
        name: 'PA28-161 TakeoffRoll 25°F — 3000 ft / 9°C (ISA) / 2440 lbs / 5 kt TW  [yRef1≈33, PLACEHOLDER]',
        data:          pa28161TakeoffRollFlap25,
        altitudeFt:    3000,
        altimeterInHg: 29.92,
        oatC:          9,
        weightLbs:     2440,
        windKts:       -5,
        expected:      2074,
    },

    // Above highest weight reference line, ISA PA=7000, HW
    {
        name: 'PA28-161 TakeoffRoll 25°F — 7000 ft / 1°C (ISA) / 2440 lbs / 5 kt HW  [above yRef1=45, PLACEHOLDER]',
        data:          pa28161TakeoffRollFlap25,
        altitudeFt:    7000,
        altimeterInHg: 29.92,
        oatC:          1,
        weightLbs:     2440,
        windKts:       5,
        expected:      2242,
    },

    // Above highest weight reference line, TW
    {
        name: 'PA28-161 TakeoffRoll 25°F — 7000 ft / 1°C (ISA) / 2440 lbs / 5 kt TW  [above yRef1=45, PLACEHOLDER]',
        data:          pa28161TakeoffRollFlap25,
        altitudeFt:    7000,
        altimeterInHg: 29.92,
        oatC:          1,
        weightLbs:     2440,
        windKts:       -5,
        expected:      2600,
    },

    // === Boundary: lowest reachable distance ===
    {
        name: 'PA28-161 TakeoffRoll 25°F — 0 ft / -13°C / 1600 lbs / 15 kt HW  [lowest reachable, PLACEHOLDER]',
        data:          pa28161TakeoffRollFlap25,
        altitudeFt:    0,
        altimeterInHg: 29.92,
        oatC:          -13,
        weightLbs:     1600,
        windKts:       15,
        expected:      280,
    },

    // === Boundary: highest reachable headwind distance ===
    {
        name: 'PA28-161 TakeoffRoll 25°F — 7000 ft / 17°C / 2440 lbs / calm  [highest reachable HW, PLACEHOLDER]',
        data:          pa28161TakeoffRollFlap25,
        altitudeFt:    7000,
        altimeterInHg: 29.92,
        oatC:          17,
        weightLbs:     2440,
        windKts:       0,
        expected:      2400,
    },

    // === Boundary: highest reachable tailwind distance ===
    {
        name: 'PA28-161 TakeoffRoll 25°F — 7000 ft / 17°C / 2440 lbs / 5 kt TW  [highest reachable TW, PLACEHOLDER]',
        data:          pa28161TakeoffRollFlap25,
        altitudeFt:    7000,
        altimeterInHg: 29.92,
        oatC:          17,
        weightLbs:     2440,
        windKts:       -5,
        expected:      2600,
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
console.log(`  NOTE: All expected values are PLACEHOLDERS pending chart calibration.`);
console.log(`${'═'.repeat(58)}\n`);
if (failed > 0) process.exit(1);
