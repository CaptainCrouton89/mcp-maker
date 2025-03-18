/**
 * Template functions for MCP server generation
 */

/**
 * Generates a basic package.json template
 */
export function basicPackageJsonTemplate(
  projectName: string,
  description: string
): string {
  return `{
  "name": "${projectName}",
  "version": "0.1.0",
  "description": "${description}",
  "private": true,
  "type": "module",
  "bin": {
    "${projectName}": "./build/index.js"
  },
  "files": [
    "build"
  ],
  "scripts": {
    "build": "tsc && node -e \\"require('fs').chmodSync('build/index.js', '755')\\"",
    "prepare": "npm run build",
    "watch": "tsc --watch",
    "inspector": "npx @modelcontextprotocol/inspector build/index.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.7.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/node": "^20.11.24",
    "typescript": "^5.3.3"
  }
}`;
}

/**
 * Basic tsconfig.json template
 */
export const basicTsconfigTemplate = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./build",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}`;

/**
 * Generates a README template
 */
export function readmeTemplate(
  projectName: string,
  description: string
): string {
  return `# ${projectName}

${description}

## Overview

This is an MCP (Model Context Protocol) server created with MCP Maker.

## Installation

### Prerequisites

- Node.js (v18+)
- npm or pnpm

### Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Build the project:
\`\`\`bash
npm run build
\`\`\`

## Usage with Claude Desktop

1. Configure Claude Desktop to recognize this MCP server:

Edit your Claude Desktop configuration file:
- On macOS: \`~/Library/Application Support/Claude/claude_desktop_config.json\`
- On Windows: \`%APPDATA%/Claude/claude_desktop_config.json\`

Add the following to your configuration:

\`\`\`json
{
  "mcpServers": {
    "${projectName}": {
      "command": "node",
      "args": [
        "/absolute/path/to/${projectName}/build/index.js"
      ]
    }
  }
}
\`\`\`

2. Restart Claude Desktop

3. In Claude Desktop, you can now use the tools provided by this MCP server.

## Development

For development with auto-rebuild:

\`\`\`bash
npm run watch
\`\`\`

For debugging, use the MCP Inspector:

\`\`\`bash
npm run inspector
\`\`\`

## License

MIT
`;
}

/**
 * Generates a main index.ts template
 */
export function mainIndexTemplate(
  projectName: string,
  includeResources: boolean,
  includePrompts: boolean
): string {
  let imports = `#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Import tool implementations
import { setupTools } from "./tools.js";
`;

  if (includeResources) {
    imports += `// Import resource implementations
import { setupResources } from "./resources.js";
`;
  }

  if (includePrompts) {
    imports += `// Import prompt implementations
import { setupPrompts } from "./prompts.js";
`;
  }

  let setupCalls = `
  // Setup tools
  setupTools(server);
`;

  if (includeResources) {
    setupCalls += `
  // Setup resources
  setupResources(server);
`;
  }

  if (includePrompts) {
    setupCalls += `
  // Setup prompts
  setupPrompts(server);
`;
  }

  return `${imports}
// Server setup
async function main() {
  const server = new McpServer({
    name: "${projectName}",
    version: "0.1.0",
  });
${setupCalls}
  // Connect to transport and start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});`;
}

/**
 * Tools implementation template
 */
export const toolsTemplate = `import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Set up all tools for the MCP server
 */
export function setupTools(server: McpServer): void {
  // Tool: example_tool
  server.tool(
    "example_tool",
    "Example tool description",
    {
      input: z.string().describe("Input parameter description"),
      option: z.boolean().optional().describe("Optional parameter description"),
    },
    async ({ input, option }, extra) => {
      try {
        // Add your implementation here
        const result = \`Processed: \${input}\${option ? " with option enabled" : ""}\`;
        
        return {
          content: [
            { type: "text", text: result }
          ]
        };
      } catch (error) {
        return {
          content: [
            { type: "text", text: \`Error: \${error instanceof Error ? error.message : String(error)}\` }
          ]
        };
      }
    }
  );

  // Add more tools here...
}`;

/**
 * Resources implementation template
 */
export const resourceTemplate = `import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Set up all resources for the MCP server
 */
export function setupResources(server: McpServer): void {
  // Resource: example_resource
  server.resource(
    "example_resource",
    new ResourceTemplate("resource://{id}", { list: undefined }),
    async (uri, variables) => {
      try {
        // Parse variables from URI
        const id = variables.id;
        
        // Fetch or generate the resource content
        const content = \`This is resource with ID: \${id}\`;
        
        return {
          contents: [{
            uri: uri.href,
            text: content,
            mimeType: "text/plain"
          }]
        };
      } catch (error) {
        throw new Error(\`Failed to retrieve resource: \${error instanceof Error ? error.message : String(error)}\`);
      }
    }
  );

  // Add more resources here...
}`;

/**
 * Prompts implementation template
 */
export const promptTemplate = `import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Set up all prompts for the MCP server
 */
export function setupPrompts(server: McpServer): void {
  // Prompt: example_prompt
  server.prompt(
    "example_prompt",
    "Example prompt description",
    {
      // Define variables that can be used in the prompt
      variable: z.string().describe("Description of variable"),
    },
    async ({ variable }) => {
      return {
        content: [
          {
            type: "text",
            text: \`This is a template prompt with variable: \${variable}\`
          }
        ]
      };
    }
  );

  // Add more prompts here...
}`;
