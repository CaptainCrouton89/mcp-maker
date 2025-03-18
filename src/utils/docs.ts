/**
 * Documentation utilities for MCP Maker
 */
import chalk from "chalk";
import path from "path";
import { ensureDir, pathExists, readFile, writeFile } from "./file.js";

// Documentation storage directory
const DOCS_DIR = path.resolve(process.cwd(), ".docs");

/**
 * Initialize the documentation storage
 */
export const initDocsStorage = async (): Promise<void> => {
  await ensureDir(DOCS_DIR);
  console.log(chalk.green("Documentation storage initialized"));
};

/**
 * Store documentation text
 */
export const saveDocumentation = async (
  key: string,
  docText: string
): Promise<void> => {
  try {
    const filePath = path.join(DOCS_DIR, `${key}.md`);
    await writeFile(filePath, docText);
    console.log(chalk.green(`Documentation saved: ${key}`));
  } catch (error) {
    console.error(chalk.red(`Error saving documentation ${key}:`), error);
    throw error;
  }
};

/**
 * Get documentation by key
 */
export const getDocumentation = async (key: string): Promise<string | null> => {
  try {
    const filePath = path.join(DOCS_DIR, `${key}.md`);
    if (await pathExists(filePath)) {
      return await readFile(filePath);
    }
    return null;
  } catch (error) {
    console.error(chalk.red(`Error retrieving documentation ${key}:`), error);
    throw error;
  }
};

/**
 * Search documentation content
 * This is a simple implementation that could be improved with a real search engine
 */
export const searchDocumentation = async (
  query: string
): Promise<Array<{ key: string; content: string; relevance: number }>> => {
  try {
    // Get all documentation files
    const fs = await import("fs-extra");
    const files = await fs.readdir(DOCS_DIR);
    const mdFiles = files.filter((file) => file.endsWith(".md"));

    const results = [];

    for (const file of mdFiles) {
      const key = file.replace(".md", "");
      const content = await readFile(path.join(DOCS_DIR, file));

      // Simple relevance scoring based on term frequency
      const queryTerms = query.toLowerCase().split(/\s+/);
      const contentLower = content.toLowerCase();

      let relevance = 0;
      for (const term of queryTerms) {
        const regex = new RegExp(term, "g");
        const matches = contentLower.match(regex);
        if (matches) {
          relevance += matches.length;
        }
      }

      if (relevance > 0) {
        results.push({ key, content, relevance });
      }
    }

    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
  } catch (error) {
    console.error(
      chalk.red(`Error searching documentation for "${query}":`),
      error
    );
    throw error;
  }
};

/**
 * Extract a section from documentation
 */
export const getDocumentationSection = async (
  key: string,
  sectionTitle?: string
): Promise<string | null> => {
  try {
    const content = await getDocumentation(key);

    if (!content) {
      return null;
    }

    if (!sectionTitle) {
      return content;
    }

    // Extract section by title
    const sectionRegex = new RegExp(
      `(?:^|\\n)#+\\s*${sectionTitle}\\s*(?:\\n|$)(.*?)(?:(?:\\n#+\\s*)|$)`,
      "s"
    );
    const match = content.match(sectionRegex);

    if (match && match[1]) {
      return match[1].trim();
    }

    return null;
  } catch (error) {
    console.error(
      chalk.red(
        `Error extracting section "${sectionTitle}" from documentation ${key}:`
      ),
      error
    );
    throw error;
  }
};
