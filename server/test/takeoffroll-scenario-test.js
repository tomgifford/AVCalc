// Run with: node test/takeoffroll-scenario-test.js  (from server/ directory)
import { calculateTakeoffPerformance } from '../src/lib/takeoff-calc.js';
import * as pa28161TakeoffRoll from '../src/data/pa28-161-takeoffroll-data.js';

// null = TBD: computed value will be printed without comparison
// Expected distances are in feet (ground roll).
// altimeterInHg = 29.92 throughout (standard, so PA = field elevation).

const SCENARIOS = [

    // --- POH Worked Example (Figure 5-7) ---
    {
        name: 'PA28-161 TakeoffRoll — POH example: 1500 ft / 27°C / 2316 lbs / 15 kt HW',
        data:          pa28161TakeoffRoll,
        altitudeFt:    1500,
        altimeterInHg: 29.92,
        oatC:          27,
        weightLbs:     2316,
        windKts:       15,
        expected:      null,    // TBD: validate against Figure 5-7 (~1150 ft)
    },

    // --- Coverage Tests: Weight-Panel Reference Lines × Wind Variants × ISA PA Intersections ---
    //
    // Expected values computed from current implementation (chart data calibrated against POH).
    //
    // Req 1: below lowest ref line (yRef1<22), between each pair, above highest (>45)
    // Req 2: headwind, calm, and tailwind variants across bands
    // Req 3: ISA standard temp (15 - 2×PA_thousands °C) at every PA line (0–7000 ft)
    // A single scenario satisfies multiple requirements where possible.

    // === Below lowest weight reference line (yRef1 < 22) ===   [Req 1+2]
    {
        name: 'PA28-161 TakeoffRoll — 0 ft / 0°C / 2440 lbs / 5 kt HW  [below yRef1=22]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    0,
        altimeterInHg: 29.92,
        oatC:          0,
        weightLbs:     2440,
        windKts:       5,
        expected:      770,
    },
    {
        name: 'PA28-161 TakeoffRoll — 0 ft / 0°C / 2440 lbs / calm  [below yRef1=22]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    0,
        altimeterInHg: 29.92,
        oatC:          0,
        weightLbs:     2440,
        windKts:       0,
        expected:      840,
    },
    {
        name: 'PA28-161 TakeoffRoll — 0 ft / 0°C / 2440 lbs / 5 kt TW  [below yRef1=22]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    0,
        altimeterInHg: 29.92,
        oatC:          0,
        weightLbs:     2440,
        windKts:       -5,
        expected:      1104,
    },

    // === ISA PA=0 (yRef1≈22.6, low edge of 22–30 band) ===   [Req 3: PA 0 ft, ISA=15°C]
    {
        name: 'PA28-161 TakeoffRoll — 0 ft / 15°C (ISA) / 2200 lbs / 8 kt HW  [yRef1≈22.6]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    0,
        altimeterInHg: 29.92,
        oatC:          15,
        weightLbs:     2200,
        windKts:       8,
        expected:      756,
    },
    {
        name: 'PA28-161 TakeoffRoll — 0 ft / 15°C (ISA) / 2200 lbs / 5 kt TW  [yRef1≈22.6]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    0,
        altimeterInHg: 29.92,
        oatC:          15,
        weightLbs:     2200,
        windKts:       -5,
        expected:      1140,
    },

    // === yRef1 band 22–30 + ISA PA=1000 ===   [Req 1+2+3: PA 1000 ft, ISA=13°C, yRef1≈26.3]
    {
        name: 'PA28-161 TakeoffRoll — 1000 ft / 13°C (ISA) / 2440 lbs / 5 kt HW  [yRef1≈26.3]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    1000,
        altimeterInHg: 29.92,
        oatC:          13,
        weightLbs:     2440,
        windKts:       5,
        expected:      1217,
    },
    {
        name: 'PA28-161 TakeoffRoll — 1000 ft / 13°C (ISA) / 2440 lbs / 12 kt HW  [yRef1≈26.3]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    1000,
        altimeterInHg: 29.92,
        oatC:          13,
        weightLbs:     2440,
        windKts:       12,
        expected:      1086,
    },
    {
        name: 'PA28-161 TakeoffRoll — 1000 ft / 13°C (ISA) / 2440 lbs / 5 kt TW  [yRef1≈26.3]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    1000,
        altimeterInHg: 29.92,
        oatC:          13,
        weightLbs:     2440,
        windKts:       -5,
        expected:      1649,
    },

    // === ISA PA=2000 (yRef1≈29.6, upper 22–30 band) ===   [Req 3: PA 2000 ft, ISA=11°C]
    {
        name: 'PA28-161 TakeoffRoll — 2000 ft / 11°C (ISA) / 2000 lbs / 5 kt HW  [yRef1≈29.6]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    2000,
        altimeterInHg: 29.92,
        oatC:          11,
        weightLbs:     2000,
        windKts:       5,
        expected:      837,
    },
    {
        name: 'PA28-161 TakeoffRoll — 2000 ft / 11°C (ISA) / 2000 lbs / 5 kt TW  [yRef1≈29.6]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    2000,
        altimeterInHg: 29.92,
        oatC:          11,
        weightLbs:     2000,
        windKts:       -5,
        expected:      1184,
    },

    // === yRef1 band 30–37.8 + ISA PA=3000 ===   [Req 1+2+3: PA 3000 ft, ISA=9°C, yRef1≈33.0]
    {
        name: 'PA28-161 TakeoffRoll — 3000 ft / 9°C (ISA) / 2440 lbs / 10 kt HW  [yRef1≈33.0]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    3000,
        altimeterInHg: 29.92,
        oatC:          9,
        weightLbs:     2440,
        windKts:       10,
        expected:      1411,
    },
    {
        name: 'PA28-161 TakeoffRoll — 3000 ft / 9°C (ISA) / 2440 lbs / calm  [yRef1≈33.0]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    3000,
        altimeterInHg: 29.92,
        oatC:          9,
        weightLbs:     2440,
        windKts:       0,
        expected:      1659,
    },
    {
        name: 'PA28-161 TakeoffRoll — 3000 ft / 9°C (ISA) / 2440 lbs / 5 kt TW  [yRef1≈33.0]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    3000,
        altimeterInHg: 29.92,
        oatC:          9,
        weightLbs:     2440,
        windKts:       -5,
        expected:      2074,
    },

    // === ISA PA=4000 (yRef1≈36.6, upper 30–37.8 band) ===   [Req 3: PA 4000 ft, ISA=7°C]
    {
        name: 'PA28-161 TakeoffRoll — 4000 ft / 7°C (ISA) / 2440 lbs / 3 kt HW  [yRef1≈36.6]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    4000,
        altimeterInHg: 29.92,
        oatC:          7,
        weightLbs:     2440,
        windKts:       3,
        expected:      1747,
    },
    {
        name: 'PA28-161 TakeoffRoll — 4000 ft / 7°C (ISA) / 2440 lbs / 5 kt TW  [yRef1≈36.6]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    4000,
        altimeterInHg: 29.92,
        oatC:          7,
        weightLbs:     2440,
        windKts:       -5,
        expected:      2285,
    },

    // === yRef1 band 37.8–45 + ISA PA=5000 ===   [Req 1+2+3: PA 5000 ft, ISA=5°C, yRef1≈40.0]
    {
        name: 'PA28-161 TakeoffRoll — 5000 ft / 5°C (ISA) / 2440 lbs / 7 kt HW  [yRef1≈40.0]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    5000,
        altimeterInHg: 29.92,
        oatC:          5,
        weightLbs:     2440,
        windKts:       7,
        expected:      1800,
    },
    {
        name: 'PA28-161 TakeoffRoll — 5000 ft / 5°C (ISA) / 2440 lbs / 5 kt TW  [yRef1≈40.0]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    5000,
        altimeterInHg: 29.92,
        oatC:          5,
        weightLbs:     2440,
        windKts:       -5,
        expected:      2501,
    },

    // === ISA PA=6000 (yRef1≈43.4, upper 37.8–45 band) ===   [Req 3: PA 6000 ft, ISA=3°C]
    {
        name: 'PA28-161 TakeoffRoll — 6000 ft / 3°C (ISA) / 2440 lbs / 5 kt HW  [yRef1≈43.4]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    6000,
        altimeterInHg: 29.92,
        oatC:          3,
        weightLbs:     2440,
        windKts:       5,
        expected:      2013,
    },
    {
        name: 'PA28-161 TakeoffRoll — 6000 ft / 3°C (ISA) / 2440 lbs / 5 kt TW  [yRef1≈43.4]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    6000,
        altimeterInHg: 29.92,
        oatC:          3,
        weightLbs:     2440,
        windKts:       -5,
        expected:      2585,
    },

    // === Above highest weight reference line (yRef1 > 45) + ISA PA=7000 ===   [Req 1+2+3]
    {
        name: 'PA28-161 TakeoffRoll — 7000 ft / 1°C (ISA) / 2440 lbs / 5 kt HW  [above yRef1=45]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    7000,
        altimeterInHg: 29.92,
        oatC:          1,
        weightLbs:     2440,
        windKts:       5,
        expected:      2242,
    },
    {
        name: 'PA28-161 TakeoffRoll — 7000 ft / 1°C (ISA) / 2440 lbs / calm  [above yRef1=45]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    7000,
        altimeterInHg: 29.92,
        oatC:          1,
        weightLbs:     2440,
        windKts:       0,
        expected:      2400,
    },
    {
        name: 'PA28-161 TakeoffRoll — 7000 ft / 1°C (ISA) / 2440 lbs / 5 kt TW  [above yRef1=45]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    7000,
        altimeterInHg: 29.92,
        oatC:          1,
        weightLbs:     2440,
        windKts:       -5,
        expected:      2600,
    },

    // === Boundary: lowest reachable distance ===
    // PA=0, OAT=-13°C (yRef1Lookup floor at PA=0), lightest weight (1600 lbs), max HW (15 kt).
    // yRef1=12 extrapolates below the weight table floor; yRef2 hits headwindLookup floor.
    {
        name: 'PA28-161 TakeoffRoll — 0 ft / -13°C / 1600 lbs / 15 kt HW  [lowest reachable dist]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    0,
        altimeterInHg: 29.92,
        oatC:          -13,
        weightLbs:     1600,
        windKts:       15,
        expected:      280,
    },

    // === Boundary: highest reachable headwind distance ===
    // PA=7000, OAT=17°C (near yRef1 ceiling at this PA), max weight (2440 lbs), calm.
    // yRef2 clamps above weight table ceiling; headwindLookup ceiling at yRef2=48 → 2400 ft.
    {
        name: 'PA28-161 TakeoffRoll — 7000 ft / 17°C / 2440 lbs / calm  [highest reachable HW dist]',
        data:          pa28161TakeoffRoll,
        altitudeFt:    7000,
        altimeterInHg: 29.92,
        oatC:          17,
        weightLbs:     2440,
        windKts:       0,
        expected:      2400,
    },

    // === Boundary: highest reachable tailwind distance ===
    // Same hot/heavy/high conditions, max TW (5 kt).
    // tailwindLookup ceiling at yRef2=44, max wind point 3.7 kt → 2600 ft; 5 kt clamps to 2600 ft.
    {
        name: 'PA28-161 TakeoffRoll — 7000 ft / 17°C / 2440 lbs / 5 kt TW  [highest reachable TW dist]',
        data:          pa28161TakeoffRoll,
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

    if (s.expected === null)       tbd++;
    else if (line.includes('✗'))  failed++;
    else                           passed++;
}

console.log(`\n${'═'.repeat(58)}`);
console.log(`  Results: ${passed} passed  ${failed} failed  ${tbd} TBD`);
console.log(`${'═'.repeat(58)}\n`);
if (failed > 0) process.exit(1);
