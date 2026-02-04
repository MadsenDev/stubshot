# Contributing

Thanks for helping improve Stubshot.

## Prerequisites

- Node.js (see `package.json` engines; Node 18+)
- pnpm (via corepack recommended)

```bash
corepack enable
```

## Repo layout

This repo is a pnpm workspace:

- `packages/cli` — published as `stubshot` (the CLI)
- `packages/core` — published as `@stubshot/core` (engine)
- `packages/provider-local` — published as `@stubshot/provider-local` (offline provider)
- `packages/provider-openai` — published as `@stubshot/provider-openai` (BYOK provider)

## Common commands

Install deps:

```bash
pnpm install
```

Build all packages:

```bash
pnpm -r build
```

Run tests:

```bash
pnpm test
```

Run the CLI from the workspace:

```bash
pnpm stubshot --help
pnpm stubshot generate --out public/placeholders --count 3 --sizes 1200x800 --format png --theme mesh-gradient
```

## Adding a provider

See `docs/provider-authoring.md`.

## Releasing

See `PUBLISHING.md`.

