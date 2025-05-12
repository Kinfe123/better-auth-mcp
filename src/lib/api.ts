import { SearchResponse } from "./types.js";

const CONTEXT7_API_BASE_URL = "https://context7.com/api";
const CONTEXT7_BETTER_AUTH_DOC_URL = "https://context7.com/api/v1/better-auth/better-auth";
const DEFAULT_TYPE = "txt";
const BETTER_AUTH_DOC_URL="https://context7.com/better-auth/better-auth/llms.txt"


/**
 * Fetches documentation context for a specific library
 * @param libraryId The library ID to fetch documentation for
 * @param options Options for the request
 * @returns The documentation text or null if the request fails
 */
export async function fetchLibraryDocumentation(
  options: {
    tokens?: number;
    topic?: string;
    folders?: string;
  } = {}
): Promise<string | null> {
  try {
    const url = new URL(CONTEXT7_BETTER_AUTH_DOC_URL);
    if (options.tokens) url.searchParams.set("tokens", options.tokens.toString());
    if (options.topic) url.searchParams.set("topic", options.topic);
    if (options.folders) url.searchParams.set("folders", options.folders);
    url.searchParams.set("type", DEFAULT_TYPE);
    const response = await fetch(url, {
      headers: {
        "X-Context7-Source": "mcp-server",
      },
    });
    if (!response.ok) {
      console.error(`Failed to fetch documentation: ${response.status}`);
      return null;
    }
    const text = await response.text();
    if (!text || text === "No content available" || text === "No context data available") {
      return null;
    }
    return text;
  } catch (error) {
    console.error("Error fetching library documentation:", error);
    return null;
  }
}

export async function fetchBetterAuthDocumentation(): Promise<string | null> {
  try {
    const response = await fetch(BETTER_AUTH_DOC_URL);
    if (!response.ok) {
      console.error(`Failed to fetch better-auth documentation: ${response.status}`);
      return null;
    }
    const text = await response.text();
    if (!text || text === "No content available" || text === "No context data available") {
      return null;
    }
    return text;
  } catch (error) {
    console.error("Error fetching better-auth documentation:", error);
    return null;
  }
}
