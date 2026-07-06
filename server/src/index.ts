import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookiePlugin from '@fastify/cookie';
import staticPlugin from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { aircraftRoutes } from './routes/aircraft.js';
import { climbRoutes } from './routes/climb.js';
import { cruiseRoutes } from './routes/cruise.js';
import { engineRoutes } from './routes/engine.js';
import { airspeedRoutes } from './routes/airspeed.js';
import { mcpRoutes } from './routes/mcp.js';
import { loadSecrets } from './lib/config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';

const { sessionSecret } = await loadSecrets();
if (isProd && !sessionSecret) {
    console.error('SESSION_SECRET could not be resolved (env or SSM)');
    process.exit(1);
}

const fastify = Fastify({
    logger: true,
    trustProxy: true,
});

await fastify.register(cookiePlugin, {
    secret: sessionSecret ?? 'dev-secret-change-in-production',
});

// CORS for local dev (Vite dev server is a different origin)
const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map(o => o.trim());

await fastify.register(cors, {
    origin: (origin, cb) => {
        // In production the app is always served same-origin, so the allowlist below (meant for
        // the local Vite dev server) doesn't apply — enforcing it here would reject same-origin
        // requests that the browser tags as CORS mode anyway (e.g. <script crossorigin>).
        if (isProd || !origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error('Not allowed by CORS'), false);
    },
});

// Validate session cookie on all API routes in production
fastify.addHook('onRequest', async (request, reply) => {
    if (!isProd || !request.url.startsWith('/v1/')) return;
    const raw = request.cookies['avcalc_session'];
    if (!raw || !request.unsignCookie(raw).valid) {
        return reply.code(401).send({ error: 'Unauthorized' });
    }
});

// Set session cookie whenever we send an HTML response
fastify.addHook('onSend', async (_request, reply, payload) => {
    const ct = reply.getHeader('content-type') as string | undefined;
    if (ct?.includes('text/html')) {
        reply.setCookie('avcalc_session', 'authenticated', {
            httpOnly: true,
            sameSite: 'strict',
            secure: isProd,
            signed: true,
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
        });
    }
    return payload;
});

fastify.register(aircraftRoutes, { prefix: '/v1' });
fastify.register(climbRoutes,    { prefix: '/v1' });
fastify.register(cruiseRoutes,   { prefix: '/v1' });
fastify.register(engineRoutes,   { prefix: '/v1' });
fastify.register(airspeedRoutes, { prefix: '/v1' });
fastify.register(mcpRoutes,      { prefix: '/mcp' });

fastify.get('/health', async () => ({ status: 'ok' }));

// Serve the React build. wildcard:false lets unmatched paths fall through
// to setNotFoundHandler so SPA client-side routes return index.html.
const staticDir = join(__dirname, '../../app/dist');
await fastify.register(staticPlugin, {
    root: staticDir,
    wildcard: false,
});

fastify.setNotFoundHandler(async (_request, reply) => {
    return reply.sendFile('index.html');
});

const port = parseInt(process.env.PORT ?? '3000');
try {
    await fastify.listen({ port, host: '0.0.0.0' });
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
