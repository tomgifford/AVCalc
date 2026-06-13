// Run with: node test/climb-scenario-test.js
import { getClimbYRef, getDist, getTime, getFuel } from '../src/lib/climb-calc.js';
import * as pa28161Climb from '../src/lib/pa28-161-climb-data.js';
import * as pa28181Climb from '../src/lib/pa28-181-climb-data.js';

const SCENARIOS = [
    {
        name: 'PA28-161 — 1500 ft / 27°C to 5000 ft / 16°C',
        aircraft: pa28161Climb,
        paStart:   1500, tStart:  27,
        paTarget:  5000, tTarget: 16,
        expected: { time: 9, dist: 12, fuel: 2 },
    },
    {
        name: 'PA28-181 — 1000 ft / 23°C to 5000 ft / 16°C',
        aircraft: pa28181Climb,
        paStart:   1000, tStart:  23,
        paTarget:  5000, tTarget: 16,
        expected: { time: 7, dist: 10.5, fuel: 1.6 },
    },
    {
        name: 'PA28-181 — 0 ft / 23°C to 2000 ft / 21°C',
        aircraft: pa28181Climb,
        paStart:      0, tStart:  23,
        paTarget:  2000, tTarget: 21,
        expected: { time: 4.0, dist: 5.8, fuel: 1.0 },
    },
    {
        name: 'PA28-181 — 0 ft / 23°C to 6000 ft / 21°C',
        aircraft: pa28181Climb,
        paStart:      0, tStart:  23,
        paTarget:  6000, tTarget: 13,
        expected: { time: 12.5, dist: 17.5, fuel: 3.0 },
    },

];

function pct(actual, expected) {
    return ((actual - expected) / expected * 100).toFixed(1) + '%';
}

for (const s of SCENARIOS) {
    const yRefTarget = getClimbYRef(s.aircraft, s.paTarget, s.tTarget);
    const yRefStart  = getClimbYRef(s.aircraft, s.paStart,  s.tStart);

    const timeTarget = getTime(s.aircraft, yRefTarget);
    const timeStart  = getTime(s.aircraft, yRefStart);
    const distTarget = getDist(s.aircraft, yRefTarget);
    const distStart  = getDist(s.aircraft, yRefStart);
    const fuelTarget = getFuel(s.aircraft, yRefTarget);
    const fuelStart  = getFuel(s.aircraft, yRefStart);

    const netTime = timeTarget - timeStart;
    const netDist = distTarget - distStart;
    const netFuel = fuelTarget - fuelStart;

    console.log(`\n=== ${s.name} ===\n`);
    console.log(`  yRef  start=${yRefStart.toFixed(2)}  target=${yRefTarget.toFixed(2)}\n`);

    console.log('  Intermediate (from sea level to each altitude):');
    console.log(`    Time:  start=${timeStart.toFixed(2)} min   target=${timeTarget.toFixed(2)} min`);
    console.log(`    Dist:  start=${distStart.toFixed(2)} nm    target=${distTarget.toFixed(2)} nm`);
    console.log(`    Fuel:  start=${fuelStart.toFixed(2)} gal   target=${fuelTarget.toFixed(2)} gal`);

    console.log('\n  Net climb results vs expected:');
    console.log(`    Time:  ${netTime.toFixed(2)} min   expected ${s.expected.time} min   error ${pct(netTime, s.expected.time)}`);
    console.log(`    Dist:  ${netDist.toFixed(2)} nm    expected ${s.expected.dist} nm    error ${pct(netDist, s.expected.dist)}`);
    console.log(`    Fuel:  ${netFuel.toFixed(2)} gal   expected ${s.expected.fuel} gal   error ${pct(netFuel, s.expected.fuel)}`);
    console.log('');
}
