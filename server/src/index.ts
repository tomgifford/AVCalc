import Fastify from 'fastify'

const fastify = Fastify({ logger: true })

fastify.get('/health', async () => ({ status: 'ok' }))

// TODO: register REST routes
// import climbRoutes from './routes/climb.js'
// import cruiseRoutes from './routes/cruise.js'
// import engineRoutes from './routes/engine.js'
// import airspeedRoutes from './routes/airspeed.js'
// fastify.register(climbRoutes, { prefix: '/v1' })
// fastify.register(cruiseRoutes, { prefix: '/v1' })
// fastify.register(engineRoutes, { prefix: '/v1' })
// fastify.register(airspeedRoutes, { prefix: '/v1' })

// TODO: register MCP endpoint
// import { registerMcp } from './mcp.js'
// registerMcp(fastify)

const start = async () => {
    try {
        const port = parseInt(process.env.PORT ?? '3000')
        await fastify.listen({ port, host: '0.0.0.0' })
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}

start()