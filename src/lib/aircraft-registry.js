import * as pa28161Climb from './pa28-161-data.js';
import * as pa28161Cruise from './pa28-161-cruise-data.js';
import * as pa28181Climb from './pa28-181-data.js';
import * as pa28181Cruise from './pa28-181-cruise-data.js';

const REGISTRY = {
    'pa28-161': { climb: pa28161Climb, cruise: pa28161Cruise },
    'pa28-181': { climb: pa28181Climb, cruise: pa28181Cruise },
};

export function getAircraftData(aircraftType) {
    return REGISTRY[aircraftType] ?? null;
}