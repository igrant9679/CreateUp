// FR-CANV-13 — Live word count and estimated spoken duration.
// 150 spoken words per minute is the YouTube-narrator midpoint.

export const WORDS_PER_MINUTE = 150;
export const MAX_WORDS = 30_000;

export function countWords(text: string | null | undefined): number {
  if (!text) return 0;
  // Treat anything that contains a letter or digit as a word.
  return (text.match(/[\p{L}\p{N}]+/gu) ?? []).length;
}

export function durationSeconds(words: number): number {
  return Math.round((words / WORDS_PER_MINUTE) * 60);
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
