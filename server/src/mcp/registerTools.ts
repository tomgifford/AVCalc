import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getAircraftData, AIRCRAFT_LIST } from '../lib/aircraft-registry.js';
import { getClimbYRef, getDist, getTime, getFuel, calculatePressureAltitude, calcStartClimbTemp, getClimbChartLimits } from '../lib/climb-calc.js';
import { getCruiseTAS } from '../lib/cruise-calc.js';
import { getEngineYRef, getEngineRPM, getPowerFromRPM } from '../lib/engine-calc.js';
import { convertTasToCas, convertCasToTas } from '../lib/utility-calc.js';
import { getCASfromIAS, getIASfromCAS } from '../lib/airspeedcal-calc.js';
import { calculateTakeoffPerformance } from '../lib/takeoff-calc.js';
import { calculateWindTriangle, calculateGreatCircle, interpolateWindsAloft } from '../lib/nav-calc.js';

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

    const takeoffInputSchema = {
        aircraftType: z.string().describe('Aircraft ID, e.g. pa28-161'),
        altitude:     z.number().describe('Field indicated altitude (ft MSL)'),
        altimeter:    z.number().describe('Altimeter setting (inHg)'),
        oat:          z.number().describe('Outside air temperature at field (°C)'),
        weight:       z.number().describe('Gross weight at takeoff (lbs)'),
        windKts:      z.number().describe('Wind component on takeoff heading (positive = headwind, negative = tailwind, 0 = calm)'),
        flapDeg:      z.number().optional().describe('Flap setting in degrees (default 0; supported values depend on aircraft)'),
    };

    server.registerTool(
        'calculate_takeoff_obstacle',
        {
            description: 'Calculate takeoff distance over a 50 ft obstacle (paved level dry runway, full power before brake release). Use flapDeg to select flap configuration (default 0°).',
            inputSchema: takeoffInputSchema,
        },
        async ({ aircraftType, altitude, altimeter, oat, weight, windKts, flapDeg = 0 }) => {
            const aircraftData = getAircraftData(aircraftType);
            if (!aircraftData) return { content: [{ type: 'text', text: `Unknown aircraft: ${aircraftType}` }], isError: true };
            const flapData = aircraftData.takeoff?.[flapDeg];
            if (!flapData?.obstacle) return { content: [{ type: 'text', text: `Takeoff obstacle data not available for ${aircraftType} with ${flapDeg}° flaps` }], isError: true };
            const result = calculateTakeoffPerformance(flapData.obstacle, altitude, altimeter, oat, weight, windKts);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.registerTool(
        'calculate_takeoff_roll',
        {
            description: 'Calculate takeoff ground roll distance (paved level dry runway, full power before brake release). Use flapDeg to select flap configuration (default 0°).',
            inputSchema: takeoffInputSchema,
        },
        async ({ aircraftType, altitude, altimeter, oat, weight, windKts, flapDeg = 0 }) => {
            const aircraftData = getAircraftData(aircraftType);
            if (!aircraftData) return { content: [{ type: 'text', text: `Unknown aircraft: ${aircraftType}` }], isError: true };
            const flapData = aircraftData.takeoff?.[flapDeg];
            if (!flapData?.roll) return { content: [{ type: 'text', text: `Takeoff roll data not available for ${aircraftType} with ${flapDeg}° flaps` }], isError: true };
            const result = calculateTakeoffPerformance(flapData.roll, altitude, altimeter, oat, weight, windKts);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.registerTool(
        'calculate_wind_triangle',
        {
            description: 'Solve the E6B wind triangle: given TAS, wind (direction FROM and speed), and desired true course, return the true heading to fly and the resulting ground speed. All directions in degrees true (0–360), speeds in knots.',
            inputSchema: {
                tas:           z.number().describe('True airspeed (knots)'),
                windDir:       z.number().describe('Wind direction FROM (degrees true, 0–360)'),
                windSpeed:     z.number().describe('Wind speed (knots)'),
                trueCourse:    z.number().describe('Desired true course (degrees true, 0–360)'),
            },
        },
        async ({ tas, windDir, windSpeed, trueCourse }) => {
            const result = calculateWindTriangle(tas, windDir, windSpeed, trueCourse);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.registerTool(
        'calculate_great_circle',
        {
            description: 'Compute the great-circle distance (nautical miles) and initial true course (degrees) between two geographic coordinates using the haversine formula.',
            inputSchema: {
                lat1: z.number().describe('Departure latitude (decimal degrees, + = N)'),
                lon1: z.number().describe('Departure longitude (decimal degrees, + = E)'),
                lat2: z.number().describe('Destination latitude (decimal degrees, + = N)'),
                lon2: z.number().describe('Destination longitude (decimal degrees, + = E)'),
            },
        },
        async ({ lat1, lon1, lat2, lon2 }) => {
            const result = calculateGreatCircle(lat1, lon1, lat2, lon2);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.registerTool(
        'interpolate_winds_aloft',
        {
            description: 'Interpolate wind direction, speed, and temperature between two altitude levels. Uses vector interpolation for direction to correctly handle the 0°/360° boundary (e.g. 350° and 010° interpolate to 000°, not 180°). Temperatures are optional; include both or neither.',
            inputSchema: {
                lowAlt:    z.number().describe('Lower altitude (ft MSL)'),
                lowDir:    z.number().describe('Wind direction FROM at lower altitude (degrees true)'),
                lowSpd:    z.number().describe('Wind speed at lower altitude (knots)'),
                highAlt:   z.number().describe('Upper altitude (ft MSL)'),
                highDir:   z.number().describe('Wind direction FROM at upper altitude (degrees true)'),
                highSpd:   z.number().describe('Wind speed at upper altitude (knots)'),
                targetAlt: z.number().describe('Target altitude to interpolate to (ft MSL)'),
                lowTempC:  z.number().optional().describe('OAT at lower altitude (°C)'),
                highTempC: z.number().optional().describe('OAT at upper altitude (°C)'),
            },
        },
        async ({ lowAlt, lowDir, lowSpd, highAlt, highDir, highSpd, targetAlt, lowTempC, highTempC }) => {
            const result = interpolateWindsAloft(lowAlt, lowDir, lowSpd, highAlt, highDir, highSpd, targetAlt, lowTempC, highTempC);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
    );

    server.registerTool(
        'convert_cas_to_tas',
        {
            description: 'Convert Calibrated Airspeed (CAS) to True Airspeed (TAS) using the standard ICAO compressibility formula. Use this to convert Vy or other IAS/CAS speeds to TAS for wind-triangle ground-speed calculations.',
            inputSchema: {
                casKt:        z.number().describe('Calibrated Airspeed (knots)'),
                pressureAltFt: z.number().describe('Pressure altitude (feet)'),
                oatC:          z.number().describe('Outside air temperature (°C)'),
            },
        },
        async ({ casKt, pressureAltFt, oatC }) => {
            const tasKt = convertCasToTas(casKt, pressureAltFt, oatC);
            return { content: [{ type: 'text', text: JSON.stringify({ tasKt: Math.round(tasKt * 10) / 10 }, null, 2) }] };
        }
    );

    return server;
}
