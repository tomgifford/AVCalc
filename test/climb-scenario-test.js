// Run with: node test/climb-scenario-test.js
import { getClimbYRef, getDist, getTime, getFuel } from '../src/lib/climb-calc.js';
import * as pa28161Climb from '../src/lib/pa28-161-climb-data.js';
import * as pa28181Climb from '../src/lib/pa28-181-climb-data.js';

// null = TBD: computed value will be printed without comparison
const SCENARIOS = [

    // --- Original net-climb scenarios ---
    {
        name: 'PA28-161 — 1500 ft / 27°C to 5000 ft / 16°C',
        aircraft: pa28161Climb,
        paStart:  1500, tStart:  27,
        paTarget: 5000, tTarget: 16,
        expected: { time: 9, dist: 12, fuel: 1.54 },
    },
   {
        name: 'PA28-161 — 0 ft / 27°C to 5000 ft / 16°C',
        aircraft: pa28161Climb,
        paStart:  0, tStart:  27,
        paTarget: 5000, tTarget: 16,
        expected: { time: 12.0, dist: 15.8, fuel: 2.24 },
    },
   {
        name: 'PA28-161 — 0 ft / 27°C to 1500 ft / 27°C',
        aircraft: pa28161Climb,
        paStart:  0, tStart:  27,
        paTarget: 1500, tTarget: 27,
        expected: { time: 3.4, dist: 4.2, fuel: 0.7 },
    },    
     {
        name: 'PA28-181 — 1000 ft / 23°C to 5000 ft / 16°C',
        aircraft: pa28181Climb,
        paStart:  1000, tStart:  23,
        paTarget: 5000, tTarget: 16,
        expected: { time: 7, dist: 10.0, fuel: 1.7 },
    },
    {
        name: 'PA28-181 — 0 ft / 15°C to 5000 ft / 16°C  [split of 1000→5000]',
        aircraft: pa28181Climb,
        paStart:     0, tStart:  15,
        paTarget: 5000, tTarget: 16,
        expected: { time: 10.0, dist: 13.75, fuel: 2.2 },
    },
    {
        name: 'PA28-181 — 0 ft / 15°C to 1000 ft / 23°C  [split of 1000→5000]',
        aircraft: pa28181Climb,
        paStart:     0, tStart:  15,
        paTarget: 1000, tTarget: 23,
        expected: { time: 2.8, dist: 3.75, fuel: 0.5 },
    },
    {
        name: 'PA28-181 — 0 ft / 23°C to 2000 ft / 21°C',
        aircraft: pa28181Climb,
        paStart:     0, tStart:  23,
        paTarget: 2000, tTarget: 21,
        expected: { time: 4.0, dist: 5.8, fuel: 1.0 },
    },
    {
        name: 'PA28-181 — 0 ft / 23°C to 6000 ft / 21°C',
        aircraft: pa28181Climb,
        paStart:     0, tStart:  23,
        paTarget: 6000, tTarget: 13,
        expected: { time: 12.5, dist: 17.5, fuel: 3.0 },
    },

    // --- PA28-181 single-PA chart lookup scenarios (from sea level) ---
    // null = TBD: computed value printed, no comparison

    // PA 0
    { name: 'PA28-181 — PA    0 / Std  15.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:     0, tTarget:  15.0, expected: { time:   0,     dist:    0,     fuel:    0    } },
    { name: 'PA28-181 — PA    0 / Max  37.8°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:     0, tTarget:  37.8, expected: { time:   0,     dist:    0,     fuel:    0    } },
    { name: 'PA28-181 — PA    0 / Min -28.9°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:     0, tTarget: -28.9, expected: { time:   0,     dist:    0,     fuel:    0    } },
    // PA 1000
    { name: 'PA28-181 — PA 1000 / Std  13.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  1000, tTarget:  13.0, expected: { time:   1.2,   dist:    1.5,   fuel:    0.2  } },
    { name: 'PA28-181 — PA 1000 / Max  37.8°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  1000, tTarget:  37.8, expected: { time:   5,     dist:    7,     fuel:    1.25 } },
    { name: 'PA28-181 — PA 1000 / Min   4.4°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  1000, tTarget:   4.4, expected: { time:   0,     dist:    0,     fuel:    0    } },
    // PA 2000
    { name: 'PA28-181 — PA 2000 / Std  11.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  2000, tTarget:  11.0, expected: { time: null,   dist: null,    fuel: null   } },
    { name: 'PA28-181 — PA 2000 / Max  37.8°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  2000, tTarget:  37.8, expected: { time: null,   dist: null,    fuel: null   } },
    { name: 'PA28-181 — PA 2000 / Min  -5.6°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  2000, tTarget:  -5.6, expected: { time:   0,     dist:    0,     fuel:    0    } },
    // PA 3000
    { name: 'PA28-181 — PA 3000 / Std   9.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  3000, tTarget:   9.0, expected: { time: null,   dist: null,    fuel: null   } },
    { name: 'PA28-181 — PA 3000 / Max  37.8°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  3000, tTarget:  37.8, expected: { time: null,   dist: null,    fuel: null   } },
    { name: 'PA28-181 — PA 3000 / Min -15.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  3000, tTarget: -15.0, expected: { time:   0,     dist:    0,     fuel:    0    } },
    // PA 4000
    { name: 'PA28-181 — PA 4000 / Std   7.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  4000, tTarget:   7.0, expected: { time: null,   dist: null,    fuel:    1.25 } },
    { name: 'PA28-181 — PA 4000 / Max  37.8°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  4000, tTarget:  37.8, expected: { time:  13.5,   dist:   18,     fuel:    3    } },
    { name: 'PA28-181 — PA 4000 / Min -23.9°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  4000, tTarget: -23.9, expected: { time:   0,     dist:    0,     fuel:    0    } },
    // PA 5000
    { name: 'PA28-181 — PA 5000 / Std   5.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  5000, tTarget:   5.0, expected: { time: null,   dist: null,    fuel: null   } },
    { name: 'PA28-181 — PA 5000 / Max  37.8°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  5000, tTarget:  37.8, expected: { time: null,   dist: null,    fuel: null   } },
    { name: 'PA28-181 — PA 5000 / Min -28.9°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  5000, tTarget: -28.9, expected: { time:   1.05,  dist:    1.2,   fuel:    0.15 } },
    // PA 6000
    { name: 'PA28-181 — PA 6000 / Std   3.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  6000, tTarget:   3.0, expected: { time: null,   dist: null,    fuel: null   } },
    { name: 'PA28-181 — PA 6000 / Max  37.8°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  6000, tTarget:  37.8, expected: { time: null,   dist: null,    fuel: null   } },
    { name: 'PA28-181 — PA 6000 / Min -28.9°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  6000, tTarget: -28.9, expected: { time: null,   dist: null,    fuel: null   } },
    // PA 7000
    { name: 'PA28-181 — PA 7000 / Std   1.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  7000, tTarget:   1.0, expected: { time: null,   dist: null,    fuel: null   } },
    { name: 'PA28-181 — PA 7000 / Max  37.8°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  7000, tTarget:  37.8, expected: { time:  26,     dist:   36.25,  fuel:    5.2  } },
    { name: 'PA28-181 — PA 7000 / Min -28.9°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  7000, tTarget: -28.9, expected: { time: null,   dist: null,    fuel: null   } },
    // PA 8000
    { name: 'PA28-181 — PA 8000 / Std  -1.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  8000, tTarget:  -1.0, expected: { time:  15,     dist:   20,     fuel:    3.2  } },
    { name: 'PA28-181 — PA 8000 / Max  37.8°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  8000, tTarget:  37.8, expected: { time: null,   dist: null,    fuel: null   } },
    { name: 'PA28-181 — PA 8000 / Min -28.9°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  8000, tTarget: -28.9, expected: { time:   7,     dist:    9.5,   fuel:    1.7  } },
    // PA 9000
    { name: 'PA28-181 — PA 9000 / Std  -3.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  9000, tTarget:  -3.0, expected: { time: null,   dist: null,    fuel: null   } },
    { name: 'PA28-181 — PA 9000 / Max  37.8°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  9000, tTarget:  37.8, expected: { time:  41,     dist: null,    fuel:    7.7  } },
    { name: 'PA28-181 — PA 9000 / Min -28.9°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget:  9000, tTarget: -28.9, expected: { time: null,   dist: null,    fuel: null   } },
    // PA 10000
    { name: 'PA28-181 — PA 10000 / Std  -5.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget: 10000, tTarget:  -5.0, expected: { time: null,   dist: null,    fuel: null   } },
    { name: 'PA28-181 — PA 10000 / Max  31.7°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget: 10000, tTarget:  31.7, expected: { time:  45,     dist:   69,     fuel:    8.6  } },
    { name: 'PA28-181 — PA 10000 / Min -28.9°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget: 10000, tTarget: -28.9, expected: { time: null,   dist: null,    fuel: null   } },
    // PA 11000
    { name: 'PA28-181 — PA 11000 / Std  -7.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget: 11000, tTarget:  -7.0, expected: { time: null,   dist: null,    fuel: null   } },
    { name: 'PA28-181 — PA 11000 / Max  20.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget: 11000, tTarget:  20.0, expected: { time:  45,     dist:   69,     fuel:    8.6  } },
    { name: 'PA28-181 — PA 11000 / Min -28.9°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget: 11000, tTarget: -28.9, expected: { time:  16,     dist:   21.5,   fuel:    3.5  } },
    // PA 12000
    { name: 'PA28-181 — PA 12000 / Std  -9.0°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget: 12000, tTarget:  -9.0, expected: { time:  31.2,   dist:   42.7,   fuel:    6.3  } },
    { name: 'PA28-181 — PA 12000 / Max   8.9°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget: 12000, tTarget:   8.9, expected: { time:  45,     dist:   69,     fuel:    8.6  } },
    { name: 'PA28-181 — PA 12000 / Min -28.9°C', aircraft: pa28181Climb, paStart: 0, tStart: 15, paTarget: 12000, tTarget: -28.9, expected: { time: null,   dist: null,    fuel: null   } },

    // --- PA28-161 single-PA chart lookup scenarios (from sea level) ---

    // PA 0
    { name: 'PA28-161 — PA    0 / Std  15°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:     0, tTarget:  15,   expected: { time:   0,    dist:    0,    fuel:    0    } },
    { name: 'PA28-161 — PA    0 / Max  40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:     0, tTarget:  40,   expected: { time:   0,    dist:    0,    fuel:    0    } },
    { name: 'PA28-161 — PA    0 / Min -40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:     0, tTarget: -40,   expected: { time:   0,    dist:    0,    fuel:    0    } },
    // PA 1000
    { name: 'PA28-161 — PA 1000 / Std  13°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  1000, tTarget:  13,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 1000 / Max  40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  1000, tTarget:  40,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 1000 / Min -40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  1000, tTarget: -40,   expected: { time: null,  dist: null,  fuel: null   } },
    // PA 2000
    { name: 'PA28-161 — PA 2000 / Std  11°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  2000, tTarget:  11,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 2000 / Max  40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  2000, tTarget:  40,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 2000 / Min -40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  2000, tTarget: -40,   expected: { time: null,  dist: null,  fuel: null   } },
    // PA 3000
    { name: 'PA28-161 — PA 3000 / Std   9°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  3000, tTarget:   9,   expected: { time:   6,   dist:    8,    fuel:    1.1} },
    { name: 'PA28-161 — PA 3000 / Max  40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  3000, tTarget:  40,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 3000 / Min -40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  3000, tTarget: -40,   expected: { time:   5,   dist:    6.5,  fuel:    1.0  } },
    // PA 4000
    { name: 'PA28-161 — PA 4000 / Std   7°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  4000, tTarget:   7,   expected: { time:   8.2, dist:   10.2,  fuel:    1.8  } },
    { name: 'PA28-161 — PA 4000 / Max  40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  4000, tTarget:  40,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 4000 / Min -40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  4000, tTarget: -40,   expected: { time: null,  dist: null,  fuel: null   } },
    // PA 5000
    { name: 'PA28-161 — PA 5000 / Std   5°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  5000, tTarget:   5,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 5000 / Max  40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  5000, tTarget:  40,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 5000 / Min -40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  5000, tTarget: -40,   expected: { time: null,  dist: null,  fuel: null   } },
    // PA 6000
    { name: 'PA28-161 — PA 6000 / Std   3°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  6000, tTarget:   3,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 6000 / Max  40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  6000, tTarget:  40,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 6000 / Min -40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  6000, tTarget: -40,   expected: { time:   9.5, dist:   12,    fuel:    1.8  } },
    // PA 7000
    { name: 'PA28-161 — PA 7000 / Std   1°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  7000, tTarget:   1,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 7000 / Max  40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  7000, tTarget:  40,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 7000 / Min -40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  7000, tTarget: -40,   expected: { time:  10.5, dist:   14.3,  fuel:    1.9  } },
    // PA 8000
    { name: 'PA28-161 — PA 8000 / Std  -1°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  8000, tTarget:  -1,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 8000 / Max  35.5°C',  aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  8000, tTarget:  35.5, expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 8000 / Min -40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  8000, tTarget: -40,   expected: { time:  13,   dist:   17,    fuel:    2.4  } },
    // PA 9000
    { name: 'PA28-161 — PA 9000 / Std  -3°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  9000, tTarget:  -3,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 9000 / Max  22.5°C',  aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  9000, tTarget:  22.5, expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 9000 / Min -40°C',    aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget:  9000, tTarget: -40,   expected: { time: null,  dist: null,  fuel: null   } },
    // PA 10000
    { name: 'PA28-161 — PA 10000 / Std  -5°C',   aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget: 10000, tTarget:  -5,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 10000 / Max  11°C',   aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget: 10000, tTarget:  11,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 10000 / Min -40°C',   aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget: 10000, tTarget: -40,   expected: { time: null,  dist: null,  fuel: null   } },
    // PA 11000
    { name: 'PA28-161 — PA 11000 / Std  -7°C',   aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget: 11000, tTarget:  -7,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 11000 / Max   2°C',   aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget: 11000, tTarget:   2,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 11000 / Min -40°C',   aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget: 11000, tTarget: -40,   expected: { time: null,  dist: null,  fuel: null   } },
    // PA 12000
    { name: 'PA28-161 — PA 12000 / Std  -9°C',   aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget: 12000, tTarget:  -9,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 12000 / Max  -9°C',   aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget: 12000, tTarget:  -9,   expected: { time: null,  dist: null,  fuel: null   } },
    { name: 'PA28-161 — PA 12000 / Min -40°C',   aircraft: pa28161Climb, paStart: 0, tStart: 15, paTarget: 12000, tTarget: -40,   expected: { time: null,  dist: null,  fuel: null   } },
];

function fmtField(label, computed, expected) {
    const c = computed.toFixed(2);
    if (expected === null) return `    ${label}: ${c} [TBD]`;
    if (expected === 0) {
        const ok = Math.abs(computed) < 0.01;
        return `    ${label}: ${c}  exp ${expected}  ${ok ? '✓' : '✗ MISMATCH'}`;
    }
    const err = ((computed - expected) / expected * 100).toFixed(1);
    const flag = Math.abs(parseFloat(err)) > 10 ? '✗ LARGE ERROR' : '✓';
    return `    ${label}: ${c}  exp ${expected}  err ${err}%  ${flag}`;
}

for (const s of SCENARIOS) {
    const yRefTarget = getClimbYRef(s.aircraft, s.paTarget, s.tTarget);
    const yRefStart  = getClimbYRef(s.aircraft, s.paStart,  s.tStart);

    const netTime = Math.max(0, getTime(s.aircraft, yRefTarget) - getTime(s.aircraft, yRefStart));
    const netDist = Math.max(0, getDist(s.aircraft, yRefTarget) - getDist(s.aircraft, yRefStart));
    const netFuel = Math.max(0, getFuel(s.aircraft, yRefTarget) - getFuel(s.aircraft, yRefStart));

    console.log(`\n=== ${s.name} ===`);
    console.log(`    yRef: start=${yRefStart.toFixed(2)}  target=${yRefTarget.toFixed(2)}`);
    console.log(fmtField('Time (min)', netTime, s.expected.time));
    console.log(fmtField('Dist (nm) ', netDist, s.expected.dist));
    console.log(fmtField('Fuel (gal)', netFuel, s.expected.fuel));
}
