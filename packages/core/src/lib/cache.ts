import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export type CacheEntry = {
  key: string;
  pathAbs: string;
};

export function computeCacheKey(input: {
  providerName: string;
  providerId: string;
  theme: string;
  format: string;
  width: number;
  height: number;
  seed: string;
}): string {
  return [
    input.providerId,
    input.providerName,
    input.theme,
    input.format.toLowerCase(),
    `${input.width}x${input.height}`,
    input.seed,
  ].join("|");
}

export function cacheEntryFor(cacheDirAbs: string, key: string, format: string): CacheEntry {
  const digest = sha256Hex(key);
  const ext = format.toLowerCase();
  const filename = `${digest}.${ext}`;
  return {
    key,
    pathAbs: path.join(cacheDirAbs, filename),
  };
}

export async function readCache(entry: CacheEntry): Promise<Buffer | undefined> {
  try {
    return await fs.readFile(entry.pathAbs);
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === "ENOENT") return undefined;
    throw err;
  }
}

export async function writeCache(entry: CacheEntry, buffer: Buffer): Promise<void> {
  await fs.mkdir(path.dirname(entry.pathAbs), { recursive: true });
  const tmp = `${entry.pathAbs}.${process.pid}.tmp`;
  await fs.writeFile(tmp, buffer);
  await fs.rename(tmp, entry.pathAbs);
}

