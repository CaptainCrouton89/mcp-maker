/**
 * Create Resource Template Generator
 */
import chalk from "chalk";
import path from "path";
import { z } from "zod";
import { ResourceTemplateOptions } from "../types.js";
import { ensureDir, pathExists, writeFile } from "../utils/file.js";
import { compileTemplate, getTemplatePath } from "../utils/template.js";

// Schema for validating input
export const resourceTemplateSchema = z.object({
  resource_name: z
    .string()
    .min(1)
    .refine((val) => /^[a-z0-9_-]+$/.test(val), {
      message:
        "Resource name must be in snake_case (lowercase with underscores)",
    }),
  resource_uri_pattern: z.string().min(1),
  description: z.string().min(1),
  output_dir: z.string().refine((val) => path.isAbsolute(val), {
    message: "output_dir must be an absolute path",
  }),
});

/**
 * Generate a template for a new MCP resource
 */
export async function createResourceTemplate(
  options: ResourceTemplateOptions
): Promise<{ success: boolean; message: string; filePath?: string }> {
  try {
    // Validate options
    const validatedOptions = resourceTemplateSchema.parse(options);

    // Use the provided output directory (now required and absolute)
    const baseDir = validatedOptions.output_dir;

    // Ensure the resources directory exists
    const resourcesDir = path.join(baseDir, "src", "resources");
    await ensureDir(resourcesDir);

    // Generate the file path for the new resource
    const resourceFilename = `${validatedOptions.resource_name.replace(
      /-/g,
      "_"
    )}.ts`;
    const resourceFilePath = path.join(resourcesDir, resourceFilename);

    // Check if the file already exists
    const fileExists = await pathExists(resourceFilePath);
    if (fileExists) {
      return {
        success: false,
        message: `A resource with the name "${validatedOptions.resource_name}" already exists at ${resourceFilePath}`,
      };
    }

    // Generate the resource content using the template
    const resourceContent = await compileTemplate(
      getTemplatePath("resource.hbs"),
      {
        ...validatedOptions,
        // Additional template variables
        resource_camel_case: validatedOptions.resource_name
          .replace(/-/g, "_")
          .replace(/_([a-z])/g, (_, char) => char.toUpperCase()),
        resource_pascal_case: validatedOptions.resource_name
          .replace(/-/g, "_")
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(""),
      }
    );

    // Write the resource file
    await writeFile(resourceFilePath, resourceContent);

    console.log(
      chalk.green(
        `Resource template generated successfully at: ${resourceFilePath}`
      )
    );

    return {
      success: true,
      message: `Resource template generated successfully at: ${resourceFilePath}`,
      filePath: resourceFilePath,
    };
  } catch (error: any) {
    console.error(chalk.red("Error creating resource template:"), error);
    return {
      success: false,
      message: `Error creating resource template: ${
        error.message || String(error)
      }`,
    };
  }
}
