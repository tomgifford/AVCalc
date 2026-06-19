import * as pa28161Climb from './pa28-161-climb-data.js';
import * as pa28161Cruise from './pa28-161-cruise-data.js';
import * as pa28161Engine from './pa28-161-engine-data.js';
import * as pa28181Climb from './pa28-181-climb-data.js';
import * as pa28181Cruise from './pa28-181-cruise-data.js';
import * as pa28181Engine from './pa28-181-engine-data.js';

const REGISTRY = {
    'pa28-161': { climb: pa28161Climb, cruise: pa28161Cruise, engine: pa28161Engine },
    'pa28-181': { climb: pa28181Climb, cruise: pa28181Cruise, engine: pa28181Engine },
};

export function getAircraftData(aircraftType) {
    return REGISTRY[aircraftType] ?? null;
}