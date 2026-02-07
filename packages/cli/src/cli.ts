import { Command } from "commander";
import { createRequire } from "node:module";

import { generate, loadProvider } from "@stubshot/core";
import type { StubshotConfig } from "@stubshot/core";

const require = createRequire(import.meta.url);
const pkg = require("../package.json") as { version?: string };

function bashCompletionScript(): string {
  // Minimal static completion for stubshot. Keep in sync with CLI options.
  return `# bash completion for stubshot
_stubshot_completions() {
  local cur prev words cword
  _init_completion -n : || return

  local commands="generate providers completion help"
  local global_opts="--help -h --version -V"

  if [[ $cword -eq 1 ]]; then
    COMPREPLY=( $(compgen -W "$commands $global_opts" -- "$cur") )
    return
  fi

  case "\${words[1]}" in
    generate)
      local opts="--provider --out --count --sizes --width --height --aspect --theme --format --prefix --padding --start-index --seed --manifest --base-url --cache-dir --no-cache --dry-run --overwrite --concurrency --silent --verbose --help -h"
      COMPREPLY=( $(compgen -W "$opts" -- "$cur") )
      ;;
    providers)
      local opts="--json --help -h"
      COMPREPLY=( $(compgen -W "$opts" -- "$cur") )
      ;;
    completion)
      local opts="bash zsh --help -h"
      COMPREPLY=( $(compgen -W "$opts" -- "$cur") )
      ;;
    *)
      COMPREPLY=( $(compgen -W "$global_opts" -- "$cur") )
      ;;
  esac
}
complete -F _stubshot_completions stubshot
`;
}

function zshCompletionScript(): string {
  return `#compdef stubshot

_stubshot() {
  local -a commands
  commands=(
    'generate:Generate placeholder images'
    'providers:List known providers'
    'completion:Print shell completion script'
    'help:Show help'
  )

  _arguments -C \\
    '1:command:->cmds' \\
    '*::arg:->args'

  case $state in
    cmds)
      _describe 'command' commands
      ;;
    args)
      case $words[2] in
        generate)
          _arguments \\
            '--provider[Provider name]' \\
            '--out[Output directory]' \\
            '--count[How many images per size]' \\
            '--sizes[Comma-separated sizes like 1200x800,800x800]' \\
            '--width[Width in pixels]' \\
            '--height[Height in pixels]' \\
            '--aspect[Aspect ratio like 16:9]' \\
            '--theme[Theme name]' \\
            '--format[Output format]' \\
            '--prefix[Filename prefix]' \\
            '--padding[Zero-padding digits]' \\
            '--start-index[Starting index]' \\
            '--seed[Seed for deterministic output]' \\
            '--manifest[Write a JSON manifest]' \\
            '--base-url[Base URL for manifest src]' \\
            '--cache-dir[Disk cache directory]' \\
            '--no-cache[Disable disk cache]' \\
            '--dry-run[Do not write files]' \\
            '--overwrite[Allow overwriting]' \\
            '--concurrency[Max parallel generations]' \\
            '--silent[No output]' \\
            '--verbose[Verbose output]'
          ;;
        providers)
          _arguments '--json[Output as JSON]'
          ;;
        completion)
          _values 'shell' bash zsh
          ;;
      esac
      ;;
  esac
}

_stubshot
`;
}

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
    .option("--base-url <path>", "Base URL path for manifest src (e.g. /placeholders)")
    .option("--cache-dir <dir>", "Disk cache directory (stores provider outputs)")
    .option("--no-cache", "Disable disk cache (even if cacheDir is set)")
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
      setIfCli("baseUrl", "baseUrl", opts.baseUrl);
      setIfCli("cacheDir", "cacheDir", opts.cacheDir);
      setIfCli("cache", "cache", opts.cache);
      setIfCli("dryRun", "dryRun", opts.dryRun);
      setIfCli("overwrite", "overwrite", opts.overwrite);
      setIfCli("concurrency", "concurrency", opts.concurrency);
      setIfCli("silent", "silent", opts.silent);
      setIfCli("verbose", "verbose", opts.verbose);

      // Friendly warnings for higher-cost/non-deterministic flows.
      const provider = (overrides.provider as string | undefined) ?? "local";
      const isOpenAI = provider === "openai" || provider === "@stubshot/provider-openai";
      const hasCacheDir =
        typeof overrides.cacheDir === "string" && overrides.cacheDir.trim().length > 0;
      const cacheEnabled = overrides.cache !== false;

      if (!overrides.silent && isOpenAI) {
        if (!hasCacheDir && cacheEnabled) {
          console.warn(
            `stubshot: warn: OpenAI provider is non-deterministic; consider --cache-dir to avoid repeat costs.`,
          );
        }
        if (process.env.STUBSHOT_OPENAI_MAX_IMAGES === undefined) {
          console.warn(
            `stubshot: warn: Consider setting STUBSHOT_OPENAI_MAX_IMAGES as a cost guardrail.`,
          );
        }
      }

      await generate(overrides);
    });

  program
    .command("providers")
    .description("List known provider names and whether they are installed")
    .option("--json", "Output as JSON", false)
    .action(async (opts) => {
      const known = ["local", "icons", "openai"];
      const results: Array<{ name: string; installed: boolean; packageHint: string; error?: string }> = [];

      for (const name of known) {
        try {
          const provider = await loadProvider(name);
          results.push({
            name,
            installed: true,
            packageHint: `@stubshot/provider-${name}`,
          });
          if (!opts.json) {
            // Touch a couple fields to ensure the provider is valid.
            void provider.supports;
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          results.push({
            name,
            installed: false,
            packageHint: `@stubshot/provider-${name}`,
            error: message,
          });
        }
      }

      if (opts.json) {
        console.log(JSON.stringify(results, null, 2));
        return;
      }

      for (const r of results) {
        if (r.installed) {
          console.log(`${r.name}\tinstalled`);
        } else {
          console.log(`${r.name}\tmissing (install ${r.packageHint})`);
        }
      }
    });

  program
    .command("completion")
    .description("Print shell completion script")
    .argument("<shell>", "Shell name (bash|zsh)")
    .action((shell: string) => {
      const s = shell.toLowerCase();
      if (s === "bash") {
        console.log(bashCompletionScript());
        return;
      }
      if (s === "zsh") {
        console.log(zshCompletionScript());
        return;
      }
      throw new Error(`Unsupported shell: ${shell} (expected bash or zsh)`);
    });

  await program.parseAsync(argv);
}
