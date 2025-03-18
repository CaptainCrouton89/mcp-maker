#!/usr/bin/env node
/**
 * MCP Maker
 * An MCP server for creating MCP applications
 */
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import server from "./server.js";

async function main() {
  console.log("Starting MCP Maker server...");

  // Connect to stdio for communication
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Error running MCP Maker:", error);
  process.exit(1);
});
