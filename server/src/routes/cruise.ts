import type { FastifyInstance } from 'fastify';
import { getAircraftData } from '../lib/aircraft-registry.js';
import { calculatePressureAltitude } from '../lib/climb-calc.js';
import { getCruiseTAS } from '../lib/cruise-calc.js';
import { getEngineYRef, getEngineRPM, getPowerFromRPM } from '../lib/engine-calc.js';
import { convertTasToCas } from '../lib/utility-calc.js';
import { getIASfromCAS } from '../lib/airspeedcal-calc.js';

interface CruiseBody {
    aircraftType: string;
    altitude: number;
    altimeter: number;
    oat: number;
    power: 75 | 65 | 55;
    wheelFairings: 'yes' | 'no';
    climbNetFuel?: number;   // gallons; from last /v1/climb response
    climbNetTime?: number;   // minutes; from last /v1/climb response
}

export async function cruiseRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: CruiseBody }>('/cruise', async (request, reply) => {
        const { aircraftType, altitude, altimeter, oat, power, wheelFairings, climbNetFuel, climbNetTime } = request.body;

        const aircraftData = getAircraftData(aircraftType);
        if (!aircraftData) return reply.status(400).send({ error: `Unknown aircraft: ${aircraftType}` });

        const { pa } = calculatePressureAltitude(altitude, altimeter);

        const tas = getCruiseTAS(aircraftData.cruise, pa, oat, power, wheelFairings);
        const cas = tas !== null ? convertTasToCas(tas, pa, oat) : null;
        const ias = cas !== null ? getIASfromCAS(aircraftData.airspeedCal, cas, 'flapsUp') : null;

        const engineYRef = getEngineYRef(aircraftData.engine, pa, oat);
        const engineResult = getEngineRPM(aircraftData.engine, engineYRef, power);
        const powerFromMaxRpm = engineResult?.outOfRange && engineResult.rpm != null
            ? getPowerFromRPM(aircraftData.engine, engineYRef, engineResult.rpm)
            : null;

        const fuelFlow = aircraftData.cruise.cruiseFuelGPH[power];
        const hasClimb = climbNetFuel != null && climbNetTime != null;
        const firstHourFuel = hasClimb && climbNetTime < 60
            ? parseFloat((climbNetFuel + fuelFlow * ((60 - climbNetTime) / 60)).toFixed(2))
            : null;
        const first30Fuel = hasClimb && climbNetTime < 30
            ? parseFloat((climbNetFuel + fuelFlow * ((30 - climbNetTime) / 60)).toFixed(2))
            : null;

        return {
            tas,
            cas,
            ias,
            fuelFlow,
            rpm: engineResult?.rpm ?? null,
            rpmOutOfRange: engineResult?.outOfRange ?? false,
            powerFromMaxRpm,
            firstHourFuel,
            first30Fuel,
        };
    });
}
