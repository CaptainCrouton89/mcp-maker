/**
 * Types for the MCP Maker application
 */

/**
 * Boilerplate project generation options
 */
export interface BoilerplateOptions {
  project_name: string;
  description: string;
  /**
   * Absolute path to the directory where the project should be generated
   */
  output_dir: string;
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
  /**
   * Absolute path to the directory where the tool should be generated
   */
  output_dir: string;
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
  /**
   * Absolute path to the directory where the resource should be generated
   */
  output_dir: string;
}

/**
 * Prompt template generation options
 */
export interface PromptTemplateOptions {
  prompt_name: string;
  description: string;
  include_variables?: boolean;
  /**
   * Absolute path to the directory where the prompt should be generated
   */
  output_dir: string;
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
  /**
   * Absolute path to the directory where the project should be generated
   */
  output_dir: string;
}
