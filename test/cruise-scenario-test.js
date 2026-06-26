// Run with: node test/cruise-scenario-test.js
import { getCruiseYRef, getCruiseTAS } from '../src/lib/cruise-calc.js';
import * as pa28181Cruise from '../src/lib/pa28-181-cruise-data.js';

// null = TBD: computed value will be printed without comparison
const SCENARIOS = [

    // PA28-181 — one scenario per PA line at standard temperature (15°C - 2°C per 1000 ft)
    { name: 'PA28-181 — PA     0 / Std  15°C', aircraft: pa28181Cruise, pa:     0, oat:  15, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
    { name: 'PA28-181 — PA  1000 / Std  13°C', aircraft: pa28181Cruise, pa:  1000, oat:  13, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
    { name: 'PA28-181 — PA  2000 / Std  11°C', aircraft: pa28181Cruise, pa:  2000, oat:  11, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
    { name: 'PA28-181 — PA  3000 / Std   9°C', aircraft: pa28181Cruise, pa:  3000, oat:   9, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
    { name: 'PA28-181 — PA  4000 / Std   7°C', aircraft: pa28181Cruise, pa:  4000, oat:   7, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
    { name: 'PA28-181 — PA  5000 / Std   5°C', aircraft: pa28181Cruise, pa:  5000, oat:   5, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
    { name: 'PA28-181 — PA  6000 / Std   3°C', aircraft: pa28181Cruise, pa:  6000, oat:   3, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
    { name: 'PA28-181 — PA  8000 / Std  -1°C', aircraft: pa28181Cruise, pa:  8000, oat:  -1, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
    { name: 'PA28-181 — PA 10000 / Std  -5°C', aircraft: pa28181Cruise, pa: 10000, oat:  -5, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
    { name: 'PA28-181 — PA 12000 / Std  -9°C', aircraft: pa28181Cruise, pa: 12000, oat:  -9, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
    { name: 'PA28-181 — PA 14000 / Std -13°C', aircraft: pa28181Cruise, pa: 14000, oat: -13, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },

    // Max curve scenarios: yRef above power-line intersections, TAS should follow max curve downward
    // PA 10000 std (-5°C): yRef ~20, above 75% intersection at yRef=18
    { name: 'PA28-181 — PA 10000 / Std  -5°C / 75% [max curve]', aircraft: pa28181Cruise, pa: 10000, oat:  -5, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
    // PA 12000 std (-9°C): yRef=24, right at 65% intersection; 75% is above its intersection
    { name: 'PA28-181 — PA 12000 / Std  -9°C [max curve]',        aircraft: pa28181Cruise, pa: 12000, oat:  -9, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
    // PA 14000 std (-13°C): yRef=28, all power settings on max curve
    { name: 'PA28-181 — PA 14000 / Std -13°C [all max curve]',    aircraft: pa28181Cruise, pa: 14000, oat: -13, expected: { yRef: null, tas75: null, tas65: null, tas55: null } },
];

function fmtField(label, computed, expected) {
    if (computed === null) return `    ${label}: N/A`;
    const c = computed.toFixed(2);
    if (expected === null) return `    ${label}: ${c} [TBD]`;
    const err = ((computed - expected) / expected * 100).toFixed(1);
    const flag = Math.abs(parseFloat(err)) > 5 ? '✗ LARGE ERROR' : '✓';
    return `    ${label}: ${c}  exp ${expected}  err ${err}%  ${flag}`;
}

for (const s of SCENARIOS) {
    const yRef  = getCruiseYRef(s.aircraft, s.pa, s.oat);
    const tas75 = getCruiseTAS(s.aircraft, s.pa, s.oat, 75, 'yes');
    const tas65 = getCruiseTAS(s.aircraft, s.pa, s.oat, 65, 'yes');
    const tas55 = getCruiseTAS(s.aircraft, s.pa, s.oat, 55, 'yes');

    console.log(`\n=== ${s.name} ===`);
    console.log(fmtField('yRef      ', yRef,  s.expected.yRef));
    console.log(fmtField('TAS 75%   ', tas75, s.expected.tas75));
    console.log(fmtField('TAS 65%   ', tas65, s.expected.tas65));
    console.log(fmtField('TAS 55%   ', tas55, s.expected.tas55));
}
