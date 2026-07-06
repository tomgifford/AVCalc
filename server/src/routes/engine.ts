import type { FastifyInstance } from 'fastify';
import { getAircraftData } from '../lib/aircraft-registry.js';
import { calculatePressureAltitude } from '../lib/climb-calc.js';
import { getEngineRPM, getPowerFromRPM } from '../lib/engine-calc.js';

interface EngineBody {
    aircraftType: string;
    altitude: number;
    altimeter: number;
    oat: number;
    power: 75 | 65 | 55;
    rpm?: number;
}

export async function engineRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: EngineBody }>('/engine', async (request, reply) => {
        const { aircraftType, altitude, altimeter, oat, power, rpm } = request.body;

        const aircraftData = getAircraftData(aircraftType);
        if (!aircraftData) return reply.status(400).send({ error: `Unknown aircraft: ${aircraftType}` });

        const { pa } = calculatePressureAltitude(altitude, altimeter);
        const result = getEngineRPM(aircraftData.engine, pa, oat, power);

        if (!result) return reply.status(400).send({ error: 'Could not compute RPM for these conditions' });

        const powerFromRpm = rpm !== undefined ? getPowerFromRPM(aircraftData.engine, pa, oat, rpm) : null;

        return { rpm: result.rpm, outOfRange: result.outOfRange, powerFromRpm };
    });
}
