/**
 * Generate MCP Server Boilerplate Tool
 */
import chalk from "chalk";
import path from "path";
import { z } from "zod";
import { BoilerplateOptions } from "../types.js";
import { ensureDir, writeFile } from "../utils/file.js";
import { compileTemplate, getTemplatePath } from "../utils/template.js";

// Schema for validating input
export const boilerplateSchema = z.object({
  project_name: z.string().min(1),
  description: z.string().min(1),
  output_dir: z.string().optional(),
  include_prompts: z.boolean().optional().default(false),
  include_resources: z.boolean().optional().default(false),
});

/**
 * Generate a boilerplate MCP server project
 */
export async function generateMcpBoilerplate(
  options: BoilerplateOptions
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate options
    const validatedOptions = boilerplateSchema.parse(options);

    // Set output directory
    const outputDir =
      validatedOptions.output_dir ||
      path.join(process.cwd(), validatedOptions.project_name);

    console.log(chalk.blue(`Generating MCP server project at: ${outputDir}`));

    // Create project directory
    await ensureDir(outputDir);

    // Create standard directories
    await ensureDir(path.join(outputDir, "src"));
    await ensureDir(path.join(outputDir, "src", "tools"));

    if (validatedOptions.include_resources) {
      await ensureDir(path.join(outputDir, "src", "resources"));
    }

    if (validatedOptions.include_prompts) {
      await ensureDir(path.join(outputDir, "src", "prompts"));
    }

    // Generate package.json
    const packageJsonContent = await compileTemplate(
      getTemplatePath("project/package.json.hbs"),
      validatedOptions
    );
    await writeFile(path.join(outputDir, "package.json"), packageJsonContent);

    // Generate tsconfig.json
    const tsconfigContent = await compileTemplate(
      getTemplatePath("project/tsconfig.json.hbs"),
      validatedOptions
    );
    await writeFile(path.join(outputDir, "tsconfig.json"), tsconfigContent);

    // Generate .gitignore
    const gitignoreContent = await compileTemplate(
      getTemplatePath("project/gitignore.hbs"),
      validatedOptions
    );
    await writeFile(path.join(outputDir, ".gitignore"), gitignoreContent);

    // Generate main index.ts
    const indexContent = await compileTemplate(
      getTemplatePath("project/index.ts.hbs"),
      validatedOptions
    );
    await writeFile(path.join(outputDir, "src", "index.ts"), indexContent);

    // Generate server.ts
    const serverContent = await compileTemplate(
      getTemplatePath("project/server.ts.hbs"),
      validatedOptions
    );
    await writeFile(path.join(outputDir, "src", "server.ts"), serverContent);

    // Generate example tool if tools are included
    const exampleToolContent = await compileTemplate(
      getTemplatePath("project/example-tool.ts.hbs"),
      validatedOptions
    );
    await writeFile(
      path.join(outputDir, "src", "tools", "example-tool.ts"),
      exampleToolContent
    );

    // Generate example resource if resources are included
    if (validatedOptions.include_resources) {
      const exampleResourceContent = await compileTemplate(
        getTemplatePath("project/example-resource.ts.hbs"),
        validatedOptions
      );
      await writeFile(
        path.join(outputDir, "src", "resources", "example-resource.ts"),
        exampleResourceContent
      );
    }

    // Generate example prompt if prompts are included
    if (validatedOptions.include_prompts) {
      const examplePromptContent = await compileTemplate(
        getTemplatePath("project/example-prompt.ts.hbs"),
        validatedOptions
      );
      await writeFile(
        path.join(outputDir, "src", "prompts", "example-prompt.ts"),
        examplePromptContent
      );
    }

    // Generate README.md
    const readmeContent = await compileTemplate(
      getTemplatePath("project/README.md.hbs"),
      validatedOptions
    );
    await writeFile(path.join(outputDir, "README.md"), readmeContent);

    console.log(
      chalk.green(`MCP server project generated successfully at: ${outputDir}`)
    );

    return {
      success: true,
      message: `MCP server project generated successfully at: ${outputDir}`,
    };
  } catch (error: any) {
    console.error(chalk.red("Error generating MCP boilerplate:"), error);
    return {
      success: false,
      message: `Error generating MCP boilerplate: ${
        error.message || String(error)
      }`,
    };
  }
}
