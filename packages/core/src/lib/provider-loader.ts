import type { StubshotProvider } from "./provider-types.js";
import { isStubshotProvider } from "./provider-types.js";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

function resolveProviderPackageName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.length === 0) return "@stubshot/provider-local";
  if (trimmed.startsWith("@") || trimmed.includes("/")) return trimmed;
  return `@stubshot/provider-${trimmed.toLowerCase()}`;
}

function resolutionBasePath(): string {
  // Resolve providers relative to the entry script (CLI) so `stubshot` can bundle
  // default providers, while still allowing project-local providers when used as
  // a library (the entry script is then the user's script).
  if (typeof process.argv[1] === "string" && process.argv[1].length > 0) {
    return path.resolve(process.argv[1]);
  }
  return fileURLToPath(import.meta.url);
}

export async function loadProvider(name: string): Promise<StubshotProvider> {
  const packageName = resolveProviderPackageName(name);

  let mod: unknown;
  try {
    const require = createRequire(resolutionBasePath());
    const resolvedPath = require.resolve(packageName);
    mod = await import(pathToFileURL(resolvedPath).href);
  } catch (err) {
    const code = (err as { code?: string }).code;
    const hint =
      code === "ERR_MODULE_NOT_FOUND" || code === "MODULE_NOT_FOUND"
        ? `Provider "${name}" is not installed. Install "${packageName}" and try again.`
        : `Failed to load provider "${name}" (${packageName}).`;
    throw new Error(`${hint}\n${(err as Error).message}`);
  }

  const maybe = (mod as { default?: unknown; provider?: unknown }).default ?? (mod as { provider?: unknown }).provider;
  if (!isStubshotProvider(maybe)) {
    throw new Error(`Provider "${name}" did not export a valid provider (expected default or named "provider").`);
  }

  return maybe;
}
