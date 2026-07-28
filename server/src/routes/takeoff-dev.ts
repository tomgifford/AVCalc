import type { FastifyInstance } from 'fastify';
import { getAircraftData } from '../lib/aircraft-registry.js';

/*
 * takeoffDevRoutes(fastify)
 * Intent: Register dev-only REST routes that expose raw takeoff lookup table
 *         data so test/calibration pages in app/test/ can fetch it without
 *         importing across workspace boundaries. These routes are never
 *         registered in production (NODE_ENV=production).
 * Params: fastify — Fastify instance.
 * Returns: nothing (registers routes as side effect).
 */
export async function takeoffDevRoutes(fastify: FastifyInstance) {
    fastify.get('/aircraft/:type/takeoff/obstacle/data', async (request, reply) => {
        const { type } = request.params as { type: string };
        const aircraftData = getAircraftData(type);
        if (!aircraftData) return reply.status(400).send({ error: `Unknown aircraft: ${type}` });
        const obstacleData = aircraftData.takeoff?.[0]?.obstacle;
        if (!obstacleData) return reply.status(400).send({ error: `Takeoff obstacle data not available for ${type}` });
        const { yRef1Lookup, weightLookup, headwindLookup, tailwindLookup } = obstacleData;
        return reply.send({ yRef1Lookup, weightLookup, headwindLookup, tailwindLookup });
    });

    fastify.get('/aircraft/:type/takeoff/roll/data', async (request, reply) => {
        const { type } = request.params as { type: string };
        const aircraftData = getAircraftData(type);
        if (!aircraftData) return reply.status(400).send({ error: `Unknown aircraft: ${type}` });
        const rollData = aircraftData.takeoff?.[0]?.roll;
        if (!rollData) return reply.status(400).send({ error: `Takeoff roll data not available for ${type}` });
        const { yRef1Lookup, weightLookup, headwindLookup, tailwindLookup } = rollData;
        return reply.send({ yRef1Lookup, weightLookup, headwindLookup, tailwindLookup });
    });
}
