import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { promises as fs } from "fs";
import { dirname, join, resolve } from "path";
import { z } from "zod";

// Documentation utilities
import { MCPDocs } from "./documentation.js";

// Templates
import {
  basicPackageJsonTemplate,
  basicTsconfigTemplate,
  mainIndexTemplate,
  promptTemplate,
  readmeTemplate,
  resourceTemplate,
  toolsTemplate,
} from "./templates.js";

interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  description: string;
}

// Initialize MCPDocs instance
const mcpDocs = new MCPDocs();
const DOCS_PATH = "/Users/silasrhyneer/AI/data/docs/mcp.json";

/**
 * Set up all tools for the MCP Maker server
 */
export function setupTools(server: McpServer): void {
  // Tool: generate_mcp_boilerplate
  server.tool(
    "generate_mcp_boilerplate",
    "Creates a new MCP server project with all the necessary boilerplate files",
    {
      project_name: z.string().describe("Name of the MCP project to create"),
      description: z.string().describe("Short description of the MCP"),
      output_dir: z
        .string()
        .optional()
        .describe("Directory where the project should be created"),
      include_resources: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to include resource boilerplate"),
      include_prompts: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to include prompt boilerplate"),
    },
    async (params, extra) => {
      const {
        project_name,
        description,
        output_dir = "./",
        include_resources,
        include_prompts,
      } = params;

      try {
        // Create project directory
        const projectDir = resolve(output_dir, project_name);
        const srcDir = join(projectDir, "src");

        await fs.mkdir(srcDir, { recursive: true });

        // Create package.json
        await fs.writeFile(
          join(projectDir, "package.json"),
          basicPackageJsonTemplate(project_name, description)
        );

        // Create tsconfig.json
        await fs.writeFile(
          join(projectDir, "tsconfig.json"),
          basicTsconfigTemplate
        );

        // Create README.md
        await fs.writeFile(
          join(projectDir, "README.md"),
          readmeTemplate(project_name, description)
        );

        // Create main index.ts file
        await fs.writeFile(
          join(srcDir, "index.ts"),
          mainIndexTemplate(
            project_name,
            Boolean(include_resources),
            Boolean(include_prompts)
          )
        );

        // Create tools.ts file
        await fs.writeFile(join(srcDir, "tools.ts"), toolsTemplate);

        // Create additional files based on options
        if (include_resources) {
          await fs.writeFile(join(srcDir, "resources.ts"), resourceTemplate);
        }

        if (include_prompts) {
          await fs.writeFile(join(srcDir, "prompts.ts"), promptTemplate);
        }

        return {
          content: [
            {
              type: "text",
              text: `MCP project '${project_name}' successfully created at ${projectDir}.\n\nNext steps:\n1. cd ${project_name}\n2. npm install\n3. npm run build`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating MCP project: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  // Tool: create_tool_template
  server.tool(
    "create_tool_template",
    "Generates template code for a new MCP tool with customizable parameters",
    {
      tool_name: z.string().describe("Name of the tool (in snake_case)"),
      description: z.string().describe("Description of what the tool does"),
      parameters: z
        .array(
          z.object({
            name: z.string().describe("Parameter name"),
            type: z
              .enum(["string", "number", "boolean", "array", "object"])
              .describe("Parameter type"),
            required: z.boolean().describe("Whether the parameter is required"),
            description: z.string().describe("Description of the parameter"),
          })
        )
        .describe("List of parameters for the tool"),
    },
    async (params, extra) => {
      const { tool_name, description, parameters } = params;

      try {
        const paramSchemas = parameters
          .map((param: ToolParameter) => {
            let typeSchema = "";

            switch (param.type) {
              case "string":
                typeSchema = "z.string()";
                break;
              case "number":
                typeSchema = "z.number()";
                break;
              case "boolean":
                typeSchema = "z.boolean()";
                break;
              case "array":
                typeSchema = "z.array(z.any())";
                break;
              case "object":
                typeSchema = "z.object({}).passthrough()";
                break;
            }

            const optionalMark = param.required ? "" : ".optional()";
            return `    ${param.name}: ${typeSchema}${optionalMark}.describe("${param.description}")`;
          })
          .join(",\n");

        const paramNames = parameters
          .map((p: ToolParameter) => p.name)
          .join(", ");

        const toolCode = `
// Tool: ${tool_name}
server.tool(
  "${tool_name}",
  "${description}",
  {
${paramSchemas}
  },
  async ({ ${paramNames} }) => {
    try {
      // Add your implementation here
      
      return {
        content: [
          { type: "text", text: "Result of ${tool_name}" }
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
);`;

        return {
          content: [
            {
              type: "text",
              text:
                "Here's the template code for your new tool:\n\n```typescript\n" +
                toolCode +
                "\n```",
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating tool template: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  // Tool: create_resource_template
  server.tool(
    "create_resource_template",
    "Generates template code for a new MCP resource",
    {
      resource_name: z
        .string()
        .describe("Name of the resource (in snake_case)"),
      resource_uri_pattern: z
        .string()
        .describe("URI pattern for the resource (e.g., 'resource://{id}')"),
      description: z
        .string()
        .describe("Description of what the resource provides"),
    },
    async (params, extra) => {
      const { resource_name, resource_uri_pattern, description } = params;

      try {
        const resourceCode = `
// Resource: ${resource_name}
server.resource(
  "${resource_name}",
  new ResourceTemplate("${resource_uri_pattern}", { list: undefined }),
  async (uri, variables) => {
    try {
      // Parse variables from URI
      // const id = variables.id; // Example for resource://{id} pattern
      
      // Fetch or generate the resource content
      
      return {
        contents: [{
          uri: uri.href,
          text: "Resource content here",
          mimeType: "text/plain"
        }]
      };
    } catch (error) {
      throw new Error(\`Failed to retrieve resource: \${error instanceof Error ? error.message : String(error)}\`);
    }
  }
);`;

        return {
          content: [
            {
              type: "text",
              text:
                "Don't forget to import ResourceTemplate at the top of your file:\n\n```typescript\nimport { ResourceTemplate } from \"@modelcontextprotocol/sdk/server/mcp.js\";\n```\n\nHere's the template code for your new resource:\n\n```typescript\n" +
                resourceCode +
                "\n```",
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating resource template: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  // Tool: create_prompt_template
  server.tool(
    "create_prompt_template",
    "Generates template code for a new MCP prompt",
    {
      prompt_name: z.string().describe("Name of the prompt (in snake_case)"),
      description: z.string().describe("Description of what the prompt is for"),
      include_variables: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether to include variables in the prompt"),
    },
    async (params, extra) => {
      const { prompt_name, description, include_variables } = params;

      try {
        let promptCode = `
// Prompt: ${prompt_name}
server.prompt(
  "${prompt_name}",
  "${description}",`;

        if (include_variables) {
          promptCode += `
  {
    // Define variables that can be used in the prompt
    variable1: z.string().describe("Description of variable1"),
    variable2: z.string().optional().describe("Description of optional variable2")
  },`;
        } else {
          promptCode += `
  {}, // No variables defined`;
        }

        promptCode += `
  async (${include_variables ? "{ variable1, variable2 }" : "_variables"}) => {
    return {
      content: [
        {
          type: "text",
          text: \`${
            include_variables
              ? 'You are given the following information:\\n\\n$\\{variable1\\}\\n\\n${variable2 || ""}'
              : "This is a template prompt for ${prompt_name}."
          }\`
        }
      ]
    };
  }
);`;

        return {
          content: [
            {
              type: "text",
              text:
                "Here's the template code for your new prompt:\n\n```typescript\n" +
                promptCode +
                "\n```",
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error generating prompt template: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  // Tool: fetch_mcp_docs
  server.tool(
    "fetch_mcp_docs",
    "Fetches MCP documentation from a URL and stores it for future reference",
    {
      url: z.string().describe("URL to fetch documentation from"),
      key: z.string().describe("Unique identifier for this documentation"),
    },
    async (params, extra) => {
      const { url, key } = params;

      try {
        // Fetch the documentation
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch documentation: ${response.status} ${response.statusText}`
          );
        }

        const documentationText = await response.text();

        // Parse and store the documentation
        mcpDocs.addDocumentation(key, documentationText);

        // Ensure directory exists before saving
        const dirPath = dirname(DOCS_PATH);
        await fs.mkdir(dirPath, { recursive: true });

        // Save to persistent storage
        await mcpDocs.saveDocs(DOCS_PATH);

        return {
          content: [
            {
              type: "text",
              text: `Successfully fetched and stored documentation under key '${key}'.\n\nDocument length: ${documentationText.length} characters.\nSaved to: ${DOCS_PATH}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching documentation: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  // Tool: search_mcp_docs
  server.tool(
    "search_mcp_docs",
    "Search through stored MCP documentation for relevant information",
    {
      query: z.string().describe("Search query to find documentation"),
    },
    async (params, extra) => {
      const { query } = params;

      try {
        // Load the latest documentation
        await mcpDocs.loadDocs(DOCS_PATH);

        // Search the documentation
        const results = mcpDocs.searchDocs(query);

        if (results.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No documentation found matching query '${query}'.`,
              },
            ],
          };
        }

        // Format the results
        const formattedResults = results
          .map((result, index) => {
            return `## Result ${index + 1}: ${
              result.title
            }\n\n${result.content.substring(0, 500)}${
              result.content.length > 500 ? "...\n(truncated)" : ""
            }`;
          })
          .join("\n\n---\n\n");

        return {
          content: [
            {
              type: "text",
              text: `Found ${results.length} results matching '${query}':\n\n${formattedResults}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error searching documentation: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  // Tool: get_mcp_doc_section
  server.tool(
    "get_mcp_doc_section",
    "Get a specific section of MCP documentation by key and section title",
    {
      key: z.string().describe("Key of the documentation to retrieve"),
      section_title: z
        .string()
        .optional()
        .describe("Optional section title to filter by"),
    },
    async (params, extra) => {
      const { key, section_title } = params;

      try {
        // Load the latest documentation
        await mcpDocs.loadDocs(DOCS_PATH);

        // Get the section
        const section = mcpDocs.getDocSection(key, section_title);

        if (!section) {
          return {
            content: [
              {
                type: "text",
                text: `No documentation found for key '${key}'${
                  section_title ? ` and section '${section_title}'` : ""
                }.`,
              },
            ],
          };
        }

        // Format the result
        let formattedResult: string;

        if (Array.isArray(section)) {
          formattedResult = section
            .map((s, index) => {
              return `## ${s.title}\n\n${s.content}`;
            })
            .join("\n\n---\n\n");
        } else {
          formattedResult = `## ${section.title}\n\n${section.content}`;
        }

        return {
          content: [
            {
              type: "text",
              text: formattedResult,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving documentation: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );

  // Tool: generate_doc_enriched_template
  server.tool(
    "generate_doc_enriched_template",
    "Generate an MCP server template with context from the documentation",
    {
      project_name: z.string().describe("Name of the MCP project to create"),
      description: z.string().describe("Short description of the MCP"),
      output_dir: z
        .string()
        .optional()
        .describe("Directory where the project should be created"),
      doc_context: z
        .string()
        .describe(
          "Documentation context to use for generation (e.g., 'resources', 'tools', 'prompts')"
        ),
    },
    async (params, extra) => {
      const {
        project_name,
        description,
        output_dir = "./",
        doc_context,
      } = params;

      try {
        // Load the latest documentation
        await mcpDocs.loadDocs(DOCS_PATH);

        // Get related documentation sections
        const docSections = mcpDocs.searchDocs(doc_context);

        if (docSections.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `No documentation found matching context '${doc_context}'. Please try a different context or fetch documentation first.`,
              },
            ],
          };
        }

        // Create project directory
        const projectDir = resolve(output_dir, project_name);
        const srcDir = join(projectDir, "src");
        const docsDir = join(projectDir, "docs");

        await fs.mkdir(srcDir, { recursive: true });
        await fs.mkdir(docsDir, { recursive: true });

        // Create package.json
        await fs.writeFile(
          join(projectDir, "package.json"),
          basicPackageJsonTemplate(project_name, description)
        );

        // Create tsconfig.json
        await fs.writeFile(
          join(projectDir, "tsconfig.json"),
          basicTsconfigTemplate
        );

        // Determine which features to include based on doc_context
        const includeResources = doc_context.toLowerCase().includes("resource");
        const includePrompts = doc_context.toLowerCase().includes("prompt");

        // Create main index.ts file
        await fs.writeFile(
          join(srcDir, "index.ts"),
          mainIndexTemplate(project_name, includeResources, includePrompts)
        );

        // Create tools.ts file
        await fs.writeFile(join(srcDir, "tools.ts"), toolsTemplate);

        // Create additional files based on doc_context
        if (includeResources) {
          await fs.writeFile(join(srcDir, "resources.ts"), resourceTemplate);
        }

        if (includePrompts) {
          await fs.writeFile(join(srcDir, "prompts.ts"), promptTemplate);
        }

        // Create README with documentation context
        const docContext = docSections
          .map(
            (section) =>
              `## ${section.title}\n\n${section.content.substring(0, 300)}${
                section.content.length > 300 ? "..." : ""
              }\n\n`
          )
          .join("---\n\n");

        const readmeContent = `# ${project_name}

${description}

## Overview

This is an MCP (Model Context Protocol) server created with MCP Maker.

## Documentation Context

The following documentation sections were used as context for this project:

${docContext}

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
`;

        await fs.writeFile(join(projectDir, "README.md"), readmeContent);

        // Save relevant documentation sections to the docs directory
        for (const section of docSections) {
          const fileName = section.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-");
          await fs.writeFile(
            join(docsDir, `${fileName}.md`),
            `# ${section.title}\n\n${section.content}`
          );
        }

        return {
          content: [
            {
              type: "text",
              text: `MCP project '${project_name}' successfully created at ${projectDir} with documentation context.\n\nNext steps:\n1. cd ${project_name}\n2. npm install\n3. npm run build\n\nRelevant documentation has been saved to the docs/ directory.`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error creating MCP project with documentation: ${
                error instanceof Error ? error.message : String(error)
              }`,
            },
          ],
        };
      }
    }
  );
}
