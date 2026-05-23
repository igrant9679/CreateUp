import { env } from "@/lib/env";

// Background-job interface (agents, onboarding, indexing).
// In-memory implementation for local dev. Swap to BullMQ+Redis when
// JOB_BACKEND=redis and REDIS_URL is provided.

export type JobHandler<TPayload = unknown> = (payload: TPayload, ctx: JobContext) => Promise<void>;

export type JobContext = {
  id: string;
  progress: (n: number) => Promise<void>;
  log: (message: string) => void;
};

export interface JobQueue {
  register<TPayload>(name: string, handler: JobHandler<TPayload>): void;
  enqueue<TPayload>(name: string, payload: TPayload): Promise<string>;
  status(id: string): Promise<{ id: string; name: string; progress: number; state: "queued" | "running" | "done" | "failed"; error?: string } | null>;
}

type JobRecord = { id: string; name: string; payload: unknown; state: "queued" | "running" | "done" | "failed"; progress: number; error?: string };

class MemoryQueue implements JobQueue {
  private handlers = new Map<string, JobHandler<unknown>>();
  private jobs = new Map<string, JobRecord>();

  register<TPayload>(name: string, handler: JobHandler<TPayload>): void {
    this.handlers.set(name, handler as JobHandler<unknown>);
  }
  async enqueue<TPayload>(name: string, payload: TPayload): Promise<string> {
    const id = "job_" + Math.random().toString(36).slice(2, 12);
    const rec: JobRecord = { id, name, payload, state: "queued", progress: 0 };
    this.jobs.set(id, rec);
    // Fire-and-forget; do not block the request path.
    void this.run(rec);
    return id;
  }
  private async run(rec: JobRecord) {
    const handler = this.handlers.get(rec.name);
    if (!handler) {
      rec.state = "failed";
      rec.error = `No handler for ${rec.name}`;
      return;
    }
    rec.state = "running";
    try {
      await handler(rec.payload, {
        id: rec.id,
        progress: async (n) => { rec.progress = Math.max(0, Math.min(1, n)); },
        log: (m) => { if (env.LOG_LEVEL === "debug") console.log(`[job ${rec.id}]`, m); },
      });
      rec.state = "done";
      rec.progress = 1;
    } catch (e) {
      rec.state = "failed";
      rec.error = e instanceof Error ? e.message : String(e);
    }
  }
  async status(id: string) {
    const r = this.jobs.get(id);
    if (!r) return null;
    return { id: r.id, name: r.name, progress: r.progress, state: r.state, error: r.error };
  }
}

// Singleton across HMR reloads in dev.
const globalForJobs = globalThis as unknown as { __jobs?: JobQueue };
export const jobs: JobQueue = globalForJobs.__jobs ?? new MemoryQueue();
if (env.NODE_ENV !== "production") globalForJobs.__jobs = jobs;
