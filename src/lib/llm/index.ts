import { env } from "@/lib/env";
import type { LLMProvider, LLMRequest, LLMResponse } from "./types";
import { mockProvider } from "./mock";
import { MODELS, getModel } from "./models";

// Routing layer (FR-MODEL-04). The rest of the app uses `llm.complete()` /
// `llm.stream()` and never imports a specific provider.
//
// In mock mode (or for unknown models), the mock provider is used.
// Real providers will be added behind this same interface; turning one on
// requires only flipping `USE_MOCK_LLM=false` and supplying a key — no UI changes.

function selectProvider(model: string): LLMProvider {
  if (env.USE_MOCK_LLM) return mockProvider;
  const descriptor = getModel(model);
  if (!descriptor) return mockProvider;
  // Future: load real providers based on descriptor.provider here.
  // For now everything routes to mock until at least one real key is wired up.
  return mockProvider;
}

export const llm = {
  models: MODELS,
  defaultModel: env.DEFAULT_LLM_MODEL,
  async complete(req: LLMRequest): Promise<LLMResponse> {
    return selectProvider(req.model).complete(req);
  },
  stream(req: LLMRequest): AsyncIterable<string> {
    return selectProvider(req.model).stream(req);
  },
};

export type { LLMRequest, LLMResponse, LLMProvider } from "./types";
export type { ModelDescriptor } from "./types";
