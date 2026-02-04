# Stubshot

Stubshot generates deterministic, local placeholder images via a simple CLI and a pluggable provider system, with offline generation by default and optional BYOK providers when needed.

## What Stubshot is

- A CLI that generates placeholder images **as files** (commit them to your repo).
- Deterministic by default (local provider) when seed + config are the same.
- Provider-based (local/offline by default; optional BYOK providers like OpenAI).

Non-goals: hosting, runtime placeholder components, SaaS, design tooling.

## Status

Current MVP supports the local provider with **SVG/PNG/JPG/WebP output** and a handful of themes (e.g. `mesh-gradient`, `geometric`, `noise`, `pattern-grid`, `skeleton-ui`, `blobs`).

## Installation

```bash
npm i -D stubshot
```

## Basic usage

Generate 12 placeholders:

```bash
npx stubshot generate --out public/placeholders --count 12 --sizes 1200x800,800x800 --theme mesh-gradient --format png --prefix product --seed my-project --manifest --base-url /placeholders
```

List providers:

```bash
npx stubshot providers
```

## Quick start (workspace/dev)

```bash
pnpm install
pnpm -r build
pnpm stubshot generate --out public/placeholders --count 3 --sizes 1200x800 --theme mesh-gradient --format svg --prefix product --seed my-project --manifest --base-url /placeholders
```

Output lands in `public/placeholders/`.

## Config file

Create `stubshot.config.json` (or `stubshot.config.js`) in the repo root:

```json
{
  "out": "public/placeholders",
  "count": 12,
  "sizes": "1200x800,800x800",
  "theme": "mesh-gradient",
  "format": "png",
  "prefix": "product",
  "seed": "my-project",
  "manifest": true,
  "baseUrl": "/placeholders",
  "cacheDir": ".stubshot-cache"
}
```

Then run:

```bash
pnpm stubshot generate
```

## Provider system overview

- Providers are npm packages (e.g. `@stubshot/provider-local`).
- `--provider local` resolves to `@stubshot/provider-local`.
- Providers must export a default provider object with `name`, `supports`, and `generate()`.

## Determinism

- The local provider is deterministic: same config + seed => same output.
- BYOK providers (e.g. OpenAI) are typically **not** deterministic; use `--cache-dir` to avoid re-generating identical requests.

## Contributing

See `docs/contributing.md`.
