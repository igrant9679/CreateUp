import { env } from "@/lib/env";

// Web search (FR-CHAT-05 quick search; FR-CHAT-06/FR-RES-02 deep AI research uses
// this plus the LLM router). Mock returns plausible canned results.

export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

export interface SearchProvider {
  search(query: string, limit?: number): Promise<SearchResult[]>;
}

const mock: SearchProvider = {
  async search(query, limit = 5) {
    return Array.from({ length: limit }, (_, i) => ({
      title: `Result ${i + 1} for "${query}" (mock)`,
      url: `https://example.com/r/${i + 1}?q=${encodeURIComponent(query)}`,
      snippet: "This is a mock search result. Set USE_MOCK_SEARCH=false and supply SEARCH_API_KEY to get real results.",
    }));
  },
};

export const search: SearchProvider = env.USE_MOCK_SEARCH ? mock : mock;
