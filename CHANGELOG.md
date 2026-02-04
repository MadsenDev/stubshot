# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## Unreleased

## 0.1.2 - 2026-02-04

### Added

- Documentation pages for provider authoring, BYOK OpenAI usage, and CI
- Provider input is treated as immutable (core passes a frozen input object)
- Local provider SVG snapshot tests for deterministic themes
- Monorepo contribution guide
- CLI DX: consistent `stubshot: error:` formatting and non-fatal warnings for OpenAI cost/caching
- Prettier + ESLint configuration
- Bash/Zsh shell completion via `stubshot completion`
- Package size audit notes and `pnpm size:audit` script

## 0.1.1 - 2026-02-03

### Added

- Disk cache (`--cache-dir`, `--no-cache`) to avoid regenerating identical images
- `stubshot providers` command to show installed/missing providers
- `--base-url` / `baseUrl` to make manifest `src` paths web-friendly (e.g. `/placeholders/foo.svg`)
- Local provider raster output (`png`, `jpg`, `webp`) rendered from deterministic SVG (via `sharp`)
- Optional BYOK OpenAI provider package (`@stubshot/provider-openai`) with env-based API key loading (PNG output)
- OpenAI provider cost guard (`STUBSHOT_OPENAI_MAX_IMAGES`)
- GitHub Actions CI workflow (build + tests on push/PR)
- Test coverage for config loading, provider resolution, CLI help, and local-provider determinism

## 0.1.0 - 2026-02-02

### Added

- `stubshot` CLI package with `generate` command
- `@stubshot/core` engine (config loading, provider loading, deterministic generation pipeline)
- `@stubshot/provider-local` deterministic offline SVG provider with themes:
  - `mesh-gradient`, `geometric`, `noise`, `pattern-grid`, `skeleton-ui`, `blobs`
