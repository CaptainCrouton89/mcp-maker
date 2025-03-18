/**
 * Generate Document-Enriched MCP Server Template
 */
import chalk from "chalk";
import { z } from "zod";
import { DocEnrichedTemplateOptions } from "../types.js";
import { initDocsStorage, searchDocumentation } from "../utils/docs.js";
import { generateMcpBoilerplate } from "./generate-boilerplate.js";

// Schema for validating input
export const docEnrichedTemplateSchema = z.object({
  project_name: z.string().min(1),
  description: z.string().min(1),
  doc_context: z.string().min(1),
  output_dir: z.string(),
});

/**
 * Generate an MCP server template with context from documentation
 */
export async function generateDocEnrichedTemplate(
  options: DocEnrichedTemplateOptions
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate options
    const validatedOptions = docEnrichedTemplateSchema.parse(options);

    // Initialize docs storage if it doesn't exist yet
    await initDocsStorage();

    // Search for relevant documentation
    console.log(
      chalk.blue(
        `Searching for documentation about: ${validatedOptions.doc_context}`
      )
    );
    const searchResults = await searchDocumentation(
      validatedOptions.doc_context
    );

    if (searchResults.length === 0) {
      return {
        success: false,
        message: `No documentation found for context: ${validatedOptions.doc_context}. Please save documentation first or use a different context.`,
      };
    }

    // Determine if we need prompts or resources based on the documentation context
    const contextLower = validatedOptions.doc_context.toLowerCase();
    const includePrompts = contextLower.includes("prompt");
    const includeResources = contextLower.includes("resource");

    // Generate the boilerplate with the appropriate options
    console.log(
      chalk.blue(
        `Generating MCP server with${includePrompts ? "" : "out"} prompts and ${
          includeResources ? "" : "without"
        } resources`
      )
    );

    const result = await generateMcpBoilerplate({
      project_name: validatedOptions.project_name,
      description: validatedOptions.description,
      output_dir: validatedOptions.output_dir,
      include_prompts: includePrompts,
      include_resources: includeResources,
    });

    if (!result.success) {
      return result;
    }

    console.log(
      chalk.green(
        `Document-enriched MCP server template generated successfully`
      )
    );

    return {
      success: true,
      message: `Document-enriched MCP server template generated successfully. Used ${searchResults.length} documentation entries for context.`,
    };
  } catch (error: any) {
    console.error(
      chalk.red("Error generating document-enriched template:"),
      error
    );
    return {
      success: false,
      message: `Error generating document-enriched template: ${
        error.message || String(error)
      }`,
    };
  }
}
