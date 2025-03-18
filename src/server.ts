/**
 * MCP Maker Server
 * An MCP server for creating new MCP applications
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Import tool implementations
import { createPromptTemplate } from "./tools/create-prompt-template.js";
import { createResourceTemplate } from "./tools/create-resource-template.js";
import { createToolTemplate } from "./tools/create-tool-template.js";
import { generateMcpBoilerplate } from "./tools/generate-boilerplate.js";
import { generateDocEnrichedTemplate } from "./tools/generate-doc-enriched-template.js";
import { getMcpDocSection } from "./tools/get-doc-section.js";
import { saveMcpDocs } from "./tools/save-docs.js";
import { searchMcpDocs } from "./tools/search-docs.js";
import {
  BoilerplateOptions,
  DocEnrichedTemplateOptions,
  DocOptions,
  DocSearchOptions,
  DocSectionOptions,
  PromptTemplateOptions,
  ResourceTemplateOptions,
  ToolTemplateOptions,
} from "./types.js";

// Create an MCP server
const server = new McpServer({
  name: "MCP Maker",
  version: "0.1.0",
});

// Register the generate_mcp_boilerplate tool
server.tool(
  "generate_mcp_boilerplate",
  "Creates a new MCP server project with all the necessary boilerplate files",
  {
    project_name: z.string().min(1),
    description: z.string().min(1),
    output_dir: z.string().optional(),
    include_prompts: z.boolean().optional(),
    include_resources: z.boolean().optional(),
  },
  async (params: BoilerplateOptions) => {
    const result = await generateMcpBoilerplate(params);
    return {
      content: [{ type: "text", text: result.message }],
    };
  }
);

// Register the create_tool_template tool
server.tool(
  "create_tool_template",
  "Generates template code for a new MCP tool with customizable parameters",
  {
    tool_name: z.string().min(1),
    description: z.string().min(1),
    parameters: z.array(
      z.object({
        name: z.string().min(1),
        type: z.enum(["string", "number", "boolean", "array", "object"]),
        required: z.boolean(),
        description: z.string().min(1),
      })
    ),
  },
  async (params: ToolTemplateOptions) => {
    const result = await createToolTemplate(params);
    return {
      content: [{ type: "text", text: result.message }],
    };
  }
);

// Register the create_resource_template tool
server.tool(
  "create_resource_template",
  "Generates template code for a new MCP resource",
  {
    resource_name: z.string().min(1),
    resource_uri_pattern: z.string().min(1),
    description: z.string().min(1),
  },
  async (params: ResourceTemplateOptions) => {
    const result = await createResourceTemplate(params);
    return {
      content: [{ type: "text", text: result.message }],
    };
  }
);

// Register the create_prompt_template tool
server.tool(
  "create_prompt_template",
  "Generates template code for a new MCP prompt",
  {
    prompt_name: z.string().min(1),
    description: z.string().min(1),
    include_variables: z.boolean().optional(),
  },
  async (params: PromptTemplateOptions) => {
    const result = await createPromptTemplate(params);
    return {
      content: [{ type: "text", text: result.message }],
    };
  }
);

// Register the save_mcp_docs tool
server.tool(
  "save_mcp_docs",
  "Saves MCP documentation text directly and stores it for future reference",
  {
    key: z.string().min(1),
    doc_text: z.string().min(1),
  },
  async (params: DocOptions) => {
    const result = await saveMcpDocs(params);
    return {
      content: [{ type: "text", text: result.message }],
    };
  }
);

// Register the search_mcp_docs tool
server.tool(
  "search_mcp_docs",
  "Search through stored MCP documentation for relevant information",
  {
    query: z.string().min(1),
  },
  async (params: DocSearchOptions) => {
    const result = await searchMcpDocs(params);

    if (!result.success || !result.results) {
      return {
        content: [{ type: "text", text: result.message }],
      };
    }

    // Return formatted search results
    let responseText = result.message + "\n\n";

    for (const doc of result.results) {
      responseText += `## ${doc.key}\n${doc.content.substring(0, 500)}${
        doc.content.length > 500 ? "..." : ""
      }\n\n`;
    }

    return {
      content: [{ type: "text", text: responseText }],
    };
  }
);

// Register the get_mcp_doc_section tool
server.tool(
  "get_mcp_doc_section",
  "Get a specific section of MCP documentation by key and section title",
  {
    key: z.string().min(1),
    section_title: z.string().optional(),
  },
  async (params: DocSectionOptions) => {
    const result = await getMcpDocSection(params);

    return {
      content: [
        {
          type: "text",
          text:
            result.success && result.content ? result.content : result.message,
        },
      ],
    };
  }
);

// Register the generate_doc_enriched_template tool
server.tool(
  "generate_doc_enriched_template",
  "Generate an MCP server template with context from the documentation",
  {
    project_name: z.string().min(1),
    description: z.string().min(1),
    doc_context: z.string().min(1),
    output_dir: z.string().optional(),
  },
  async (params: DocEnrichedTemplateOptions) => {
    const result = await generateDocEnrichedTemplate(params);
    return {
      content: [{ type: "text", text: result.message }],
    };
  }
);

export default server;
