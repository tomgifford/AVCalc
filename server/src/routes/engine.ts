import type { FastifyInstance } from 'fastify';
import { getAircraftData } from '../lib/aircraft-registry.js';
import { calculatePressureAltitude } from '../lib/climb-calc.js';
import { getEngineRPM } from '../lib/engine-calc.js';

interface EngineBody {
    aircraftType: string;
    altitude: number;
    altimeter: number;
    oat: number;
    power: 75 | 65 | 55;
}

export async function engineRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: EngineBody }>('/engine', async (request, reply) => {
        const { aircraftType, altitude, altimeter, oat, power } = request.body;

        const aircraftData = getAircraftData(aircraftType);
        if (!aircraftData) return reply.status(400).send({ error: `Unknown aircraft: ${aircraftType}` });

        const { pa } = calculatePressureAltitude(altitude, altimeter);
        const result = getEngineRPM(aircraftData.engine, pa, oat, power);

        if (!result) return reply.status(400).send({ error: 'Could not compute RPM for these conditions' });

        return { rpm: result.outOfRange ? null : result.rpm, outOfRange: result.outOfRange };
    });
}
