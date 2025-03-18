#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tool implementations
import { setupTools } from "./tools.js";

// Server setup
async function main() {
  const server = new McpServer({
    name: "mcp-maker",
    version: "0.1.0",
  });

  // Setup tools
  setupTools(server);

  // Connect to transport and start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
