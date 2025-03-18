/**
 * Create Prompt Template Generator
 */
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";
import { PromptTemplateOptions } from "../types.js";
import { ensureDir, pathExists, writeFile } from "../utils/file.js";
import { compileTemplate, getTemplatePath } from "../utils/template.js";

// Schema for validating input
export const promptTemplateSchema = z.object({
  prompt_name: z
    .string()
    .min(1)
    .refine((val) => /^[a-z0-9_-]+$/.test(val), {
      message: "Prompt name must be in snake_case (lowercase with underscores)",
    }),
  description: z.string().min(1),
  include_variables: z.boolean().optional().default(false),
  output_dir: z
    .string()
    .optional()
    .refine((val) => !val || path.isAbsolute(val), {
      message: "output_dir must be an absolute path",
    }),
});

/**
 * Generate a template for a new MCP prompt
 */
export async function createPromptTemplate(
  options: PromptTemplateOptions
): Promise<{ success: boolean; message: string; filePath?: string }> {
  try {
    // Validate options
    const validatedOptions = promptTemplateSchema.parse(options);

    // Determine the base directory
    let baseDir;
    if (validatedOptions.output_dir) {
      // Use provided output directory if available
      baseDir = validatedOptions.output_dir;
    } else {
      // Get the current module's directory and resolve project root
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const projectRoot = path.resolve(__dirname, "../../");
      baseDir = projectRoot;
    }

    // Ensure the prompts directory exists
    const promptsDir = path.join(baseDir, "src", "prompts");
    await ensureDir(promptsDir);

    // Generate the file path for the new prompt
    const promptFilename = `${validatedOptions.prompt_name.replace(
      /-/g,
      "_"
    )}.ts`;
    const promptFilePath = path.join(promptsDir, promptFilename);

    // Check if the file already exists
    const fileExists = await pathExists(promptFilePath);
    if (fileExists) {
      return {
        success: false,
        message: `A prompt with the name "${validatedOptions.prompt_name}" already exists at ${promptFilePath}`,
      };
    }

    // Generate the prompt content using the template
    const promptContent = await compileTemplate(getTemplatePath("prompt.hbs"), {
      ...validatedOptions,
      // Additional template variables
      prompt_camel_case: validatedOptions.prompt_name
        .replace(/-/g, "_")
        .replace(/_([a-z])/g, (_, char) => char.toUpperCase()),
      prompt_pascal_case: validatedOptions.prompt_name
        .replace(/-/g, "_")
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(""),
    });

    // Write the prompt file
    await writeFile(promptFilePath, promptContent);

    console.log(
      chalk.green(
        `Prompt template generated successfully at: ${promptFilePath}`
      )
    );

    return {
      success: true,
      message: `Prompt template generated successfully at: ${promptFilePath}`,
      filePath: promptFilePath,
    };
  } catch (error: any) {
    console.error(chalk.red("Error creating prompt template:"), error);
    return {
      success: false,
      message: `Error creating prompt template: ${
        error.message || String(error)
      }`,
    };
  }
}
