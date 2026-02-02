# Stubshot

Stubshot generates deterministic, local placeholder images via a simple CLI and a pluggable provider system, with offline generation by default and optional BYOK providers when needed.

## Status

Current MVP supports the local provider with **SVG output** and a handful of themes (e.g. `mesh-gradient`, `geometric`, `noise`, `pattern-grid`, `skeleton-ui`, `blobs`).

## Quick start (workspace)

```bash
pnpm install
pnpm -r build
pnpm stubshot generate --out public/placeholders --count 3 --sizes 1200x800 --theme mesh-gradient --format svg --prefix product --seed my-project --manifest
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
  "format": "svg",
  "prefix": "product",
  "seed": "my-project",
  "manifest": true
}
```

Then run:

```bash
pnpm stubshot generate
```
