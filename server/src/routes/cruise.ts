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
}

export async function cruiseRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: CruiseBody }>('/cruise', async (request, reply) => {
        const { aircraftType, altitude, altimeter, oat, power, wheelFairings } = request.body;

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

        return {
            tas,
            cas,
            ias,
            fuelFlow: aircraftData.cruise.cruiseFuelGPH[power],
            rpm: engineResult?.rpm ?? null,
            rpmOutOfRange: engineResult?.outOfRange ?? false,
            powerFromMaxRpm,
        };
    });
}
