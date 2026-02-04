import { promises as fs } from "node:fs";
import path from "node:path";

import { loadConfigFile } from "./load-config.js";
import { loadProvider } from "./provider-loader.js";
import { parseAspectRatio, parseSizes } from "./parse.js";
import { toPosixPath } from "./path.js";
import { createLogger } from "./log.js";
import { validateConfig } from "./validate.js";
import { cacheEntryFor, computeCacheKey, readCache, writeCache } from "./cache.js";
import type { StubshotConfig, StubshotConfigOverrides } from "./config.js";

type Size = { width: number; height: number };

function applyDefaults(value: Partial<StubshotConfig>): StubshotConfig {
  return {
    provider: value.provider ?? "local",
    outDir: value.outDir ?? "stubshot",
    count: value.count ?? 1,
    sizes: value.sizes,
    width: value.width,
    height: value.height,
    aspect: value.aspect,
    theme: value.theme ?? "mesh-gradient",
    format: value.format ?? "svg",
    prefix: value.prefix ?? "stub",
    padding: value.padding ?? 2,
    startIndex: value.startIndex ?? 1,
    seed: value.seed ?? "stubshot",
    manifest: value.manifest,
    baseUrl: value.baseUrl,
    cacheDir: value.cacheDir,
    cache: value.cache ?? true,
    dryRun: value.dryRun ?? false,
    overwrite: value.overwrite ?? false,
    silent: value.silent ?? false,
    verbose: value.verbose ?? false,
    concurrency: value.concurrency ?? 8,
  };
}

function mergeConfig(overrides: StubshotConfigOverrides, file: Partial<StubshotConfig>): StubshotConfig {
  return applyDefaults({
    ...file,
    ...overrides,
  });
}

function deriveSizes(config: StubshotConfig): Size[] {
  if (config.sizes && config.sizes.trim().length > 0) return parseSizes(config.sizes);

  const width = config.width;
  const height = config.height;
  const aspect = config.aspect ? parseAspectRatio(config.aspect) : undefined;

  if (width && height) return [{ width, height }];

  if (aspect && width && !height) return [{ width, height: Math.max(1, Math.round(width / aspect)) }];
  if (aspect && height && !width) return [{ width: Math.max(1, Math.round(height * aspect)), height }];

  return [{ width: 800, height: 600 }];
}

function padIndex(index: number, padding: number): string {
  return String(index).padStart(Math.max(0, padding), "0");
}

