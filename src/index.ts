#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetchLibraryDocumentation } from "./lib/api.js";
import dotenv from "dotenv";

dotenv.config();

let DEFAULT_MINIMUM_TOKENS = 10000;
if (process.env.DEFAULT_MINIMUM_TOKENS) {
  const parsedValue = parseInt(process.env.DEFAULT_MINIMUM_TOKENS, 10);
  if (!isNaN(parsedValue) && parsedValue > 0) {
    DEFAULT_MINIMUM_TOKENS = parsedValue;
  } else {
    console.warn(
      `Warning: Invalid DEFAULT_MINIMUM_TOKENS value provided in environment variable. Using default value of 10000`
    );
  }
}

// Create server instance
const server = new McpServer({
  name: "Better Auth MCP server",
  description: "Retrieves up-to-date documentation and code examples for any library.",
  version: "1.0.6",
  capabilities: {
    resources: {},
    tools: {},
  },
});


server.tool(
  "get-library-docs",
  "Fetches up-to-date documentation for a library.",
  {
    topic: z
      .string()
      .optional()
      .describe("Topic to focus documentation on (e.g., 'hooks', 'routing')."),
    tokens: z
      .preprocess((val) => (typeof val === "string" ? Number(val) : val), z.number())
      .transform((val) => (val < DEFAULT_MINIMUM_TOKENS ? DEFAULT_MINIMUM_TOKENS : val))
      .optional()
      .describe(
        `Maximum number of tokens of documentation to retrieve (default: ${DEFAULT_MINIMUM_TOKENS}). Higher values provide more context but consume more tokens.`
      ),
  },
  async ({ tokens = DEFAULT_MINIMUM_TOKENS, topic = "" }) => {
    let folders = "";
    const documentationText = await fetchLibraryDocumentation({
      tokens,
      topic,
      folders,
    });

    if (!documentationText) {
      return {
        content: [
          {
            type: "text",
            text: "Documentation not found or not finalized for this library.",
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: documentationText,
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Better Auth Docuemtation MCP Server running");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
