// Run with: node test/airspeed-test.js  (from server/ directory)
import { airspeedCalData } from '../src/data/airspeedcal-data.js';
import { getCASfromIAS, getIASfromCAS } from '../src/lib/airspeedcal-calc.js';
import { convertTasToCas } from '../src/lib/utility-calc.js';

const d151 = airspeedCalData['pa28-151'];
const d161 = airspeedCalData['pa28-161'];
const d181 = airspeedCalData['pa28-181'];

// null expected = TBD, prints computed value without pass/fail
const IAS_CAS_SCENARIOS = [

    // --- PA-28-151 Flaps UP ---
    { name: 'PA28-151 flapsUp — exact min IAS 50',          fn: () => getCASfromIAS(d151, 50,    'flapsUp'), expected: 58      },
    { name: 'PA28-151 flapsUp — exact max IAS 160',         fn: () => getCASfromIAS(d151, 160,   'flapsUp'), expected: 153     },
    { name: 'PA28-151 flapsUp — interp IAS 55',             fn: () => getCASfromIAS(d151, 55,    'flapsUp'), expected: 61.25   },
    { name: 'PA28-151 flapsUp — interp IAS 140',            fn: () => getCASfromIAS(d151, 140,   'flapsUp'), expected: 135     },
    { name: 'PA28-151 flapsUp — below min IAS 40 (extrap)', fn: () => getCASfromIAS(d151, 40,    'flapsUp'), expected: 51.5    },
    { name: 'PA28-151 flapsUp — above max IAS 170 (extrap)',fn: () => getCASfromIAS(d151, 170,   'flapsUp'), expected: 162     },

    // --- PA-28-151 Flaps UP inverse ---
    { name: 'PA28-151 flapsUp — inv exact CAS 58',          fn: () => getIASfromCAS(d151, 58,    'flapsUp'), expected: 50      },
    { name: 'PA28-151 flapsUp — inv exact CAS 153',         fn: () => getIASfromCAS(d151, 153,   'flapsUp'), expected: 160     },
    { name: 'PA28-151 flapsUp — inv interp CAS 61.25',      fn: () => getIASfromCAS(d151, 61.25, 'flapsUp'), expected: 55      },
    { name: 'PA28-151 flapsUp — inv below min CAS 48 (extrap)', fn: () => getIASfromCAS(d151, 48, 'flapsUp'), expected: 34.6154 },
    { name: 'PA28-151 flapsUp — inv above max CAS 163 (extrap)', fn: () => getIASfromCAS(d151, 163,'flapsUp'), expected: 171.1111 },

    // --- PA-28-151 Flaps 40 ---
    { name: 'PA28-151 flaps40 — exact min IAS 43.5',        fn: () => getCASfromIAS(d151, 43.5,  'flaps40'), expected: 50      },
    { name: 'PA28-151 flaps40 — exact max IAS 103',         fn: () => getCASfromIAS(d151, 103,   'flaps40'), expected: 100     },
    { name: 'PA28-151 flaps40 — interp IAS 51.75',          fn: () => getCASfromIAS(d151, 51.75, 'flaps40'), expected: 56      },
    { name: 'PA28-151 flaps40 — interp IAS 86.5',           fn: () => getCASfromIAS(d151, 86.5,  'flaps40'), expected: 85      },
    { name: 'PA28-151 flaps40 — below min IAS 33.5 (extrap)',fn: () => getCASfromIAS(d151, 33.5,  'flaps40'), expected: 42.7273 },
    { name: 'PA28-151 flaps40 — above max IAS 113 (extrap)', fn: () => getCASfromIAS(d151, 113,   'flaps40'), expected: 109.0909 },

    // --- PA-28-151 Flaps 40 inverse ---
    { name: 'PA28-151 flaps40 — inv exact CAS 50',          fn: () => getIASfromCAS(d151, 50,    'flaps40'), expected: 43.5    },
    { name: 'PA28-151 flaps40 — inv exact CAS 100',         fn: () => getIASfromCAS(d151, 100,   'flaps40'), expected: 103     },
    { name: 'PA28-151 flaps40 — inv interp CAS 56',         fn: () => getIASfromCAS(d151, 56,    'flaps40'), expected: 51.75   },
    { name: 'PA28-151 flaps40 — inv below min CAS 40 (extrap)', fn: () => getIASfromCAS(d151, 40, 'flaps40'), expected: 29.75  },
    { name: 'PA28-151 flaps40 — inv above max CAS 110 (extrap)', fn: () => getIASfromCAS(d151, 110,'flaps40'), expected: 114  },

    // --- PA-28-161 Flaps UP ---
    { name: 'PA28-161 flapsUp — exact min IAS 50',          fn: () => getCASfromIAS(d161, 50,    'flapsUp'), expected: 58      },
    { name: 'PA28-161 flapsUp — exact max IAS 160',         fn: () => getCASfromIAS(d161, 160,   'flapsUp'), expected: 153     },
    { name: 'PA28-161 flapsUp — interp IAS 55',             fn: () => getCASfromIAS(d161, 55,    'flapsUp'), expected: 61.5    },
    { name: 'PA28-161 flapsUp — interp IAS 150',            fn: () => getCASfromIAS(d161, 150,   'flapsUp'), expected: 144     },
    { name: 'PA28-161 flapsUp — below min IAS 40 (extrap)', fn: () => getCASfromIAS(d161, 40,    'flapsUp'), expected: 51     },
    { name: 'PA28-161 flapsUp — above max IAS 170 (extrap)',fn: () => getCASfromIAS(d161, 170,   'flapsUp'), expected: 162    },

    // --- PA-28-161 Flaps UP inverse ---
    { name: 'PA28-161 flapsUp — inv exact CAS 58',          fn: () => getIASfromCAS(d161, 58,    'flapsUp'), expected: 50      },
    { name: 'PA28-161 flapsUp — inv exact CAS 153',         fn: () => getIASfromCAS(d161, 153,   'flapsUp'), expected: 160     },
    { name: 'PA28-161 flapsUp — inv interp CAS 61.5',       fn: () => getIASfromCAS(d161, 61.5,  'flapsUp'), expected: 55      },
    { name: 'PA28-161 flapsUp — inv below min CAS 48 (extrap)', fn: () => getIASfromCAS(d161, 48, 'flapsUp'), expected: 35.7143 },
    { name: 'PA28-161 flapsUp — inv above max CAS 163 (extrap)', fn: () => getIASfromCAS(d161, 163,'flapsUp'), expected: 171.1111 },

    // --- PA-28-161 Flaps 40 ---
    { name: 'PA28-161 flaps40 — exact min IAS 43',          fn: () => getCASfromIAS(d161, 43,    'flaps40'), expected: 50      },
    { name: 'PA28-161 flaps40 — exact max IAS 104',         fn: () => getCASfromIAS(d161, 104,   'flaps40'), expected: 100     },
    { name: 'PA28-161 flaps40 — interp IAS 51.5',           fn: () => getCASfromIAS(d161, 51.5,  'flaps40'), expected: 56.25   },
    { name: 'PA28-161 flaps40 — interp IAS 92',             fn: () => getCASfromIAS(d161, 92,    'flaps40'), expected: 89.5    },
    { name: 'PA28-161 flaps40 — below min IAS 33 (extrap)', fn: () => getCASfromIAS(d161, 33,    'flaps40'), expected: 42.6471 },
    { name: 'PA28-161 flaps40 — above max IAS 114 (extrap)',fn: () => getCASfromIAS(d161, 114,   'flaps40'), expected: 108.75  },

    // --- PA-28-161 Flaps 40 inverse ---
    { name: 'PA28-161 flaps40 — inv exact CAS 50',          fn: () => getIASfromCAS(d161, 50,    'flaps40'), expected: 43      },
    { name: 'PA28-161 flaps40 — inv exact CAS 100',         fn: () => getIASfromCAS(d161, 100,   'flaps40'), expected: 104     },
    { name: 'PA28-161 flaps40 — inv interp CAS 56.25',      fn: () => getIASfromCAS(d161, 56.25, 'flaps40'), expected: 51.5    },
    { name: 'PA28-161 flaps40 — inv below min CAS 40 (extrap)', fn: () => getIASfromCAS(d161, 40, 'flaps40'), expected: 29.4   },
    { name: 'PA28-161 flaps40 — inv above max CAS 110 (extrap)', fn: () => getIASfromCAS(d161, 110,'flaps40'), expected: 115.4286 },

    // --- PA-28-181 Flaps UP ---
    { name: 'PA28-181 flapsUp — exact min IAS 70',          fn: () => getCASfromIAS(d181, 70,    'flapsUp'), expected: 75      },
    { name: 'PA28-181 flapsUp — exact max IAS 150',         fn: () => getCASfromIAS(d181, 150,   'flapsUp'), expected: 145     },
    { name: 'PA28-181 flapsUp — interp IAS 75',             fn: () => getCASfromIAS(d181, 75,    'flapsUp'), expected: 78.75   },
    { name: 'PA28-181 flapsUp — interp IAS 140',            fn: () => getCASfromIAS(d181, 140,   'flapsUp'), expected: 136     },
    { name: 'PA28-181 flapsUp — below min IAS 60 (extrap)', fn: () => getCASfromIAS(d181, 60,    'flapsUp'), expected: 67.5    },
    { name: 'PA28-181 flapsUp — above max IAS 160 (extrap)',fn: () => getCASfromIAS(d181, 160,   'flapsUp'), expected: 154     },

    // --- PA-28-181 Flaps UP inverse ---
    { name: 'PA28-181 flapsUp — inv exact CAS 75',          fn: () => getIASfromCAS(d181, 75,    'flapsUp'), expected: 70      },
    { name: 'PA28-181 flapsUp — inv exact CAS 145',         fn: () => getIASfromCAS(d181, 145,   'flapsUp'), expected: 150     },
    { name: 'PA28-181 flapsUp — inv interp CAS 78.75',      fn: () => getIASfromCAS(d181, 78.75, 'flapsUp'), expected: 75      },
    { name: 'PA28-181 flapsUp — inv below min CAS 65 (extrap)', fn: () => getIASfromCAS(d181, 65, 'flapsUp'), expected: 56.6667 },
    { name: 'PA28-181 flapsUp — inv above max CAS 155 (extrap)', fn: () => getIASfromCAS(d181, 155,'flapsUp'), expected: 161.1111 },

    // --- PA-28-181 Flaps 40 ---
    { name: 'PA28-181 flaps40 — exact min IAS 60',          fn: () => getCASfromIAS(d181, 60,    'flaps40'), expected: 64      },
    { name: 'PA28-181 flaps40 — exact IAS 105',             fn: () => getCASfromIAS(d181, 105,   'flaps40'), expected: 105     },
    { name: 'PA28-181 flaps40 — interp IAS 75',             fn: () => getCASfromIAS(d181, 75,    'flaps40'), expected: 78      },
    { name: 'PA28-181 flaps40 — interp IAS 97.5',           fn: () => getCASfromIAS(d181, 97.5,  'flaps40'), expected: 98.5    },
    { name: 'PA28-181 flaps40 — below min IAS 50 (extrap)', fn: () => getCASfromIAS(d181, 50,    'flaps40'), expected: 54.6667 },
    { name: 'PA28-181 flaps40 — exact max IAS 115',         fn: () => getCASfromIAS(d181, 115,   'flaps40'), expected: 112     },
    { name: 'PA28-181 flaps40 — above max IAS 125 (extrap)',fn: () => getCASfromIAS(d181, 125,   'flaps40'), expected: 119     },

    // --- PA-28-181 Flaps 40 inverse ---
    { name: 'PA28-181 flaps40 — inv exact CAS 64',          fn: () => getIASfromCAS(d181, 64,    'flaps40'), expected: 60      },
    { name: 'PA28-181 flaps40 — inv exact CAS 105',         fn: () => getIASfromCAS(d181, 105,   'flaps40'), expected: 105     },
    { name: 'PA28-181 flaps40 — inv interp CAS 78',         fn: () => getIASfromCAS(d181, 78,    'flaps40'), expected: 75      },
    { name: 'PA28-181 flaps40 — inv below min CAS 54 (extrap)', fn: () => getIASfromCAS(d181, 54, 'flaps40'), expected: 49.2857 },
    { name: 'PA28-181 flaps40 — inv exact max CAS 112',     fn: () => getIASfromCAS(d181, 112,   'flaps40'), expected: 115     },
    { name: 'PA28-181 flaps40 — inv above max CAS 115 (extrap)', fn: () => getIASfromCAS(d181, 115,'flaps40'), expected: 119.2857 },
];

