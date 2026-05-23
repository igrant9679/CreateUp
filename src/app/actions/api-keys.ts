"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/acl";
import { db } from "@/lib/db";
import { KEY_PROVIDERS, type KeyProvider } from "@/lib/llm/keys";
import { llm } from "@/lib/llm";

// Admin-only: save / clear an LLM provider API key. Stored in the Setting table
// so the in-app value overrides the env var. After save we bust the LLM provider
// cache so the new key takes effect on the next request without a redeploy.

const SETTING_KEY: Record<KeyProvider, string> = {
  anthropic: "api_key:anthropic",
  openai:    "api_key:openai",
  google:    "api_key:google",
  deepseek:  "api_key:deepseek",
  xai:       "api_key:xai",
  moonshot:  "api_key:moonshot",
  minimax:   "api_key:minimax",
};

export async function saveApiKeyAction(formData: FormData) {
  await requireRole("ADMIN");
  const provider = String(formData.get("provider") ?? "") as KeyProvider;
  if (!KEY_PROVIDERS.includes(provider)) return;
  const value = String(formData.get("value") ?? "").trim();
  const key = SETTING_KEY[provider];

  if (!value) {
    await db.setting.deleteMany({ where: { key } });
  } else {
    await db.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  llm.invalidateKeyCache();
  revalidatePath("/admin/api-keys");
  redirect(`/admin/api-keys?ok=${provider}`);
}
