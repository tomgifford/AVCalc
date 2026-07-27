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
}

/*
 * takeoffRoutes(fastify)
 * Intent: Register REST routes for takeoff performance calculations. Two separate
 *         routes serve the two charts: obstacle clearance (50 ft) and ground roll.
 *         Both accept the same query parameters but return distances from their
 *         respective POH chart data.
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

        const aircraftData = getAircraftData(aircraftType);
        if (!aircraftData) return reply.status(400).send({ error: `Unknown aircraft: ${aircraftType}` });
        if (!aircraftData.takeoff50) return reply.status(400).send({ error: `Takeoff obstacle data not available for ${aircraftType}` });

        const result = calculateTakeoffPerformance(
            aircraftData.takeoff50, altitude, altimeter, oat, weight, windKts
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

        const aircraftData = getAircraftData(aircraftType);
        if (!aircraftData) return reply.status(400).send({ error: `Unknown aircraft: ${aircraftType}` });
        if (!aircraftData.takeoffRoll) return reply.status(400).send({ error: `Takeoff roll data not available for ${aircraftType}` });

        const result = calculateTakeoffPerformance(
            aircraftData.takeoffRoll, altitude, altimeter, oat, weight, windKts
        );
        return reply.send(result);
    });
}