const TAS_CAS_SCENARIOS = [
    { name: 'TAS 160 kt, PA 8500 ft, OAT -2°C',  tas: 160,   pa: 8500, oat: -2,  expected: 141.09 },
    { name: 'TAS 102.4 kt, PA 4000 ft, OAT 10°C', tas: 102.4, pa: 4000, oat: 10,  expected: 96.04  },
    { name: 'TAS 120 kt, PA 6000 ft, OAT 5°C',   tas: 120,   pa: 6000, oat: 5,   expected: 109.43 },
    { name: 'TAS 80 kt, PA 2000 ft, OAT 15°C',   tas: 80,    pa: 2000, oat: 15,  expected: 77.15  },
    { name: 'TAS 0 kt (edge case)',                tas: 0,     pa: 5000, oat: 5,   expected: 0      },
];

// ── Runner ────────────────────────────────────────────────────────────────────

const TOLERANCE = 0.001;

function check(computed, expected, tolerance = TOLERANCE) {
    if (expected === null) return `${computed.toFixed(4)} [TBD]`;
    const diff = Math.abs(computed - expected);
    const ok = diff <= tolerance;
    return `${computed.toFixed(4)}  exp ${expected}  diff ${diff.toFixed(4)}  ${ok ? '✓' : '✗ FAIL'}`;
}

