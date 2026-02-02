# Stubshot – Master TODO List

## 0. Repo & Project Setup

### Monorepo foundation

* [x] Initialize monorepo (`pnpm` or `npm workspaces`)
* [x] Root `package.json` with:

  * name: `stubshot`
  * private: true
  * workspace definitions
* [x] Add `.gitignore`
* [x] Add `.editorconfig`
* [x] Add `README.md` (project summary + quick start)
* [x] Decide Node version and add `.nvmrc` or `engines`
* [x] Add publishable CLI package (`packages/cli` → `stubshot`)

---

## 1. Core Package (`@stubshot/core`)

### CLI foundation (implemented in `stubshot` package)

* [x] Choose CLI framework (`commander`, `yargs`, or minimal custom)
* [x] Implement `stubshot` binary entry
* [x] Add `generate` command
* [x] Implement `--help` output
* [x] Implement `--version` flag

---

### Config handling

* [x] Support config file loading:

  * `stubshot.config.json`
  * `stubshot.config.js`
* [x] Merge CLI flags + config file values (CLI wins only when explicitly set)
* [x] Validate config schema
* [x] Clear error messages for invalid config

---

### CLI options (initial)

* [x] `--provider`
* [x] `--out`
* [x] `--count`
* [x] `--sizes` (e.g. `1200x800`)
* [x] `--aspect` + `--width`
* [x] `--theme`
* [x] `--format`
* [x] `--prefix`
* [x] `--padding`
* [x] `--start-index`
* [x] `--seed`
* [x] `--manifest`
* [x] `--dry-run`
* [x] `--overwrite` (added)
* [x] `--silent` / `--verbose` (added)

---

### Provider resolution

* [x] Resolve provider name → npm package name
* [x] Dynamic import of provider module
* [x] Validate provider interface
* [x] Friendly error when provider is missing
* [ ] List available providers command (optional)

---

### Generation pipeline

* [x] Normalize sizes/aspect ratios
* [x] Expand size list × count
* [x] Compute deterministic seed per image
* [x] Call provider `generate()` for each image
* [x] Handle async batching / concurrency limits
* [x] Catch and report per-image errors

---

### Output handling

* [x] Create output directory if missing
* [x] Generate predictable filenames
* [x] Write image buffers to disk
* [x] Prevent accidental overwrites (configurable)
* [x] Support `--dry-run` mode

---

### Manifest generation

* [x] Optional JSON manifest output
* [x] Include image metadata:

  * name
  * src
  * width / height
  * theme
  * provider
* [x] Stable ordering
* [x] Optional custom manifest filename

---

### Logging & UX

* [x] Human-readable progress output
* [x] Silent mode
* [x] Verbose/debug mode
* [x] Clear success summary
* [x] Fail fast on fatal errors

---

## 2. Provider Interface & Contracts

### Provider definition

* [x] Define canonical TypeScript interface
* [x] Export interface from `@stubshot/core`
* [x] Enforce minimal required fields
* [x] Validate provider capabilities at runtime

---

### Provider constraints

* [ ] Stateless execution
* [ ] No filesystem writes
* [ ] No CLI parsing
* [ ] Pure input → output

---

## 3. Local Provider (`@stubshot/provider-local`)

### Foundation

* [x] Package setup
* [x] Export provider factory
* [x] Declare supported formats
* [x] Declare determinism support

---

### Image generation engine

* [ ] Decide tech:

  * SVG-only
  * Canvas (node-canvas / skia)
* [x] Seeded random generator
* [x] Color palette generation
* [x] Deterministic layout logic

---

### Initial themes (MVP)

* [x] mesh-gradient
* [x] geometric
* [x] blobs
* [x] noise
* [x] pattern-grid
* [x] skeleton-ui

Each theme:

* [x] Deterministic output
* [x] Works at arbitrary sizes
* [ ] Format-agnostic where possible

---

### Output formats

* [x] SVG generation
* [ ] PNG rendering
* [ ] JPG rendering
* [ ] WebP rendering

---

## 4. OpenAI Provider (`@stubshot/provider-openai`) [Optional v1+]

### Setup

* [ ] Separate package
* [ ] Peer dependency on `@stubshot/core`
* [ ] Environment-based API key loading

---

### Prompt system

* [ ] Prompt template per theme
* [ ] Inject size, theme, index
* [ ] Avoid photorealism by default

---

### API integration

* [ ] Image generation call
* [ ] Error handling
* [ ] Rate limiting
* [ ] Retry strategy
* [ ] Cost-awareness logging

---

### Caching (important)

* [ ] Cache by `(seed + size + theme)`
* [ ] Optional disk cache
* [ ] Avoid regenerating identical images

---

## 5. Testing

### Core tests

* [ ] CLI argument parsing tests
* [ ] Config merging tests
* [ ] Provider resolution tests
* [ ] Deterministic output tests

---

### Provider tests

* [ ] Local provider snapshot tests
* [ ] Determinism verification
* [ ] Format support tests

---

## 6. Documentation

### README

* [ ] What Stubshot is
* [ ] Installation
* [ ] Basic usage
* [ ] Config file example
* [ ] Provider system overview
* [ ] Determinism explanation

---

### Advanced docs

* [ ] Provider authoring guide
* [ ] BYOK security notes
* [ ] CI usage examples
* [ ] Monorepo contribution guide

---

## 7. DX & Polish

* [ ] Shell autocomplete (optional)
* [ ] Zsh/Bash completion
* [ ] Prettier + ESLint config
* [ ] Consistent error formatting
* [ ] Friendly warnings (non-fatal)

---

## 8. Release Prep

* [x] Choose license (MIT/Apache-2.0/etc) and add `LICENSE`
* [x] Versioning strategy
* [x] Changelog format
* [x] `npm pack` dry-run for each publishable package
* [x] `npm publish --dry-run` for each publishable package
* [ ] Package size audit
* [ ] Add `repository`, `bugs`, `homepage` fields (optional; set to your real repo URL)
* [x] Basic smoke tests (`pnpm test`)

---

## 9. Future Ideas (Explicitly Not MVP)

* [ ] Blurhash / LQIP generation
* [ ] Animated placeholders
* [ ] Figma export helpers
* [ ] Additional AI providers
* [ ] Preset packs
* [ ] Asset hashing for cache-busting
* [ ] Watch mode

---

## Final Note

This TODO list is intentionally exhaustive.
You are not expected to do all of this at once.

The **true MVP** is:

* core CLI
* local provider
* deterministic generation
* sane output

Everything else is optional ambition.
