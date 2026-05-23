import { env } from "@/lib/env";

// YouTube data interface. Used by Intel, onboarding (FR-ONB-04), voice training,
// chat URL analysis, etc. Mock mode returns plausible fake channels/videos.

export type YTChannelSummary = {
  id: string;            // YouTube channel id
  handle?: string;
  name: string;
  description?: string;
  subscribers: number;
  videoCount: number;
  totalViews: number;
  thumbnailUrl?: string;
  language?: string;
  category?: string;
};

export type YTVideoSummary = {
  id: string;            // YouTube video id
  channelId: string;
  title: string;
  description?: string;
  publishedAt: string;
  durationSeconds: number;
  views: number;
  likes?: number;
  thumbnailUrl?: string;
  format: "short" | "long";
};

export interface YouTubeProvider {
  findChannel(query: string): Promise<YTChannelSummary | null>;
  listVideos(channelId: string, limit?: number): Promise<YTVideoSummary[]>;
  getTranscript(videoId: string): Promise<string | null>;
  searchChannels(query: string, limit?: number): Promise<YTChannelSummary[]>;
}

// ── Mock implementation ────────────────────────────────────────────────────

function seeded(label: string, salt = 0): number {
  let s = salt;
  for (const ch of label) s = (s * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(s);
}

const MOCK_TITLES = [
  "How I changed my mind about X",
  "The truth about productivity",
  "I tried this for 30 days",
  "Why this billion-dollar idea failed",
  "What nobody tells you about Y",
  "Stop doing this. Do this instead.",
  "The hidden pattern behind every great video",
  "I read 100 papers so you don't have to",
  "This single graph changed everything",
  "Inside the world's strangest niche",
];

const mock: YouTubeProvider = {
  async findChannel(query) {
    const handle = query.startsWith("@") ? query : "@" + query.replace(/[^\w]/g, "");
    const s = seeded(handle);
    return {
      id: "UC" + (s.toString(36) + "abcdefghij").slice(0, 22),
      handle,
      name: handle.replace(/^@/, "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Sample Channel",
      description: "A demo channel about a fascinating niche. (mock)",
      subscribers: 10_000 + (s % 990_000),
      videoCount: 50 + (s % 450),
      totalViews: 1_000_000 + (s % 50_000_000),
      thumbnailUrl: undefined,
      language: "en",
      category: "Education",
    };
  },
  async listVideos(channelId, limit = 10) {
    const s = seeded(channelId);
    const avgViews = 5_000 + (s % 200_000);
    return Array.from({ length: limit }, (_, i) => {
      const ss = seeded(channelId + ":" + i);
      const multiplier = 0.3 + ((ss % 100) / 20); // 0.3x–5.3x
      return {
        id: ("v" + ss.toString(36)).slice(0, 11),
        channelId,
        title: MOCK_TITLES[ss % MOCK_TITLES.length],
        publishedAt: new Date(Date.now() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
        durationSeconds: 180 + (ss % 1500),
        views: Math.round(avgViews * multiplier),
        likes: Math.round(avgViews * multiplier * 0.03),
        format: ss % 6 === 0 ? "short" : "long",
      } satisfies YTVideoSummary;
    });
  },
  async getTranscript(videoId) {
    return `(mock transcript for ${videoId}) — In this video we explore a topic, set up the problem, explain the mechanism, and apply it. Replace USE_MOCK_YOUTUBE=false and supply a YOUTUBE_API_KEY to fetch real transcripts.`;
  },
  async searchChannels(query, limit = 8) {
    return Promise.all(Array.from({ length: limit }, (_, i) => mock.findChannel(query + "-" + i))).then((xs) =>
      xs.filter((x): x is YTChannelSummary => x !== null),
    );
  },
};

// ── Real implementation: not wired yet; flip env.USE_MOCK_YOUTUBE=false and
// a real adapter (using process.env.YOUTUBE_API_KEY) will go here.

export const youtube: YouTubeProvider = env.USE_MOCK_YOUTUBE ? mock : mock;
