import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

import type { StubshotConfig } from "./config.js";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pickConfigShape(value: unknown): Partial<StubshotConfig> {
  if (!isPlainObject(value)) return {};
  const v = value as Record<string, unknown>;
  const out: Partial<StubshotConfig> = v as Partial<StubshotConfig>;

  // Friendly aliases for config-file authors.
  if (out.outDir === undefined && typeof v.out === "string") out.outDir = v.out as string;
  if (out.startIndex === undefined && typeof v["start-index"] === "number") out.startIndex = v["start-index"] as number;
  if (out.dryRun === undefined && typeof v["dry-run"] === "boolean") out.dryRun = v["dry-run"] as boolean;
  if (out.cacheDir === undefined && typeof v["cache-dir"] === "string") out.cacheDir = v["cache-dir"] as string;
  if (out.cache === undefined && typeof v.cache === "boolean") out.cache = v.cache as boolean;

  return out;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadConfigFile(cwd: string): Promise<Partial<StubshotConfig>> {
  const jsPath = path.join(cwd, "stubshot.config.js");
  const jsonPath = path.join(cwd, "stubshot.config.json");

  if (await fileExists(jsPath)) {
    // Prefer dynamic import; fall back to require for CommonJS configs.
    try {
      const mod = (await import(pathToFileURL(jsPath).href)) as Record<string, unknown>;
      return pickConfigShape(mod.default ?? mod);
    } catch {
      const require = createRequire(import.meta.url);
      const mod = require(jsPath) as Record<string, unknown>;
      return pickConfigShape(mod.default ?? mod);
    }
  }

  if (await fileExists(jsonPath)) {
    const raw = await fs.readFile(jsonPath, "utf8");
    return pickConfigShape(JSON.parse(raw) as unknown);
  }

  return {};
}
