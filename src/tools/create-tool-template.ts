/**
 * Create Tool Template Generator
 */
import chalk from "chalk";
import path from "path";
import { z } from "zod";
import { ToolTemplateOptions } from "../types.js";
import { ensureDir, pathExists, writeFile } from "../utils/file.js";
import { compileTemplate, getTemplatePath } from "../utils/template.js";

// Schema for validating input
export const toolTemplateSchema = z.object({
  tool_name: z
    .string()
    .min(1)
    .refine((val) => /^[a-z0-9_-]+$/.test(val), {
      message: "Tool name must be in snake_case (lowercase with underscores)",
    }),
  description: z.string().min(1),
  parameters: z.array(
    z.object({
      name: z.string().min(1),
      type: z.enum(["string", "number", "boolean", "array", "object"]),
      required: z.boolean(),
      description: z.string().min(1),
    })
  ),
  output_dir: z
    .string()
    .optional()
    .refine((val) => !val || path.isAbsolute(val), {
      message: "output_dir must be an absolute path",
    }),
});

/**
 * Generate a template for a new MCP tool
 */
export async function createToolTemplate(
  options: ToolTemplateOptions
): Promise<{ success: boolean; message: string; filePath?: string }> {
  try {
    // Validate options
    const validatedOptions = toolTemplateSchema.parse(options);

    // Determine the base directory (use output_dir if provided, otherwise use current directory)
    // process.cwd() returns the absolute path of the current working directory
    const baseDir = validatedOptions.output_dir || process.cwd();

    // Ensure the tools directory exists
    const toolsDir = path.join(baseDir, "src", "tools");
    await ensureDir(toolsDir);

    // Generate the file path for the new tool
    const toolFilename = `${validatedOptions.tool_name.replace(/-/g, "_")}.ts`;
    const toolFilePath = path.join(toolsDir, toolFilename);

    // Check if the file already exists
    const fileExists = await pathExists(toolFilePath);
    if (fileExists) {
      return {
        success: false,
        message: `A tool with the name "${validatedOptions.tool_name}" already exists at ${toolFilePath}`,
      };
    }

    // Generate the tool content using the template
    const toolContent = await compileTemplate(getTemplatePath("tool.hbs"), {
      ...validatedOptions,
      // Additional template variables
      tool_camel_case: validatedOptions.tool_name
        .replace(/-/g, "_")
        .replace(/_([a-z])/g, (_, char) => char.toUpperCase()),
      tool_pascal_case: validatedOptions.tool_name
        .replace(/-/g, "_")
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(""),
    });

    // Write the tool file
    await writeFile(toolFilePath, toolContent);

    console.log(
      chalk.green(`Tool template generated successfully at: ${toolFilePath}`)
    );

    return {
      success: true,
      message: `Tool template generated successfully at: ${toolFilePath}`,
      filePath: toolFilePath,
    };
  } catch (error: any) {
    console.error(chalk.red("Error creating tool template:"), error);
    return {
      success: false,
      message: `Error creating tool template: ${
        error.message || String(error)
      }`,
    };
  }
}
