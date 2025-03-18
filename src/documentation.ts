/**
 * MCP Documentation Utility
 *
 * This module provides utilities for fetching, parsing, and managing documentation
 * for Model Context Protocol (MCP) servers. It helps in extracting structured
 * information from raw documentation text and provides a searchable interface
 * for accessing documentation content.
 */

import { promises as fs } from "fs";
import { join } from "path";

/**
 * Represents a section of documentation with a title, content, and optional subsections
 */
export interface DocSection {
  title: string;
  content: string;
  subsections?: DocSection[];
}

/**
 * Manages MCP documentation storage and retrieval
 */
export class MCPDocs {
  private docsStore: Record<string, DocSection[]>;
  private docsPath: string;

  /**
   * Create a new MCPDocs instance
   * @param docsPath Optional path to store documentation JSON
   */
  constructor(docsPath?: string) {
    this.docsStore = {};
    this.docsPath = docsPath || join(process.cwd(), "mcp_docs.json");
  }

  /**
   * Parse raw documentation text into structured sections
   * @param rawText Raw documentation text
   * @returns Array of parsed DocSection objects
   */
  parseDocumentation(rawText: string): DocSection[] {
    const lines = rawText.split("\n");
    const sections: DocSection[] = [];
    let currentSection: DocSection | null = null;
    let currentSubsection: DocSection | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Handle main section headers (# Title)
      if (line.startsWith("# ")) {
        if (currentSection) {
          sections.push(currentSection);
        }

        currentSection = {
          title: line.substring(2).trim(),
          content: "",
          subsections: [],
        };
        currentSubsection = null;
      }
      // Handle subsection headers (## Title)
      else if (line.startsWith("## ") && currentSection) {
        if (currentSubsection) {
          currentSection.subsections?.push(currentSubsection);
        }

        currentSubsection = {
          title: line.substring(3).trim(),
          content: "",
        };
      }
      // Add content to current section or subsection
      else {
        if (currentSubsection) {
          currentSubsection.content += line + "\n";
        } else if (currentSection) {
          currentSection.content += line + "\n";
        }
      }
    }

    // Add the last section and subsection if they exist
    if (currentSubsection && currentSection) {
      currentSection.subsections?.push(currentSubsection);
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  /**
   * Add documentation to the store
   * @param key Unique identifier for this documentation
   * @param rawText Raw documentation text
   */
  addDocumentation(key: string, rawText: string): void {
    const sections = this.parseDocumentation(rawText);
    this.docsStore[key] = sections;
  }

  /**
   * Save documentation to a JSON file
   * @param path Optional path to save to
   */
  async saveDocs(path?: string): Promise<void> {
    const savePath = path || this.docsPath;
    try {
      await fs.writeFile(savePath, JSON.stringify(this.docsStore, null, 2));
    } catch (error) {
      console.error("Error saving documentation:", error);
      throw error;
    }
  }

  /**
   * Load documentation from a JSON file
   * @param path Optional path to load from
   */
  async loadDocs(path?: string): Promise<void> {
    const loadPath = path || this.docsPath;
    try {
      try {
        const data = await fs.readFile(loadPath, "utf-8");
        this.docsStore = JSON.parse(data);
      } catch (e) {
        // If file doesn't exist, initialize with empty docs
        if ((e as NodeJS.ErrnoException).code === "ENOENT") {
          this.docsStore = {};
          return;
        }
        throw e;
      }
    } catch (error) {
      console.error("Error loading documentation:", error);
      throw error;
    }
  }

  /**
   * Get a documentation section by key and optional section title
   * @param key Documentation identifier
   * @param sectionTitle Optional section title to filter by
   * @returns The matching section(s) or null if not found
   */
  getDocSection(
    key: string,
    sectionTitle?: string
  ): DocSection | DocSection[] | null {
    if (!this.docsStore[key]) {
      return null;
    }

    if (!sectionTitle) {
      return this.docsStore[key];
    }

    // Search for the section title
    for (const section of this.docsStore[key]) {
      if (section.title.toLowerCase() === sectionTitle.toLowerCase()) {
        return section;
      }

      // Check subsections
      if (section.subsections) {
        for (const subsection of section.subsections) {
          if (subsection.title.toLowerCase() === sectionTitle.toLowerCase()) {
            return subsection;
          }
        }
      }
    }

    return null;
  }

  /**
   * Search documentation content for a query string
   * @param query Search query
   * @returns Array of matching sections
   */
  searchDocs(query: string): DocSection[] {
    const results: DocSection[] = [];
    const lowerQuery = query.toLowerCase();

    for (const key in this.docsStore) {
      for (const section of this.docsStore[key]) {
        const matchInTitle = section.title.toLowerCase().includes(lowerQuery);
        const matchInContent = section.content
          .toLowerCase()
          .includes(lowerQuery);

        if (matchInTitle || matchInContent) {
          results.push(section);
        }

        // Check subsections
        if (section.subsections) {
          for (const subsection of section.subsections) {
            const matchInSubTitle = subsection.title
              .toLowerCase()
              .includes(lowerQuery);
            const matchInSubContent = subsection.content
              .toLowerCase()
              .includes(lowerQuery);

            if (matchInSubTitle || matchInSubContent) {
              results.push(subsection);
            }
          }
        }
      }
    }

    return results;
  }
}
