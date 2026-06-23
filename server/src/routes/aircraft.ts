import type { FastifyInstance } from 'fastify';
import { getAircraftData, AIRCRAFT_LIST } from '../lib/aircraft-registry.js';
import { getClimbChartLimits } from '../lib/climb-calc.js';

export async function aircraftRoutes(fastify: FastifyInstance) {
    fastify.get('/aircraft', async () => AIRCRAFT_LIST);

    fastify.get<{ Params: { id: string } }>('/aircraft/:id/limits', async (request, reply) => {
        const { id } = request.params;
        const aircraftData = getAircraftData(id);
        if (!aircraftData) return reply.status(404).send({ error: `Unknown aircraft: ${id}` });
        return getClimbChartLimits(aircraftData.climb);
    });
}
