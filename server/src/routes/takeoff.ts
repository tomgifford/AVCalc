import type { FastifyInstance } from 'fastify';
import { getAircraftData } from '../lib/aircraft-registry.js';
import { calculateTakeoffPerformance } from '../lib/takeoff-calc.js';

interface TakeoffQuery {
    aircraftType: string;
    altitude: number;
    altimeter: number;
    oat: number;
    weight: number;
    windKts: number;
    flapDeg?: number;
}

/*
 * takeoffRoutes(fastify)
 * Intent: Register REST routes for takeoff performance calculations. Two separate
 *         routes serve the two charts: obstacle clearance (50 ft) and ground roll.
 *         Both accept the same query parameters including an optional flapDeg
 *         (default 0) that selects which flap-setting chart to use, so a single
 *         route handles all supported flap configurations without duplication.
 * Params: fastify — Fastify instance.
 * Returns: nothing (registers routes as side effect).
 */
export async function takeoffRoutes(fastify: FastifyInstance) {
    fastify.get<{ Querystring: TakeoffQuery }>('/aircraft/:type/takeoff/obstacle', async (request, reply) => {
        const { aircraftType } = request.query;
        const altitude  = Number(request.query.altitude);
        const altimeter = Number(request.query.altimeter);
        const oat       = Number(request.query.oat);
        const weight    = Number(request.query.weight);
        const windKts   = Number(request.query.windKts);
        const flapDeg   = Number(request.query.flapDeg ?? 0);

        const aircraftData = getAircraftData(aircraftType);
        if (!aircraftData) return reply.status(400).send({ error: `Unknown aircraft: ${aircraftType}` });
        const flapData = aircraftData.takeoff?.[flapDeg];
        if (!flapData?.obstacle) return reply.status(400).send({ error: `Takeoff obstacle data not available for ${aircraftType} with ${flapDeg}° flaps` });

        const result = calculateTakeoffPerformance(
            flapData.obstacle, altitude, altimeter, oat, weight, windKts
        );
        return reply.send(result);
    });

    fastify.get<{ Querystring: TakeoffQuery }>('/aircraft/:type/takeoff/roll', async (request, reply) => {
        const { aircraftType } = request.query;
        const altitude  = Number(request.query.altitude);
        const altimeter = Number(request.query.altimeter);
        const oat       = Number(request.query.oat);
        const weight    = Number(request.query.weight);
        const windKts   = Number(request.query.windKts);
        const flapDeg   = Number(request.query.flapDeg ?? 0);

        const aircraftData = getAircraftData(aircraftType);
        if (!aircraftData) return reply.status(400).send({ error: `Unknown aircraft: ${aircraftType}` });
        const flapData = aircraftData.takeoff?.[flapDeg];
        if (!flapData?.roll) return reply.status(400).send({ error: `Takeoff roll data not available for ${aircraftType} with ${flapDeg}° flaps` });

        const result = calculateTakeoffPerformance(
            flapData.roll, altitude, altimeter, oat, weight, windKts
        );
        return reply.send(result);
    });
}
