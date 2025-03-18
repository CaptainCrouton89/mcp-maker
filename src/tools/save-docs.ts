/**
 * Save MCP Documentation Tool
 */
import chalk from "chalk";
import { z } from "zod";
import { DocOptions } from "../types.js";
import { initDocsStorage, saveDocumentation } from "../utils/docs.js";

// Schema for validating input
export const saveDocsSchema = z.object({
  key: z.string().min(1),
  doc_text: z.string().min(1),
});

/**
 * Save MCP documentation text to storage
 */
export async function saveMcpDocs(
  options: DocOptions
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate options
    const validatedOptions = saveDocsSchema.parse(options);

    // Initialize docs storage if it doesn't exist yet
    await initDocsStorage();

    // Save the documentation
    await saveDocumentation(validatedOptions.key, validatedOptions.doc_text);

    return {
      success: true,
      message: `Documentation saved successfully with key: ${validatedOptions.key}`,
    };
  } catch (error: any) {
    console.error(chalk.red("Error saving documentation:"), error);
    return {
      success: false,
      message: `Error saving documentation: ${error.message || String(error)}`,
    };
  }
}
