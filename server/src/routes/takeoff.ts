import type { FastifyInstance } from 'fastify';
import { getAircraftData } from '../lib/aircraft-registry.js';
import { calculateTakeoffPerformance } from '../lib/takeoff-calc.js';
import { calculatePA151TakeoffPerformance } from '../lib/pa28-151-takeoff-calc.js';

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
 *         (default 0) that selects which flap-setting chart to use.
 *         PA-28-151 uses a two-pane model (no weight panel) detected by the presence
 *         of groundRollLookup in the flap data; all other aircraft use the three-pane
 *         model. PA-28-151 responses omit yRef2 and weightLbs (weight is max gross).
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

        if ((flapData as any)?.data?.groundRollLookup) {
            const result = calculatePA151TakeoffPerformance(
                (flapData as any).data, 'obstacle', altitude, altimeter, oat, windKts
            );
            return reply.send(result);
        }

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

        if ((flapData as any)?.data?.groundRollLookup) {
            const result = calculatePA151TakeoffPerformance(
                (flapData as any).data, 'roll', altitude, altimeter, oat, windKts
            );
            return reply.send(result);
        }

        if (!flapData?.roll) return reply.status(400).send({ error: `Takeoff roll data not available for ${aircraftType} with ${flapDeg}° flaps` });
        const result = calculateTakeoffPerformance(
            flapData.roll, altitude, altimeter, oat, weight, windKts
        );
        return reply.send(result);
    });
}
