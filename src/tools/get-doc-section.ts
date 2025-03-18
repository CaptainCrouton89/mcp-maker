/**
 * Get MCP Documentation Section Tool
 */
import chalk from "chalk";
import { z } from "zod";
import { DocSectionOptions } from "../types.js";
import { getDocumentationSection, initDocsStorage } from "../utils/docs.js";

// Schema for validating input
export const docSectionSchema = z.object({
  key: z.string().min(1),
  section_title: z.string().optional(),
});

/**
 * Get a specific section of MCP documentation
 */
export async function getMcpDocSection(
  options: DocSectionOptions
): Promise<{ success: boolean; message: string; content?: string }> {
  try {
    // Validate options
    const validatedOptions = docSectionSchema.parse(options);

    // Initialize docs storage if it doesn't exist yet
    await initDocsStorage();

    // Get the documentation section
    const content = await getDocumentationSection(
      validatedOptions.key,
      validatedOptions.section_title
    );

    if (!content) {
      return {
        success: false,
        message: validatedOptions.section_title
          ? `Section "${validatedOptions.section_title}" not found in documentation "${validatedOptions.key}"`
          : `Documentation "${validatedOptions.key}" not found`,
      };
    }

    return {
      success: true,
      message: validatedOptions.section_title
        ? `Retrieved section "${validatedOptions.section_title}" from documentation "${validatedOptions.key}"`
        : `Retrieved documentation "${validatedOptions.key}"`,
      content,
    };
  } catch (error: any) {
    console.error(chalk.red("Error retrieving documentation section:"), error);
    return {
      success: false,
      message: `Error retrieving documentation section: ${
        error.message || String(error)
      }`,
    };
  }
}
