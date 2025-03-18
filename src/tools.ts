import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { promises as fs } from "fs";
import { join, resolve } from "path";
import { z } from "zod";

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
}
