# MCP Server Docker

MCP Server that can connect to docker

## Usage with Claude Desktop

```json
{
  "mcpServers": {
    "docker": {
      "command": "npx",
      "args": ["mcp-server-docker"]
    }
  }
}
```

The server will automatically connect to your current docker daemon. Make sure you have docker installed and running
