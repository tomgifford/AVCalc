// Generates ios/AvCalcEngineKit/Sources/AvCalcEngineKit/Data/PA28{151,161,181}Data.swift
// directly from the digitized JS POH data tables in src/lib/, so the Swift literals are
// produced mechanically from the same source values rather than hand-retyped (which is
// exactly the kind of transcription step where a misplaced decimal silently produces
// wrong-but-plausible flight-performance numbers).
//
// Run with: node scripts/generate-swift-data.mjs
// Re-run any time the JS data files under src/lib/ change.

import * as pa28151Climb from '../src/lib/pa28-151-climb-data.js';
import * as pa28151Cruise from '../src/lib/pa28-151-cruise-data.js';
import * as pa28151Engine from '../src/lib/pa28-151-engine-data.js';
import * as pa28161Climb from '../src/lib/pa28-161-climb-data.js';
import * as pa28161Cruise from '../src/lib/pa28-161-cruise-data.js';
import * as pa28161Engine from '../src/lib/pa28-161-engine-data.js';
import * as pa28181Climb from '../src/lib/pa28-181-climb-data.js';
import * as pa28181Cruise from '../src/lib/pa28-181-cruise-data.js';
import * as pa28181Engine from '../src/lib/pa28-181-engine-data.js';
import { airspeedCalData } from '../src/lib/airspeedcal-data.js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../ios/AvCalcEngineKit/Sources/AvCalcEngineKit/Data');

function num(n) {
    if (typeof n !== 'number' || Number.isNaN(n)) throw new Error(`Not a number: ${n}`);
    return Number.isInteger(n) ? `${n}.0` : `${n}`;
}

function renderPaYRefRow(row, indent) {
    const points = row.points.map(p => `YRefPoint(t: ${num(p.t)}, yRef: ${num(p.yRef)})`).join(', ');
    return `${indent}PaYRefRow(pa: ${num(row.pa)}, points: [${points}])`;
}

function renderYRefLookup(rows, indent) {
    const inner = rows.map(r => renderPaYRefRow(r, indent + '    ')).join(',\n');
    return `[\n${inner}\n${indent}]`;
}

function renderYRefValueList(list, field) {
    return `[${list.map(v => `YRefValue(yRef: ${num(v.yRef)}, value: ${num(v[field])})`).join(', ')}]`;
}

function renderPowerKeyedYRefValueDict(dict, field, indent) {
    const entries = Object.entries(dict).map(([power, list]) => `${indent}    ${power}: ${renderYRefValueList(list, field)}`);
    return `[\n${entries.join(',\n')}\n${indent}]`;
}

function renderFuelGPH(dict) {
    const entries = Object.entries(dict).map(([power, v]) => `${power}: ${num(v)}`);
    return `[${entries.join(', ')}]`;
}

function renderIasCasList(list) {
    return `[${list.map(p => `IasCasPoint(ias: ${num(p.ias)}, cas: ${num(p.cas)})`).join(', ')}]`;
}

function renderClimb(mod, indent) {
    return `ClimbData(
${indent}    yRefLookup: ${renderYRefLookup(mod.yRefLookup, indent + '    ')},
${indent}    climbDistLookup: ${renderYRefValueList(mod.climbDistLookup, 'dist')},
${indent}    timeLookup: ${renderYRefValueList(mod.timeLookup, 'time')},
${indent}    fuelLookup: ${renderYRefValueList(mod.fuelLookup, 'fuel')}
${indent})`;
}

function renderCruise(mod, indent) {
    return `CruiseData(
${indent}    cruiseYRefLookup: ${renderYRefLookup(mod.cruiseYRefLookup, indent + '    ')},
${indent}    cruiseTASLookup: ${renderPowerKeyedYRefValueDict(mod.cruiseTASLookup, 'tas', indent + '    ')},
${indent}    cruiseMaxTAS: ${renderYRefValueList(mod.cruiseMaxTAS, 'tas')},
${indent}    cruiseFuelGPH: ${renderFuelGPH(mod.cruiseFuelGPH)},
${indent}    noFairingsTASDeduction: ${num(mod.noFairingsTASDeduction)}
${indent})`;
}

function renderEngine(mod, indent) {
    return `EngineData(
${indent}    yRefLookup: ${renderYRefLookup(mod.yRefLookup, indent + '    ')},
${indent}    rpmLookup: ${renderPowerKeyedYRefValueDict(mod.rpmLookup, 'rpm', indent + '    ')},
${indent}    engineMaxRPM: ${renderYRefValueList(mod.engineMaxRPM, 'rpm')}
${indent})`;
}

function renderAirspeedCal(data, indent) {
    return `AirspeedCalData(
${indent}    flapsUp: ${renderIasCasList(data.flapsUp)},
${indent}    flaps40: ${renderIasCasList(data.flaps40)}
${indent})`;
}

function renderAircraft(name, climb, cruise, engine, airspeedCal) {
    const indent = '        ';
    return `// GENERATED FILE — do not hand-edit.
// Produced by scripts/generate-swift-data.mjs from src/lib/${name.toLowerCase().replace('pa28', 'pa28-')}-{climb,cruise,engine}-data.js
// and src/lib/airspeedcal-data.js. Regenerate with: node scripts/generate-swift-data.mjs

enum ${name}Data {
    static let climb = ${renderClimb(climb, indent)}

    static let cruise = ${renderCruise(cruise, indent)}

    static let engine = ${renderEngine(engine, indent)}

    static let airspeedCal = ${renderAirspeedCal(airspeedCal, indent)}
}
`;
}

const aircraft = [
    ['PA28151', pa28151Climb, pa28151Cruise, pa28151Engine, airspeedCalData['pa28-151']],
    ['PA28161', pa28161Climb, pa28161Cruise, pa28161Engine, airspeedCalData['pa28-161']],
    ['PA28181', pa28181Climb, pa28181Cruise, pa28181Engine, airspeedCalData['pa28-181']],
];

for (const [name, climb, cruise, engine, airspeedCal] of aircraft) {
    const out = renderAircraft(name, climb, cruise, engine, airspeedCal);
    const path = join(OUT_DIR, `${name}Data.swift`);
    writeFileSync(path, out);
    console.log(`Wrote ${path}`);
}
