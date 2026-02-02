import type { StubshotConfig } from "./config.js";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateConfig(config: StubshotConfig): void {
  const errors: string[] = [];

  if (!isNonEmptyString(config.provider)) errors.push(`"provider" must be a non-empty string`);
  if (!isNonEmptyString(config.outDir)) errors.push(`"outDir" must be a non-empty string`);
  if (!isNonEmptyString(config.theme)) errors.push(`"theme" must be a non-empty string`);
  if (!isNonEmptyString(config.format)) errors.push(`"format" must be a non-empty string`);
  if (!isNonEmptyString(config.prefix)) errors.push(`"prefix" must be a non-empty string`);
  if (!isNonEmptyString(config.seed)) errors.push(`"seed" must be a non-empty string`);

  if (!Number.isInteger(config.count) || config.count <= 0) errors.push(`"count" must be a positive integer`);
  if (!Number.isInteger(config.padding) || config.padding < 0) errors.push(`"padding" must be an integer >= 0`);
  if (!Number.isInteger(config.startIndex) || config.startIndex < 0)
    errors.push(`"startIndex" must be an integer >= 0`);

  if (config.width !== undefined && (!Number.isInteger(config.width) || config.width <= 0))
    errors.push(`"width" must be a positive integer when provided`);
  if (config.height !== undefined && (!Number.isInteger(config.height) || config.height <= 0))
    errors.push(`"height" must be a positive integer when provided`);

  if (
    config.manifest !== undefined &&
    typeof config.manifest !== "boolean" &&
    (typeof config.manifest !== "string" || config.manifest.trim().length === 0)
  ) {
    errors.push(`"manifest" must be true, false, or a non-empty string path`);
  }

  if (typeof config.dryRun !== "boolean") errors.push(`"dryRun" must be boolean`);
  if (typeof config.overwrite !== "boolean") errors.push(`"overwrite" must be boolean`);
  if (typeof config.silent !== "boolean") errors.push(`"silent" must be boolean`);
  if (typeof config.verbose !== "boolean") errors.push(`"verbose" must be boolean`);
  if (!Number.isInteger(config.concurrency) || config.concurrency <= 0)
    errors.push(`"concurrency" must be a positive integer`);

  if (config.sizes !== undefined && typeof config.sizes !== "string") errors.push(`"sizes" must be a string when provided`);
  if (config.aspect !== undefined && typeof config.aspect !== "string")
    errors.push(`"aspect" must be a string when provided`);

  if (errors.length > 0) {
    throw new Error(`Invalid Stubshot config:\n- ${errors.join("\n- ")}`);
  }
}
