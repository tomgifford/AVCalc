import type { FastifyInstance } from 'fastify';
import { getAircraftData } from '../lib/aircraft-registry.js';
import { getCASfromIAS, getIASfromCAS } from '../lib/airspeedcal-calc.js';

interface AirspeedBody {
    aircraftType: string;
    ias?: number;
    cas?: number;
    flaps?: 'flapsUp' | 'flaps40';
}

export async function airspeedRoutes(fastify: FastifyInstance) {
    fastify.post<{ Body: AirspeedBody }>('/airspeed', async (request, reply) => {
        const { aircraftType, ias, cas, flaps = 'flapsUp' } = request.body;

        const aircraftData = getAircraftData(aircraftType);
        if (!aircraftData) return reply.status(400).send({ error: `Unknown aircraft: ${aircraftType}` });

        if (ias !== undefined) {
            return { cas: getCASfromIAS(aircraftData.airspeedCal, ias, flaps) };
        }
        if (cas !== undefined) {
            return { ias: getIASfromCAS(aircraftData.airspeedCal, cas, flaps) };
        }
        return reply.status(400).send({ error: 'Provide either ias or cas' });
    });
}
