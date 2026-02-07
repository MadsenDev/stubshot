# Versioning policy

Stubshot is a monorepo that publishes multiple npm packages:

- `stubshot` (CLI, the “product”)
- `@stubshot/core` (engine/library)
- `@stubshot/provider-local` (default offline provider)
- `@stubshot/provider-openai` (optional BYOK provider)

This document defines how we bump versions and what version numbers mean.

## SemVer basics (what we follow)

We use Semantic Versioning: `MAJOR.MINOR.PATCH`

- **PATCH**: bug fixes and small changes that should not require user action.
- **MINOR**: new features or meaningful behavior changes that may require user awareness (but are intended to be backwards-compatible).
- **MAJOR**: breaking changes that require user changes.

Note: for `0.y.z`, SemVer allows more freedom. In practice we still treat:
- `0.y+1.0` as “minor feature release”
- `0.y.z+1` as “patch release”
- a change that breaks typical usage as “breaking”, even under `0.x`.

## “Product” vs “Package” versioning

We distinguish between:

### 1) CLI/product version (`stubshot`)

`stubshot` is what most users install and run. We bump `stubshot` based on **user-visible CLI capability**, including optional providers.

Examples that justify a `stubshot` **MINOR** bump:

- New CLI command or flag (e.g. `stubshot providers`, `--cache-dir`)
- New default provider capability that changes what users can do (e.g. `png/webp` output via local provider)
- New officially supported optional provider that integrates with the CLI workflow (e.g. documenting and supporting `--provider openai`)
- Manifest output shape changes

Examples that justify a `stubshot` **PATCH** bump:

- Bug fixes, improved error messages, small internal refactors
- Docs-only changes (usually no bump unless we republish for another reason)

### 2) Library/package versions (`@stubshot/*`)

Each `@stubshot/*` package is versioned based on changes to **that package’s API/behavior**.

- `@stubshot/core`: bump when the core API, config, generation pipeline, or provider loading behavior changes.
- Providers: bump when provider behavior/outputs/contracts change.

An optional provider can release new features without forcing a `stubshot` bump, unless the CLI experience or docs intentionally “bless” the new capability.

## Coordinated releases

We usually release a coordinated set:

- `@stubshot/core`
- `@stubshot/provider-local`
- `@stubshot/provider-openai` (if changed)
- `stubshot`

When the change is localized (e.g. only OpenAI provider), it’s okay to publish only that package.

## New package versions

New packages start at `0.1.0` (independent versioning), even if the CLI/library are at a higher version.

## Dependency ranges

- The `stubshot` package should depend on `@stubshot/core` and `@stubshot/provider-local` using a compatible range (e.g. `^0.1.0` when published).
- In the workspace, we use `workspace:^` so local dev stays in sync, and packed output becomes `^<version>`.

## Publishing order

Publish dependencies first:

1) `@stubshot/core`
2) `@stubshot/provider-local`
3) `@stubshot/provider-openai` (if applicable)
4) `stubshot`

See `PUBLISHING.md` for the exact commands.