export async function generate(cliOverrides: StubshotConfigOverrides = {}): Promise<void> {
  const fileConfig = await loadConfigFile(process.cwd());
  const config = mergeConfig(cliOverrides, fileConfig);
  validateConfig(config);
  const log = createLogger({ silent: config.silent, verbose: config.verbose });

  const provider = await loadProvider(config.provider);
  const cacheDirAbs =
    config.cache && config.cacheDir && config.cacheDir.trim().length > 0
      ? path.resolve(process.cwd(), config.cacheDir)
      : undefined;

  const requestedFormat = config.format.toLowerCase();
  const supportedFormats = provider.supports.formats.map((f) => String(f).toLowerCase());
  if (!supportedFormats.includes(requestedFormat)) {
    throw new Error(
      `Provider "${provider.name}" does not support format "${config.format}". Supported: ${provider.supports.formats.join(
        ", ",
      )}`,
    );
  }

  const sizes = deriveSizes(config);
  const outDirAbs = path.resolve(process.cwd(), config.outDir);

  const tasks: Array<{ size: Size; index: number }> = [];
  let index = config.startIndex;
  for (const size of sizes) {
    for (let i = 0; i < config.count; i += 1) {
      tasks.push({ size, index });
      index += 1;
    }
  }

  const ext = requestedFormat;
  const shouldWriteManifest = config.manifest !== undefined && config.manifest !== false;

  const manifestPathAbs = shouldWriteManifest
    ? path.resolve(
        outDirAbs,
        typeof config.manifest === "string" && config.manifest.trim().length > 0
          ? config.manifest
          : "manifest.json",
      )
    : undefined;

  if (!config.dryRun) await fs.mkdir(outDirAbs, { recursive: true });

  const manifest: Array<Record<string, unknown>> = [];
  const failures: Array<{ name: string; error: Error }> = [];

  const baseUrl = config.baseUrl?.trim();
  const normalizedBaseUrl =
    baseUrl && baseUrl.length > 0 ? baseUrl.replace(/\/+$/, "") : undefined;

  async function generateOne(task: { size: Size; index: number }): Promise<void> {
    const name = `${config.prefix}_${padIndex(task.index, config.padding)}`;
    const filename = `${name}.${ext}`;
    const filePathAbs = path.join(outDirAbs, filename);

    if (!config.overwrite && !config.dryRun) {
      try {
        await fs.access(filePathAbs);
        throw new Error(
          `Refusing to overwrite existing file: ${toPosixPath(path.relative(process.cwd(), filePathAbs))} (use --overwrite)`,
        );
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code !== "ENOENT") {
          throw err;
        }
      }
    }

    const perImageSeed = `${config.seed}:${config.theme}:${config.format}:${task.size.width}x${task.size.height}:${task.index}`;
    const providerInput = {
      width: task.size.width,
      height: task.size.height,
      seed: perImageSeed,
      theme: config.theme,
      index: task.index,
      format: config.format,
    };
    Object.freeze(providerInput);

    let buffer: Buffer | undefined;
    let cacheHit = false;
    let cacheEntry: ReturnType<typeof cacheEntryFor> | undefined;

    if (cacheDirAbs && !config.dryRun) {
      const key = computeCacheKey({
        providerId: config.provider,
        providerName: provider.name,
        theme: config.theme,
        format: config.format,
        width: task.size.width,
        height: task.size.height,
        seed: perImageSeed,
      });
      cacheEntry = cacheEntryFor(cacheDirAbs, key, config.format);
      buffer = await readCache(cacheEntry);
      cacheHit = buffer !== undefined;
      if (cacheHit) {
        log.debug(`cache hit ${name}`);
      }
    }

    if (!buffer) {
      buffer = await provider.generate(providerInput);
      if (cacheEntry && !config.dryRun) {
        try {
          await writeCache(cacheEntry, buffer);
        } catch (err) {
          log.debug(`cache write failed for ${name}: ${(err as Error).message}`);
        }
      }
    }

    if (!config.dryRun) await fs.writeFile(filePathAbs, buffer);
    log.info(
      `${config.dryRun ? "[dry-run] " : ""}${cacheHit ? "[cache] " : ""}wrote ${toPosixPath(
        path.relative(process.cwd(), filePathAbs),
      )}`,
    );

    if (shouldWriteManifest) {
      manifest.push({
        name,
        src: normalizedBaseUrl ? `${normalizedBaseUrl}/${filename}` : toPosixPath(path.relative(process.cwd(), filePathAbs)),
        width: task.size.width,
        height: task.size.height,
        theme: config.theme,
        provider: provider.name,
        format: config.format,
      });
    }
  }

  const concurrency = Math.max(1, config.concurrency);
  const queue = tasks.slice();
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (true) {
      const next = queue.shift();
      if (!next) break;
      try {
        await generateOne(next);
      } catch (err) {
        const name = `${config.prefix}_${padIndex(next.index, config.padding)}`;
        const error = err instanceof Error ? err : new Error(String(err));
        failures.push({ name, error });
        log.info(`error ${name}: ${error.message}`);
      }
    }
  });

  await Promise.all(workers);

  if (shouldWriteManifest && manifestPathAbs) {
    const contents = `${JSON.stringify(manifest, null, 2)}\n`;
    if (!config.dryRun) await fs.writeFile(manifestPathAbs, contents, "utf8");
    log.info(
      `${config.dryRun ? "[dry-run] " : ""}wrote ${toPosixPath(path.relative(process.cwd(), manifestPathAbs))}`,
    );
  }

  log.info(
    `done (${tasks.length} image${tasks.length === 1 ? "" : "s"}; ${failures.length} error${
      failures.length === 1 ? "" : "s"
    })`,
  );

  if (failures.length > 0) {
    const lines = failures
      .slice(0, 10)
      .map((f) => `- ${f.name}: ${f.error.message}`)
      .join("\n");
    const more = failures.length > 10 ? `\n- ...and ${failures.length - 10} more` : "";
    throw new Error(`Some images failed to generate:\n${lines}${more}`);
  }
}
