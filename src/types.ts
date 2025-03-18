/**
 * Types for the MCP Maker application
 */

/**
 * Boilerplate project generation options
 */
export interface BoilerplateOptions {
  project_name: string;
  description: string;
  output_dir?: string;
  include_prompts?: boolean;
  include_resources?: boolean;
}

/**
 * Tool template generation options
 */
export interface ToolTemplateOptions {
  tool_name: string;
  description: string;
  parameters: ToolParameter[];
}

/**
 * Parameter for a tool
 */
export interface ToolParameter {
  name: string;
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  description: string;
}

/**
 * Resource template generation options
 */
export interface ResourceTemplateOptions {
  resource_name: string;
  resource_uri_pattern: string;
  description: string;
}

/**
 * Prompt template generation options
 */
export interface PromptTemplateOptions {
  prompt_name: string;
  description: string;
  include_variables?: boolean;
}

/**
 * Documentation storage options
 */
export interface DocOptions {
  key: string;
  doc_text: string;
}

/**
 * Documentation search options
 */
export interface DocSearchOptions {
  query: string;
}

/**
 * Documentation section retrieval options
 */
export interface DocSectionOptions {
  key: string;
  section_title?: string;
}

/**
 * Document enriched template generation options
 */
export interface DocEnrichedTemplateOptions {
  project_name: string;
  description: string;
  doc_context: string;
  output_dir?: string;
}
