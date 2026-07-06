import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createAvCalcMcpServer } from './mcp/registerTools.js';

const server = createAvCalcMcpServer();
const transport = new StdioServerTransport();
await server.connect(transport);
