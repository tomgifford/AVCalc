import type { FastifyInstance } from 'fastify';
import { getAircraftData } from '../lib/aircraft-registry.js';
import {
    getClimbYRef, getDist, getTime, getFuel,
    calculatePressureAltitude, calcStartClimbTemp,
} from '../lib/climb-calc.js';

interface ClimbBody {
    aircraftType: string;
    altitude: number;
    altimeter: number;
    cruiseTemp: number;
    startAlt: number;
    startClimbTemp: number;
}

interface StartClimbTempBody {
    cruiseTemp: number;
    altitude: number;
    startAlt: number;
    altimeter: number;
}

export async function climbRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: ClimbBody }>('/climb', async (request, reply) => {
        const { aircraftType, altitude, altimeter, cruiseTemp, startAlt, startClimbTemp } = request.body;

        const aircraftData = getAircraftData(aircraftType);
        if (!aircraftData) return reply.status(400).send({ error: `Unknown aircraft: ${aircraftType}` });

        const { pa: paTarget } = calculatePressureAltitude(altitude, altimeter);
        const { pa: paStart }  = calculatePressureAltitude(startAlt, altimeter);

        const yRefTarget = getClimbYRef(aircraftData.climb, paTarget, cruiseTemp);
        const yRefStart  = getClimbYRef(aircraftData.climb, paStart,  startClimbTemp);

        const distTarget = getDist(aircraftData.climb, yRefTarget);
        const distStart  = getDist(aircraftData.climb, yRefStart);
        const timeTarget = getTime(aircraftData.climb, yRefTarget);
        const timeStart  = getTime(aircraftData.climb, yRefStart);
        const fuelTarget = getFuel(aircraftData.climb, yRefTarget);
        const fuelStart  = getFuel(aircraftData.climb, yRefStart);

        const aboveMax = yRefTarget > aircraftData.climb.timeLookup.at(-1).yRef;

        const netTime = Math.max(0, timeTarget - timeStart);
        const netFuel = Math.max(0, fuelTarget - fuelStart);

        return {
            paTarget, paStart,
            distTarget, distStart, netDist: Math.max(0, distTarget - distStart),
            timeTarget, timeStart, netTime,
            fuelTarget, fuelStart, netFuel,
            avgClimbRate:  netTime > 0 ? Math.round((altitude - startAlt) / netTime) : null,
            climbFuelFlow: netTime > 0 ? parseFloat(((netFuel / netTime) * 60).toFixed(1)) : null,
            aboveMax,
        };
    });

    fastify.post<{ Body: StartClimbTempBody }>('/start-climb-temp', async (request) => {
        const { cruiseTemp, altitude, startAlt, altimeter } = request.body;
        const result = calcStartClimbTemp(cruiseTemp, altitude, startAlt, altimeter);
        return { startClimbTemp: result !== null ? parseFloat(result) : null };
    });
}
