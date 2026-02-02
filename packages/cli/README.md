# Stubshot (CLI)

This package provides the `stubshot` CLI.

## Usage

From a project:

```bash
npx stubshot generate --out public/placeholders --count 12 --sizes 1200x800,800x800 --theme mesh-gradient --format svg --prefix product --seed my-project --manifest
```

Config files supported:

- `stubshot.config.json`
- `stubshot.config.js`

## Monorepo dev

```bash
pnpm install
pnpm -r build
pnpm stubshot generate --out public/placeholders --count 3 --sizes 1200x800 --theme mesh-gradient --format svg --prefix product --seed my-project --manifest
```

