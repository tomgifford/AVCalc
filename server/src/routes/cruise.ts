import type { FastifyInstance } from 'fastify';
import { getAircraftData } from '../lib/aircraft-registry.js';
import { calculatePressureAltitude } from '../lib/climb-calc.js';
import { getCruiseTAS } from '../lib/cruise-calc.js';
import { getEngineYRef, getEngineRPM } from '../lib/engine-calc.js';
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
        const cas = convertTasToCas(tas, pa, oat);
        const ias = getIASfromCAS(aircraftData.airspeedCal, cas, 'flapsUp');

        const engineYRef = getEngineYRef(aircraftData.engine, pa, oat);
        const engineResult = getEngineRPM(aircraftData.engine, engineYRef, power);

        return {
            tas,
            cas,
            ias,
            fuelFlow: aircraftData.cruise.cruiseFuelGPH[power],
            rpm: engineResult?.outOfRange ? null : engineResult?.rpm ?? null,
            rpmOutOfRange: engineResult?.outOfRange ?? false,
        };
    });
}
