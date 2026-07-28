import * as pa28151Climb from '../data/pa28-151-climb-data.js';
import * as pa28151Cruise from '../data/pa28-151-cruise-data.js';
import * as pa28151Engine from '../data/pa28-151-engine-data.js';
import * as pa28161Climb from '../data/pa28-161-climb-data.js';
import * as pa28161Cruise from '../data/pa28-161-cruise-data.js';
import * as pa28161Engine from '../data/pa28-161-engine-data.js';
import * as pa28161Takeoff50 from '../data/pa28-161-takeoff50-data.js';
import * as pa28161TakeoffRoll from '../data/pa28-161-takeoffroll-data.js';
import * as pa28161Takeoff50Flap25 from '../data/pa28-161-takeoff50-25flap-data.js';
import * as pa28161TakeoffRollFlap25 from '../data/pa28-161-takeoffroll-25flap-data.js';
import * as pa28181Climb from '../data/pa28-181-climb-data.js';
import * as pa28181Cruise from '../data/pa28-181-cruise-data.js';
import * as pa28181Engine from '../data/pa28-181-engine-data.js';
import { airspeedCalData } from '../data/airspeedcal-data.js';
import { aircraftRefData } from '../data/aircraft-ref-data.js';

/*
 * REGISTRY
 * Intent: Maps aircraft IDs to their POH data modules.
 *         takeoff is keyed by flap degrees so the API can select the right chart
 *         with a single flapDeg parameter without duplicating routes or tools.
 *         Each flap entry provides { roll, obstacle } covering both chart types.
 */
const REGISTRY = {
    'pa28-151': { climb: pa28151Climb, cruise: pa28151Cruise, engine: pa28151Engine, airspeedCal: airspeedCalData['pa28-151'], refData: aircraftRefData['pa28-151'] },
    'pa28-161': {
        climb: pa28161Climb, cruise: pa28161Cruise, engine: pa28161Engine,
        airspeedCal: airspeedCalData['pa28-161'], refData: aircraftRefData['pa28-161'],
        takeoff: {
            0:  { obstacle: pa28161Takeoff50,       roll: pa28161TakeoffRoll },
            25: { obstacle: pa28161Takeoff50Flap25, roll: pa28161TakeoffRollFlap25 },
        },
    },
    'pa28-181': { climb: pa28181Climb, cruise: pa28181Cruise, engine: pa28181Engine, airspeedCal: airspeedCalData['pa28-181'], refData: aircraftRefData['pa28-181'] },
};

export const AIRCRAFT_LIST = [
    { id: 'pa28-151', name: 'Piper PA-28-151 Warrior I' },
    { id: 'pa28-161', name: 'Piper PA-28-161 Warrior II' },
    { id: 'pa28-181', name: 'Piper PA-28-181 Archer II' },
];

/*
 * getAircraftData(aircraftType)
 * Intent: Return the full data registry entry for an aircraft type.
 * Params: aircraftType — aircraft ID string, e.g. 'pa28-161'.
 * Returns: registry entry object, or null if unknown.
 */
export function getAircraftData(aircraftType) {
    return REGISTRY[aircraftType] ?? null;
}
