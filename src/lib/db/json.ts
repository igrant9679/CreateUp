// Wrappers so JSON fields stored as strings (SQLite portability) behave like
// typed objects to callers. See DECISIONS.md §2.

export function readJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}
