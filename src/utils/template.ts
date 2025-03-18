/**
 * Template utilities for MCP Maker
 */
import chalk from "chalk";
import Handlebars from "handlebars";
import path from "path";
import { readFile } from "./file.js";

// Register custom helpers
Handlebars.registerHelper("camelCase", (str) => {
  if (typeof str !== "string") return "";
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "")
    .replace(/-/g, "");
});

Handlebars.registerHelper("pascalCase", (str) => {
  if (typeof str !== "string") return "";
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word) => word.toUpperCase())
    .replace(/\s+/g, "")
    .replace(/-/g, "");
});

Handlebars.registerHelper("snakeCase", (str) => {
  if (typeof str !== "string") return "";
  return str
    .replace(/\s+/g, "_")
    .replace(/-/g, "_")
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toLowerCase();
});

/**
 * Compiles a template with the given context
 */
export const compileTemplate = async (
  templatePath: string,
  context: Record<string, any>
): Promise<string> => {
  try {
    const templateContent = await readFile(templatePath);
    const template = Handlebars.compile(templateContent);
    return template(context);
  } catch (error) {
    console.error(
      chalk.red(`Error compiling template ${templatePath}:`),
      error
    );
    throw error;
  }
};

/**
 * Compiles a template string with the given context
 */
export const compileTemplateString = (
  templateString: string,
  context: Record<string, any>
): string => {
  try {
    const template = Handlebars.compile(templateString);
    return template(context);
  } catch (error) {
    console.error(chalk.red("Error compiling template string:"), error);
    throw error;
  }
};

/**
 * Get the absolute path to a template file
 */
export const getTemplatePath = (relativePath: string): string => {
  // Use path.join to ensure proper path construction for the current platform
  // Using __dirname would be better, but since we're using ES modules,
  // we need to use import.meta.url or path.dirname(fileURLToPath(import.meta.url))
  // For simplicity, we'll use a relative path from the current working directory

  // This should correctly resolve to the templates directory in the project
  return path.join(process.cwd(), "src", "templates", relativePath);
};
