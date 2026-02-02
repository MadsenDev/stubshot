import { Command } from "commander";
import { createRequire } from "node:module";

import { generate } from "@stubshot/core";
import type { StubshotConfig } from "@stubshot/core";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version?: string };

function parseIntOption(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) throw new Error(`Invalid number: ${value}`);
  return parsed;
}

export async function main(argv: string[]): Promise<void> {
  const program = new Command();

  program.name("stubshot").description("Generate deterministic local placeholder images");
  program.version(pkg.version ?? "0.0.0");

  program
    .command("generate")
    .description("Generate placeholder images into an output directory")
    .option("--provider <name>", "Provider name (e.g. local)")
    .option("--out <dir>", "Output directory")
    .option("--count <n>", "How many images per size", parseIntOption)
    .option("--sizes <list>", "Comma-separated sizes like 1200x800,800x800")
    .option("--width <px>", "Width in pixels (used if --sizes not set)", parseIntOption)
    .option("--height <px>", "Height in pixels (used if --sizes not set)", parseIntOption)
    .option(
      "--aspect <ratio>",
      "Aspect ratio (e.g. 16:9 or 1.777); used with --width or --height",
    )
    .option("--theme <name>", "Theme name")
    .option("--format <fmt>", "Output format (provider-dependent)")
    .option("--prefix <name>", "Filename prefix")
    .option("--padding <n>", "Zero-padding digits for index", parseIntOption)
    .option("--start-index <n>", "Starting index", parseIntOption)
    .option("--seed <seed>", "Seed for deterministic output")
    .option("--manifest [path]", "Write a JSON manifest (default: manifest.json in --out)")
    .option("--dry-run", "Plan output but do not write files", false)
    .option("--overwrite", "Allow overwriting existing files", false)
    .option("--concurrency <n>", "Max parallel image generations", parseIntOption)
    .option("--silent", "No output", false)
    .option("--verbose", "Verbose output", false)
    .action(async (opts, command: Command) => {
      const overrides: Partial<StubshotConfig> = {};

      const setIfCli = <K extends keyof StubshotConfig>(key: K, optionName: string, value: unknown) => {
        const source = (command as any).getOptionValueSource?.(optionName) as string | undefined;
        if (source === "cli") (overrides as any)[key] = value;
      };

      setIfCli("provider", "provider", opts.provider);
      setIfCli("outDir", "out", opts.out);
      setIfCli("count", "count", opts.count);
      setIfCli("sizes", "sizes", opts.sizes);
      setIfCli("width", "width", opts.width);
      setIfCli("height", "height", opts.height);
      setIfCli("aspect", "aspect", opts.aspect);
      setIfCli("theme", "theme", opts.theme);
      setIfCli("format", "format", opts.format);
      setIfCli("prefix", "prefix", opts.prefix);
      setIfCli("padding", "padding", opts.padding);
      setIfCli("startIndex", "startIndex", opts.startIndex);
      setIfCli("seed", "seed", opts.seed);
      setIfCli("manifest", "manifest", opts.manifest);
      setIfCli("dryRun", "dryRun", opts.dryRun);
      setIfCli("overwrite", "overwrite", opts.overwrite);
      setIfCli("concurrency", "concurrency", opts.concurrency);
      setIfCli("silent", "silent", opts.silent);
      setIfCli("verbose", "verbose", opts.verbose);

      await generate(overrides);
    });

  await program.parseAsync(argv);
}