let passed = 0, failed = 0, tbd = 0;

console.log('\n══════════════════════════════════════════════');
console.log('  IAS ↔ CAS Calibration Table Tests');
console.log('══════════════════════════════════════════════');
for (const s of IAS_CAS_SCENARIOS) {
    const computed = s.fn();
    const line = check(computed, s.expected);
    console.log(`\n  ${s.name}`);
    console.log(`    ${line}`);
    if (s.expected === null)     tbd++;
    else if (line.includes('✓')) passed++;
    else                         failed++;
}

console.log('\n══════════════════════════════════════════════');
console.log('  TAS → CAS Conversion Tests');
console.log('══════════════════════════════════════════════');
for (const s of TAS_CAS_SCENARIOS) {
    const computed = convertTasToCas(s.tas, s.pa, s.oat);
    const line = check(computed, s.expected, 0.01);
    console.log(`\n  ${s.name}`);
    console.log(`    ${line}`);
    if (s.expected === null)     tbd++;
    else if (line.includes('✓')) passed++;
    else                         failed++;
}

console.log('\n══════════════════════════════════════════════');
console.log(`  Results: ${passed} passed  ${failed} failed  ${tbd} TBD`);
console.log('══════════════════════════════════════════════\n');
if (failed > 0) process.exit(1);
