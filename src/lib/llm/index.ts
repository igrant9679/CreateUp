import { env } from "@/lib/env";
import type { LLMProvider, LLMRequest, LLMResponse } from "./types";
import { mockProvider } from "./mock";
import { createAnthropicProvider } from "./anthropic";
import { MODELS, getModel } from "./models";

// Routing layer (FR-MODEL-04). Application code uses llm.complete() / llm.stream()
// and never imports a concrete provider. Real providers are wrapped so a network /
// auth / quota / timeout failure transparently falls back to the mock — the app keeps
// working even when an upstream LLM is misconfigured.

const providerCache = new Map<string, LLMProvider>();
function getProvider(id: string): LLMProvider {
  if (providerCache.has(id)) return providerCache.get(id)!;
  let provider: LLMProvider;
  switch (id) {
    case "anthropic":
      if (!env.ANTHROPIC_API_KEY) return mockProvider;
      provider = wrapWithFallback(createAnthropicProvider(env.ANTHROPIC_API_KEY), "anthropic");
      break;
    // Other providers go here as we wire them up (openai, google, deepseek, xai, moonshot, minimax).
    default:
      provider = mockProvider;
  }
  providerCache.set(id, provider);
  return provider;
}

/**
 * Wrap a real provider so transient errors (timeouts, 401, 429, network) silently fall back
 * to the mock provider. Also enforces a hard timeout so a hung upstream can't lock up a user.
 */
function wrapWithFallback(real: LLMProvider, providerId: string): LLMProvider {
  const TIMEOUT_MS = 45_000;

  function withTimeout<T>(p: Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error(`${providerId} timed out after ${TIMEOUT_MS}ms`)), TIMEOUT_MS);
      p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
    });
  }

  return {
    id: real.id,
    supports: real.supports,
    async complete(req: LLMRequest): Promise<LLMResponse> {
      try {
        return await withTimeout(real.complete(req));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`[llm] ${providerId}.complete failed → falling back to mock:`, e instanceof Error ? e.message : e);
        return mockProvider.complete(req);
      }
    },
    async *stream(req: LLMRequest) {
      try {
        const iter = real.stream(req)[Symbol.asyncIterator]();
        const first = await withTimeout(iter.next());
        if (first.done) return;
        yield first.value;
        let next = await iter.next();
        while (!next.done) { yield next.value; next = await iter.next(); }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`[llm] ${providerId}.stream failed → falling back to mock:`, e instanceof Error ? e.message : e);
        for await (const chunk of mockProvider.stream(req)) yield chunk;
      }
    },
  };
}

function selectProvider(model: string): LLMProvider {
  if (env.USE_MOCK_LLM) return mockProvider;
  const descriptor = getModel(model);
  if (!descriptor) return mockProvider;
  return getProvider(descriptor.provider);
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
