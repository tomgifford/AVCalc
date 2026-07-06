import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

const ssm = new SSMClient({});

async function resolveSecret(directValue: string | undefined, paramNameEnvVar: string): Promise<string | undefined> {
    if (directValue) return directValue;
    const paramName = process.env[paramNameEnvVar];
    if (!paramName) return undefined;
    const { Parameter } = await ssm.send(new GetParameterCommand({ Name: paramName, WithDecryption: true }));
    return Parameter?.Value;
}

export async function loadSecrets() {
    const sessionSecret = await resolveSecret(process.env.SESSION_SECRET, 'SESSION_SECRET_PARAM');
    const mcpApiKey     = await resolveSecret(process.env.MCP_API_KEY, 'MCP_API_KEY_PARAM');
    if (mcpApiKey) process.env.MCP_API_KEY = mcpApiKey;
    return { sessionSecret, mcpApiKey };
}
