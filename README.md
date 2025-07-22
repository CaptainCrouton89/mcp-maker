# MCP Maker

A Model Context Protocol server for creating new MCPs.

<a href="https://glama.ai/mcp/servers/@CaptainCrouton89/mcp-maker">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@CaptainCrouton89/mcp-maker/badge" alt="Maker MCP server" />
</a>

## Overview

MCP Maker is a specialized MCP server designed to help you create new Model Context Protocol servers. It provides tools and templates for scaffolding MCP projects with various capabilities including:

- Basic MCP server structure setup
- Tool definition templates
- Resource templates
- Prompt templates
- Configuration guidance for Claude Desktop integration

## Installation

### Prerequisites

- Node.js (v18+)
- npm or pnpm

### Setup

1. Clone this repository:

```bash
git clone https://github.com/yourusername/mcp-maker
cd mcp-maker
```

2. Install dependencies:

```bash
pnpm install
```

3. Build the project:

```bash
pnpm run build
```

## Usage with Claude Desktop

1. Configure Claude Desktop to recognize the MCP Maker server:

Edit your Claude Desktop configuration file:

- On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

Add the following to your configuration:

```json
{
  "mcpServers": {
    "mcp-maker": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-maker/build/index.js"]
    }
  }
}
```

2. Restart Claude Desktop

3. In Claude Desktop, you can now use MCP Maker's tools to help you create new MCP servers.

## Available Tools

### `generate_mcp_boilerplate`

Creates a new MCP server project with all the necessary boilerplate files.

### `create_tool_template`

Generates template code for a new MCP tool with customizable parameters.

### `create_resource_template`

Generates template code for a new MCP resource.

### `create_prompt_template`

Generates template code for a new MCP prompt.

## Development

For development with auto-rebuild:

```bash
pnpm run watch
```

For debugging, use the MCP Inspector:

```bash
pnpm run inspector
```

## License

MIT