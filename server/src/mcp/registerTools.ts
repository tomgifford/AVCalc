import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getAircraftData, AIRCRAFT_LIST } from '../lib/aircraft-registry.js';
import { getClimbYRef, getDist, getTime, getFuel, calculatePressureAltitude, calcStartClimbTemp, getClimbChartLimits } from '../lib/climb-calc.js';
import { getCruiseTAS } from '../lib/cruise-calc.js';
import { getEngineYRef, getEngineRPM, getPowerFromRPM } from '../lib/engine-calc.js';
import { convertTasToCas } from '../lib/utility-calc.js';
import { getCASfromIAS, getIASfromCAS } from '../lib/airspeedcal-calc.js';

export function createAvCalcMcpServer(): McpServer {
    const server = new McpServer({
        name: 'AVCalc',
        version: '1.0.0',
    });

    server.registerTool(
        'list_aircraft',
        { description: 'List all supported aircraft types' },
        async () => ({
            content: [{ type: 'text', text: JSON.stringify(AIRCRAFT_LIST, null, 2) }],
        })
    );

    server.registerTool(
        'get_aircraft_limits',
        {
            description: 'Get the valid temperature and altitude range for an aircraft climb chart',
            inputSchema: { aircraftType: z.string().describe('Aircraft ID, e.g. pa28-161') },
        },
        async ({ aircraftType }) => {
            const aircraftData = getAircraftData(aircraftType);
            if (!aircraftData) return { content: [{ type: 'text', text: `Unknown aircraft: ${aircraftType}` }], isError: true };
            const limits = getClimbChartLimits(aircraftData.climb);
            return { content: [{ type: 'text', text: JSON.stringify(limits, null, 2) }] };
        }
    );

    server.registerTool(
        'get_aircraft_ref_data',
        {
            description: 'Get reference data (Vy, Vx, and other POH constants) for an aircraft type. Speed values are in KIAS.',
            inputSchema: { aircraftType: z.string().describe('Aircraft ID, e.g. pa28-161') },
        },
        async ({ aircraftType }) => {
            const aircraftData = getAircraftData(aircraftType);
            if (!aircraftData) return { content: [{ type: 'text', text: `Unknown aircraft: ${aircraftType}` }], isError: true };
            return { content: [{ type: 'text', text: JSON.stringify(aircraftData.refData, null, 2) }] };
        }
    );

    server.registerTool(
        'calculate_climb',
        {
            description: 'Calculate climb performance (time, distance, fuel) between two altitudes',
            inputSchema: {
                aircraftType:    z.string().describe('Aircraft ID, e.g. pa28-161'),
                altitude:        z.number().describe('Cruise indicated altitude (ft)'),
                altimeter:       z.number().describe('Altimeter setting (inHg)'),
                cruiseTemp:      z.number().describe('OAT at cruise altitude (°C)'),
                startAlt:        z.number().describe('Start indicated altitude (ft)'),
                startClimbTemp:  z.number().describe('OAT at start altitude (°C)'),
            },
        },
        async ({ aircraftType, altitude, altimeter, cruiseTemp, startAlt, startClimbTemp }) => {
            const aircraftData = getAircraftData(aircraftType);
            if (!aircraftData) return { content: [{ type: 'text', text: `Unknown aircraft: ${aircraftType}` }], isError: true };

            const { pa: paTarget } = calculatePressureAltitude(altitude, altimeter);
            const { pa: paStart }  = calculatePressureAltitude(startAlt, altimeter);

            const yRefTarget = getClimbYRef(aircraftData.climb, paTarget, cruiseTemp);
            const yRefStart  = getClimbYRef(aircraftData.climb, paStart,  startClimbTemp);

            const result = {
                paTarget, paStart,
                netDist:  Math.max(0, getDist(aircraftData.climb, yRefTarget) - getDist(aircraftData.climb, yRefStart)),
                netTime:  Math.max(0, getTime(aircraftData.climb, yRefTarget) - getTime(aircraftData.climb, yRefStart)),
                netFuel:  Math.max(0, getFuel(aircraftData.climb, yRefTarget) - getFuel(aircraftData.climb, yRefStart)),
                aboveMax: yRefTarget > aircraftData.climb.timeLookup.at(-1).yRef,
            };
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.registerTool(
        'calculate_cruise',
        {
            description: 'Calculate cruise performance: TAS, CAS, IAS, fuel flow, and RPM',
            inputSchema: {
                aircraftType:  z.string().describe('Aircraft ID, e.g. pa28-161'),
                altitude:      z.number().describe('Indicated altitude (ft)'),
                altimeter:     z.number().describe('Altimeter setting (inHg)'),
                oat:           z.number().describe('Outside air temperature (°C)'),
                power:         z.union([z.literal(75), z.literal(65), z.literal(55)]).describe('Power setting (%)'),
                wheelFairings: z.enum(['yes', 'no']).describe('Wheel fairings installed'),
            },
        },
        async ({ aircraftType, altitude, altimeter, oat, power, wheelFairings }) => {
            const aircraftData = getAircraftData(aircraftType);
            if (!aircraftData) return { content: [{ type: 'text', text: `Unknown aircraft: ${aircraftType}` }], isError: true };

            const { pa } = calculatePressureAltitude(altitude, altimeter);
            const tas = getCruiseTAS(aircraftData.cruise, pa, oat, power, wheelFairings);
            const cas = tas !== null ? convertTasToCas(tas, pa, oat) : null;
            const ias = cas !== null ? getIASfromCAS(aircraftData.airspeedCal, cas, 'flapsUp') : null;
            const engineYRef = getEngineYRef(aircraftData.engine, pa, oat);
            const engineResult = getEngineRPM(aircraftData.engine, engineYRef, power);
            const powerFromMaxRpm = engineResult?.outOfRange && engineResult.rpm != null
                ? getPowerFromRPM(aircraftData.engine, engineYRef, engineResult.rpm)
                : null;

            const result = {
                tas, cas, ias,
                fuelFlow: aircraftData.cruise.cruiseFuelGPH[power],
                rpm: engineResult?.rpm ?? null,
                rpmOutOfRange: engineResult?.outOfRange ?? false,
                powerFromMaxRpm,
            };
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.registerTool(
        'calculate_engine',
        {
            description: 'Calculate engine RPM at a given power setting and conditions, or the % power for a user-supplied RPM',
            inputSchema: {
                aircraftType: z.string().describe('Aircraft ID, e.g. pa28-161'),
                altitude:     z.number().describe('Indicated altitude (ft)'),
                altimeter:    z.number().describe('Altimeter setting (inHg)'),
                oat:          z.number().describe('Outside air temperature (°C)'),
                power:        z.union([z.literal(75), z.literal(65), z.literal(55)]).describe('Power setting (%)'),
                rpm:          z.number().optional().describe('If provided, also returns the % power corresponding to this RPM'),
            },
        },
        async ({ aircraftType, altitude, altimeter, oat, power, rpm }) => {
            const aircraftData = getAircraftData(aircraftType);
            if (!aircraftData) return { content: [{ type: 'text', text: `Unknown aircraft: ${aircraftType}` }], isError: true };

            const { pa } = calculatePressureAltitude(altitude, altimeter);
            const result = getEngineRPM(aircraftData.engine, pa, oat, power);
            if (!result) return { content: [{ type: 'text', text: 'Could not compute RPM for these conditions' }], isError: true };

            const powerFromRpm = rpm !== undefined ? getPowerFromRPM(aircraftData.engine, pa, oat, rpm) : null;

            return { content: [{ type: 'text', text: JSON.stringify({ ...result, powerFromRpm }, null, 2) }] };
        }
    );

    server.registerTool(
        'calculate_airspeed',
        {
            description: 'Convert between IAS and CAS for a given aircraft and flap setting',
            inputSchema: {
                aircraftType: z.string().describe('Aircraft ID, e.g. pa28-161'),
                ias:          z.number().optional().describe('Indicated airspeed (kts) — provide to get CAS'),
                cas:          z.number().optional().describe('Calibrated airspeed (kts) — provide to get IAS'),
                flaps:        z.enum(['flapsUp', 'flaps40']).optional().describe('Flap setting (default: flapsUp)'),
            },
        },
        async ({ aircraftType, ias, cas, flaps = 'flapsUp' }) => {
            const aircraftData = getAircraftData(aircraftType);
            if (!aircraftData) return { content: [{ type: 'text', text: `Unknown aircraft: ${aircraftType}` }], isError: true };

            if (ias !== undefined) {
                return { content: [{ type: 'text', text: JSON.stringify({ cas: getCASfromIAS(aircraftData.airspeedCal, ias, flaps) }, null, 2) }] };
            }
            if (cas !== undefined) {
                return { content: [{ type: 'text', text: JSON.stringify({ ias: getIASfromCAS(aircraftData.airspeedCal, cas, flaps) }, null, 2) }] };
            }
            return { content: [{ type: 'text', text: 'Provide either ias or cas' }], isError: true };
        }
    );

    return server;
}
