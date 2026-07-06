import type { FastifyInstance } from 'fastify';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createAvCalcMcpServer } from '../mcp/registerTools.js';

const MCP_METHOD_NOT_ALLOWED = {
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed.' },
    id: null,
};

export async function mcpRoutes(fastify: FastifyInstance) {
    fastify.addHook('preHandler', async (request, reply) => {
        const expected = process.env.MCP_API_KEY;
        const auth = request.headers['authorization'];
        if (!expected || auth !== `Bearer ${expected}`) {
            return reply.code(401).send({ error: 'Unauthorized' });
        }
    });

    fastify.post('/', async (request, reply) => {
        const server = createAvCalcMcpServer();
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        reply.hijack();
        try {
            reply.raw.on('close', () => {
                transport.close();
                server.close();
            });
            await server.connect(transport);
            await transport.handleRequest(request.raw, reply.raw, request.body);
        } catch (err) {
            request.log.error(err);
            if (!reply.raw.headersSent) {
                reply.raw.writeHead(500, { 'content-type': 'application/json' })
                    .end(JSON.stringify({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal server error' }, id: null }));
            }
        }
    });

    fastify.get('/', async (_request, reply) => {
        reply.code(405).send(MCP_METHOD_NOT_ALLOWED);
    });

    fastify.delete('/', async (_request, reply) => {
        reply.code(405).send(MCP_METHOD_NOT_ALLOWED);
    });
}
