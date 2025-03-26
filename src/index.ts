import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import { serverConfig } from "./config/server-config.js";
import { startSSEServer } from "./utils/sse.js";
import {
    ListToolsRequestSchema,
    CallToolRequestSchema,
    ErrorCode,
    McpError,
} from "@modelcontextprotocol/sdk/types.js";
import {DockerManager} from "./utils/docker-manager.js";
import {createImage, createImageSchema} from "./tools/container.js";

const server = new Server(
    {
        name: serverConfig.name,
        version: serverConfig.version,
    },
    serverConfig
);

const dockerManager = new DockerManager();

// Tools handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            createImageSchema,
        ],
    };
});


server.setRequestHandler(
    CallToolRequestSchema,
    async (request: {
        params: { name: string; _meta?: any; arguments?: Record<string, any> };
        method: string;
    }) => {
        try {
            const { name, arguments: input = {} } = request.params;

            switch (name) {
                case "create_image": {
                    return await createImage(
                        dockerManager,
                        input as { name: string; image: string; tag?: string; });
                }
                default:
                    throw new McpError(ErrorCode.InvalidRequest, `Unknown tool: ${name}`);
            }
        } catch (error) {
            if (error instanceof McpError) throw error;
            throw new McpError(
                ErrorCode.InternalError,
                `Tool execution failed: ${error}`
            );
        }
    }
);



if (process.env.ENABLE_UNSAFE_SSE_TRANSPORT) {
    startSSEServer(server);
} else {
    const transport = new StdioServerTransport()
    server.connect(transport);
}

["SIGINT", "SIGTERM"].forEach((signal) => {
    process.on(signal, async () => {
        console.log(`Received ${signal}, shutting down...`);
        await server.close();
        process.exit(0);
    });
});