#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "dotenv";
import { setupTools } from "./tools.js";

// Load environmental variables
config();

/**
 * Set up the MCP Maker server
 */
async function main() {
  // Create a new MCP Server instance
  const server = new McpServer({
    name: "mcp-maker",
    description: "A tool for creating and managing MCP servers",
    version: "0.1.0",
    icon: "🛠️",
    homepageUrl: "https://github.com/mcpmaker/mcp-maker",
  });

  // Register all tools with the server
  setupTools(server);

  // Connect to transport and start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log("MCP Maker server started successfully");
  console.log("Use Ctrl+C to stop the server");
}

main().catch((error) => {
  console.error("Failed to start MCP Maker server:", error);
  process.exit(1);
});
