// Run with: node test/engine-scenario-test.js  (from server/ directory)
import { getEngineYRef, getEngineRPM, getPowerFromRPM } from '../src/lib/engine-calc.js';
import * as pa28151Engine from '../src/data/pa28-151-engine-data.js';
import * as pa28161Engine from '../src/data/pa28-161-engine-data.js';
import * as pa28181Engine from '../src/data/pa28-181-engine-data.js';

// null = TBD: computed value will be printed without comparison
const SCENARIOS = [

    // PA28-151 — RPM→Power reverse interpolation
    // pa=1000, t=21 → yRef≈4; RPM 2297 → ~60% power (60.1% observed in app)
    // yRef≈4 per chart eye-ball (code computes 3.78 from current TBD data); power result matches
    { name: 'PA28-151 — PA 1000 / 21°C / RPM 2297 → power', aircraft: pa28151Engine, pa: 1000, t: 21, rpm: 2297, expected: { yRef: null, rpm75: null, rpm65: null, rpm55: null, power: 60.0 } },
    { name: 'PA28-151 — PA 7000 /  -7°C / RPM 2379 → power', aircraft: pa28151Engine, pa: 7000, t: -7, rpm: 2379, expected: { yRef: null, rpm75: null, rpm65: null, rpm55: null, power: 60.0 } },

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
    const yRef  = getEngineYRef(s.aircraft, s.pa, s.t);
    const rpm75 = getEngineRPM(s.aircraft, yRef, 75);
    const rpm65 = getEngineRPM(s.aircraft, yRef, 65);
    const rpm55 = getEngineRPM(s.aircraft, yRef, 55);
    const powerResult = s.rpm !== undefined ? getPowerFromRPM(s.aircraft, yRef, s.rpm) : null;

    console.log(`\n=== ${s.name} ===`);
    console.log(fmtField('yRef      ', yRef,  s.expected.yRef));
    console.log(fmtField('RPM 75%   ', rpm75?.outOfRange ? null : rpm75?.rpm, s.expected.rpm75));
    console.log(fmtField('RPM 65%   ', rpm65?.outOfRange ? null : rpm65?.rpm, s.expected.rpm65));
    console.log(fmtField('RPM 55%   ', rpm55?.outOfRange ? null : rpm55?.rpm, s.expected.rpm55));
    if (powerResult !== null) {
        console.log(fmtField('Power %   ', powerResult?.outOfRange ? null : powerResult?.power, s.expected.power));
    }
}

// ── Max curve / boundary bug tests ──────────────────────────────────────────
// Tests use explicit yRef so they don't depend on yRefLookup accuracy.
// Format: { name, aircraft, yRef, power, expected: { rpm, outOfRange } }
const MAX_CURVE_TESTS = [
    // PA-28-151: boundary fix — exact endpoint yRef=16 on 75% line
    { name: 'PA28-151 — yRef=16, 75%: endpoint → in-range',    aircraft: pa28151Engine, yRef: 16,   power: 75, expected: { rpm: 2700, outOfRange: false } },
    // PA-28-151: max curve — yRef=17 is beyond 75% end, falls back to max curve (65% line)
    { name: 'PA28-151 — yRef=17, 75%: beyond end → max curve', aircraft: pa28151Engine, yRef: 17,   power: 75, expected: { rpm: 2700, outOfRange: true  } },
    // PA-28-151: yRef=17 is in-range on 65% line
    { name: 'PA28-151 — yRef=17, 65%: in-range',               aircraft: pa28151Engine, yRef: 17,   power: 65, expected: { rpm: 2525, outOfRange: false } },

    // PA-28-161: boundary fix — exact endpoint yRef=40 on 75% line
    { name: 'PA28-161 — yRef=40, 75%: endpoint → in-range',    aircraft: pa28161Engine, yRef: 40,   power: 75, expected: { rpm: 2665, outOfRange: false } },
    // PA-28-161: max curve — yRef=45 is beyond 75% end
    { name: 'PA28-161 — yRef=45, 75%: beyond end → max curve', aircraft: pa28161Engine, yRef: 45,   power: 75, expected: { rpm: 2700, outOfRange: true  } },

    // PA-28-181: boundary fix — exact endpoint yRef=18 on 75% line
    { name: 'PA28-181 — yRef=18, 75%: endpoint → in-range',    aircraft: pa28181Engine, yRef: 18,   power: 75, expected: { rpm: 2660, outOfRange: false } },
    // PA-28-181: max curve — yRef=20 is beyond 75% end
    { name: 'PA28-181 — yRef=20, 75%: beyond end → max curve', aircraft: pa28181Engine, yRef: 20,   power: 75, expected: { rpm: 2633, outOfRange: true  } },
];

console.log('\n\n── Max Curve / Boundary Tests ──');
let pass = 0, fail = 0;
for (const t of MAX_CURVE_TESTS) {
    const result = getEngineRPM(t.aircraft, t.yRef, t.power);
    const rpmOk = result?.rpm !== null && Math.abs(result.rpm - t.expected.rpm) / t.expected.rpm < 0.01;
    const oorOk = result?.outOfRange === t.expected.outOfRange;
    const ok = rpmOk && oorOk;
    if (ok) pass++; else fail++;
    const rpmStr = result?.rpm?.toFixed(1) ?? 'null';
    const flag = ok ? '✓' : '✗ FAIL';
    console.log(`  ${flag}  ${t.name}`);
    if (!ok) {
        console.log(`       rpm: got ${rpmStr}  exp ${t.expected.rpm}  outOfRange: got ${result?.outOfRange}  exp ${t.expected.outOfRange}`);
    }
}
console.log(`\n  ${pass} passed, ${fail} failed`);

