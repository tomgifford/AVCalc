// Run with: node test/pa28-151-takeoff-scenario-test.js  (from server/ directory)
import { calculatePA151TakeoffPerformance } from '../src/lib/pa28-151-takeoff-calc.js';
import * as pa28151Takeoff from '../src/data/pa28-151-takeoff-data.js';

// DRAFT — expected values are TBD. All expected values must be baselined once
// actual PA-28-151 chart data is digitized. Weight is always max gross for PA-28-151.
//
// null = TBD: computed value will be printed without comparison.
// altimeterInHg = 29.92 throughout (standard, so PA = field elevation).

const SCENARIOS = [

    {
        name: 'PA28-151 Takeoff 0°F Obstacle — 2000 ft / 21.1°C / 8 kt HW  [PLACEHOLDER]',
        altitudeFt:    2000,
        altimeterInHg: 29.92,
        oatC:          21.1,
        windKts:       8,
        chartType:     'obstacle',
        expected:      null,
    },

    {
        name: 'PA28-151 Takeoff 0°F Obstacle — 2000 ft / 21.1°C / 8 kt HW (roll)  [PLACEHOLDER]',
        altitudeFt:    2000,
        altimeterInHg: 29.92,
        oatC:          21.1,
        windKts:       8,
        chartType:     'roll',
        expected:      null,
    },

    {
        name: 'PA28-151 Takeoff 0°F Obstacle — 4000 ft / 7°C / 3 kt HW  [PLACEHOLDER]',
        altitudeFt:    4000,
        altimeterInHg: 29.92,
        oatC:          7,
        windKts:       3,
        chartType:     'obstacle',
        expected:      null,
    },

    {
        name: 'PA28-151 Takeoff 0°F Ground Roll — 4000 ft / 7°C / 3 kt HW  [PLACEHOLDER]',
        altitudeFt:    4000,
        altimeterInHg: 29.92,
        oatC:          7,
        windKts:       3,
        chartType:     'roll',
        expected:      null,
    },

    {
        name: 'PA28-151 Takeoff 0°F Obstacle — calm  [PLACEHOLDER]',
        altitudeFt:    2000,
        altimeterInHg: 29.92,
        oatC:          15,
        windKts:       0,
        chartType:     'obstacle',
        expected:      null,
    },

    {
        name: 'PA28-151 Takeoff 0°F Ground Roll — 5 kt TW  [PLACEHOLDER]',
        altitudeFt:    2000,
        altimeterInHg: 29.92,
        oatC:          15,
        windKts:       -5,
        chartType:     'roll',
        expected:      null,
    },

];

function fmtField(label, computed, expected) {
    if (computed == null) return `    ${label}: null (off-chart or missing data)`;
    const c = computed.toFixed(0);
    if (expected === null) return `    ${label}: ${c} ft [TBD]`;
    const err = ((computed - expected) / expected * 100).toFixed(1);
    const flag = Math.abs(parseFloat(err)) > 10 ? '✗ LARGE ERROR' : '✓';
    return `    ${label}: ${c} ft  exp ${expected} ft  err ${err}%  ${flag}`;
}

let passed = 0, failed = 0, tbd = 0;

for (const s of SCENARIOS) {
    const result = calculatePA151TakeoffPerformance(
        pa28151Takeoff, s.chartType, s.altitudeFt, s.altimeterInHg, s.oatC, s.windKts
    );

    console.log(`\n=== ${s.name} ===`);
    console.log(`    PA: ${result.pa.toFixed(0)} ft  yRef: ${result.yRef?.toFixed(3)}`);

    const line = fmtField(`Dist (${s.chartType})`, result.distanceFt, s.expected);
    console.log(line);

    if (s.expected === null)       tbd++;
    else if (line.includes('✗'))  failed++;
    else                          passed++;
}

console.log(`\n${'═'.repeat(58)}`);
console.log(`  Results: ${passed} passed  ${failed} failed  ${tbd} TBD`);
console.log(`  NOTE: All expected values are PLACEHOLDERS pending chart digitization.`);
console.log(`${'═'.repeat(58)}\n`);
if (failed > 0) process.exit(1);
