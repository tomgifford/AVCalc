// Run with: node test/pa28-181-takeoff-scenario-test.js  (from server/ directory)
import { calculateTakeoffPerformance } from '../src/lib/takeoff-calc.js';
import * as pa28181Takeoff50 from '../src/data/pa28-181-takeoff50-data.js';

// DRAFT — expected values are placeholders copied from PA-28-161 scenarios.
// All expected values must be re-baselined once actual PA-28-181 chart data is digitized.
//
// null = TBD: computed value will be printed without comparison.
// altimeterInHg = 29.92 throughout (standard, so PA = field elevation).

const SCENARIOS = [

    // --- Representative scenarios (placeholders) ---

    {
        name: 'PA28-181 Takeoff50 0°F — 2000 ft / 14°C / 2200 lbs / 5 kt HW  [PLACEHOLDER]',
        data:          pa28181Takeoff50,
        altitudeFt:    2000,
        altimeterInHg: 29.92,
        oatC:          14,
        weightLbs:     2200,
        windKts:       5,
        expected:      1900,
    },

    {
        name: 'PA28-181 Takeoff50 0°F — 2000 ft / 14°C / 2200 lbs / 5 kt TW  [PLACEHOLDER]',
        data:          pa28181Takeoff50,
        altitudeFt:    2000,
        altimeterInHg: 29.92,
        oatC:          14,
        weightLbs:     2200,
        windKts:       -5,
        expected:      2400,
    },

    {
        name: 'PA28-181 Takeoff50 0°F — 4000 ft / 7°C / 2440 lbs / 3 kt HW  [PLACEHOLDER]',
        data:          pa28181Takeoff50,
        altitudeFt:    4000,
        altimeterInHg: 29.92,
        oatC:          7,
        weightLbs:     2440,
        windKts:       3,
        expected:      null,    // TBD
    },

    // === Boundary: lowest reachable distance ===
    {
        name: 'PA28-181 Takeoff50 0°F — 0 ft / -6°C / 1600 lbs / 15 kt HW  [lowest reachable, PLACEHOLDER]',
        data:          pa28181Takeoff50,
        altitudeFt:    0,
        altimeterInHg: 29.92,
        oatC:          -6,
        weightLbs:     1600,
        windKts:       15,
        expected:      300,
    },

    // === Boundary: highest reachable distance ===
    {
        name: 'PA28-181 Takeoff50 0°F — 7000 ft / 11°C / 2440 lbs / 5 kt TW  [highest reachable, PLACEHOLDER]',
        data:          pa28181Takeoff50,
        altitudeFt:    7000,
        altimeterInHg: 29.92,
        oatC:          11,
        weightLbs:     2440,
        windKts:       -5,
        expected:      4500,
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
