/**
 * Search MCP Documentation Tool
 */
import chalk from "chalk";
import { z } from "zod";
import { DocSearchOptions } from "../types.js";
import { initDocsStorage, searchDocumentation } from "../utils/docs.js";

// Schema for validating input
export const searchDocsSchema = z.object({
  query: z.string().min(1),
});

/**
 * Search MCP documentation for relevant content
 */
export async function searchMcpDocs(
  options: DocSearchOptions
): Promise<{
  success: boolean;
  message: string;
  results?: Array<{ key: string; content: string; relevance: number }>;
}> {
  try {
    // Validate options
    const validatedOptions = searchDocsSchema.parse(options);

    // Initialize docs storage if it doesn't exist yet
    await initDocsStorage();

    // Search the documentation
    const searchResults = await searchDocumentation(validatedOptions.query);

    if (searchResults.length === 0) {
      return {
        success: true,
        message: "No matching documentation found.",
        results: [],
      };
    }

    return {
      success: true,
      message: `Found ${searchResults.length} matching documentation entries.`,
      results: searchResults,
    };
  } catch (error: any) {
    console.error(chalk.red("Error searching documentation:"), error);
    return {
      success: false,
      message: `Error searching documentation: ${
        error.message || String(error)
      }`,
    };
  }
}