// ── Above-75% extrapolation tests ────────────────────────────────────────────
// Uses getPowerFromRPM with explicit yRef; verifies extrapolation beyond the
// highest in-range power line and the 2700 RPM redline guard.
const EXTRAP_TESTS = [
    // PA-28-151 yRef=0: p0=65%/2320, p1=75%/2440, slope=10/120=0.0833%/RPM
    { name: 'PA28-151 — yRef=0, RPM 2570 → ~85.8%', aircraft: pa28151Engine, yRef: 0,   rpm: 2570, expected: { power: 85.83, outOfRange: false } },
    { name: 'PA28-151 — yRef=0, RPM 2700 → ~96.7%', aircraft: pa28151Engine, yRef: 0,   rpm: 2700, expected: { power: 96.67, outOfRange: false } },
    { name: 'PA28-151 — yRef=0, RPM 2701 → above redline', aircraft: pa28151Engine, yRef: 0, rpm: 2701, expected: { power: null, outOfRange: true  } },
    // PA-28-161 yRef=0: p0=65%/2340, p1=75%/2480, slope=10/140=0.0714%/RPM
    { name: 'PA28-161 — yRef=0, RPM 2600 → ~83.6%', aircraft: pa28161Engine, yRef: 0,   rpm: 2600, expected: { power: 83.57, outOfRange: false } },
    { name: 'PA28-161 — yRef=0, RPM 2700 → ~90.7%', aircraft: pa28161Engine, yRef: 0,   rpm: 2700, expected: { power: 90.71, outOfRange: false } },
    // PA-28-181 yRef=0: p0=70%/2380, p1=75%/2440, slope=5/60=0.0833%/RPM
    { name: 'PA28-181 — yRef=0, RPM 2570 → ~85.8%', aircraft: pa28181Engine, yRef: 0,   rpm: 2570, expected: { power: 85.83, outOfRange: false } },
    { name: 'PA28-181 — yRef=0, RPM 2700 → ~96.7%', aircraft: pa28181Engine, yRef: 0,   rpm: 2700, expected: { power: 96.67, outOfRange: false } },
];

console.log('\n── Above-75% Extrapolation Tests ──');
let ePass = 0, eFail = 0;
for (const t of EXTRAP_TESTS) {
    const result = getPowerFromRPM(t.aircraft, t.yRef, t.rpm);
    const oorOk = result?.outOfRange === t.expected.outOfRange;
    const powerOk = t.expected.power === null
        ? result?.power === null
        : result?.power !== null && Math.abs(result.power - t.expected.power) / t.expected.power < 0.01;
    const ok = oorOk && powerOk;
    if (ok) ePass++; else eFail++;
    const powerStr = result?.power?.toFixed(2) ?? 'null';
    const flag = ok ? '✓' : '✗ FAIL';
    console.log(`  ${flag}  ${t.name}`);
    if (!ok) {
        console.log(`       power: got ${powerStr}  exp ${t.expected.power}  outOfRange: got ${result?.outOfRange}  exp ${t.expected.outOfRange}`);
    }
}
console.log(`\n  ${ePass} passed, ${eFail} failed`);

// ── PA/T-based boundary tests ─────────────────────────────────────────────────
// Validates in-range vs. out-of-range transitions using real PA/T inputs.
// Expected RPM values confirmed by manual app testing.
const BOUNDARY_TESTS = [
    // 65% line max yRef=67; PA 11500 / T=8 gives yRef≈66.8 → barely in range
    { name: 'PA28-161 — PA 11500 / 8°C / 65%: in range',      aircraft: pa28161Engine, pa: 11500, t: 8, power: 65, expected: { rpm: 2639, outOfRange: false } },
    // PA 11500 / T=9 gives yRef≈67.3 → 65% out of range, falls to max curve
    { name: 'PA28-161 — PA 11500 / 9°C / 65%: out of range',  aircraft: pa28161Engine, pa: 11500, t: 9, power: 65, expected: { rpm: 2638, outOfRange: true  } },
    // Same conditions, 55% line max yRef=80 → 55% still in range
    { name: 'PA28-161 — PA 11500 / 9°C / 55%: in range',      aircraft: pa28161Engine, pa: 11500, t: 9, power: 55, expected: { rpm: 2506, outOfRange: false } },
];

console.log('\n── PA/T Boundary Tests ──');
let bPass = 0, bFail = 0;
for (const t of BOUNDARY_TESTS) {
    const yRef = getEngineYRef(t.aircraft, t.pa, t.t);
    const result = getEngineRPM(t.aircraft, yRef, t.power);
    const rpmOk = result?.rpm != null && Math.abs(result.rpm - t.expected.rpm) / t.expected.rpm < 0.01;
    const oorOk = result?.outOfRange === t.expected.outOfRange;
    const ok = rpmOk && oorOk;
    if (ok) bPass++; else bFail++;
    const rpmStr = result?.rpm?.toFixed(1) ?? 'null';
    const flag = ok ? '✓' : '✗ FAIL';
    console.log(`  ${flag}  ${t.name}`);
    if (!ok) {
        console.log(`       rpm: got ${rpmStr}  exp ${t.expected.rpm}  outOfRange: got ${result?.outOfRange}  exp ${t.expected.outOfRange}`);
    }
}
console.log(`\n  ${bPass} passed, ${bFail} failed`);
