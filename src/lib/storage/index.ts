import { promises as fs } from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { env } from "@/lib/env";

// Storage interface (FR-CANV-08 uploads, FR-CHAT-07 file context, FR-RES-01).
// Backends: local | s3 | gdrive. Local is the dev default.

export type StoredFile = {
  key: string;       // opaque key (use for retrieval)
  url: string;       // accessible URL (file:// or signed cloud URL)
  size: number;
  contentType?: string;
  originalName?: string;
};

export interface StorageProvider {
  put(name: string, data: Buffer | Uint8Array, contentType?: string): Promise<StoredFile>;
  get(key: string): Promise<Buffer | null>;
  url(key: string): string;
}

class LocalStorage implements StorageProvider {
  constructor(private root: string) {}
  private async ensure() {
    await fs.mkdir(this.root, { recursive: true });
  }
  async put(name: string, data: Buffer | Uint8Array, contentType?: string): Promise<StoredFile> {
    await this.ensure();
    const ext = path.extname(name) || "";
    const key = nanoid(16) + ext;
    const full = path.join(this.root, key);
    await fs.writeFile(full, data);
    return {
      key,
      url: `/uploads/${key}`,
      size: data.byteLength,
      contentType,
      originalName: name,
    };
  }
  async get(key: string): Promise<Buffer | null> {
    try {
      return await fs.readFile(path.join(this.root, key));
    } catch {
      return null;
    }
  }
  url(key: string): string {
    return `/uploads/${key}`;
  }
}

export const storage: StorageProvider = (() => {
  switch (env.STORAGE_BACKEND) {
    case "s3":
    case "gdrive":
      // Real adapters not wired yet; fall back to local until then.
      return new LocalStorage(path.resolve(env.STORAGE_LOCAL_DIR));
    case "local":
    default:
      return new LocalStorage(path.resolve(env.STORAGE_LOCAL_DIR));
  }
})();
