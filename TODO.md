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
* [x] `--base-url`
* [x] `--dry-run`
* [x] `--overwrite` (added)
* [x] `--silent` / `--verbose` (added)
* [x] `--concurrency` (added)

---

### Provider resolution

* [x] Resolve provider name → npm package name
* [x] Dynamic import of provider module
* [x] Validate provider interface
* [x] Friendly error when provider is missing
* [x] List available providers command (optional)

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

* [x] Stateless execution
* [x] No filesystem writes
* [x] No CLI parsing
* [x] Pure input → output

---

## 3. Local Provider (`@stubshot/provider-local`)

### Foundation

* [x] Package setup
* [x] Export provider factory
* [x] Declare supported formats
* [x] Declare determinism support

---

### Image generation engine

* [x] Decide tech:

  * SVG-only
  * Raster via `sharp`
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
* [x] PNG rendering
* [x] JPG rendering
* [x] WebP rendering

---

## 4. OpenAI Provider (`@stubshot/provider-openai`) [Optional v1+]

### Setup

* [x] Separate package
* [x] Peer dependency on `@stubshot/core`
* [x] Environment-based API key loading

---

### Prompt system

* [x] Prompt template per theme
* [x] Inject size, theme, index
* [x] Avoid photorealism by default

---

### API integration

* [x] Image generation call
* [x] Error handling
* [x] Rate limiting
* [x] Retry strategy
* [x] Cost-awareness logging

---

### Caching (important)

* [x] Cache by `(seed + size + theme)`
* [x] Optional disk cache
* [x] Avoid regenerating identical images

---

## 5. Testing

### Core tests

* [x] CLI argument parsing tests
* [x] Config merging tests
* [x] Provider resolution tests
* [x] Deterministic output tests
* [x] CI workflow runs build/tests

---

### Provider tests

* [x] Local provider snapshot tests
* [x] Determinism verification
* [x] Format support tests

---

## 6. Documentation

### README

* [x] What Stubshot is
* [x] Installation
* [x] Basic usage
* [x] Config file example
* [x] Provider system overview
* [x] Determinism explanation

---

### Advanced docs

* [x] Provider authoring guide
* [x] BYOK security notes
* [x] CI usage examples
* [x] Monorepo contribution guide

---

## 7. DX & Polish

* [x] Shell autocomplete (optional)
* [x] Zsh/Bash completion
* [x] Prettier + ESLint config
* [x] Consistent error formatting
* [x] Friendly warnings (non-fatal)

---

## 8. Release Prep

* [x] Choose license (MIT/Apache-2.0/etc) and add `LICENSE`
* [x] Versioning strategy
* [x] Versioning policy documented (`VERSIONING.md`)
* [x] Changelog format
* [x] `npm pack` dry-run for each publishable package
* [x] `npm publish --dry-run` for each publishable package
* [x] Package size audit
* [x] Add `repository`, `bugs`, `homepage` fields (optional; set to your real repo URL)
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

---

## Icons Provider (`@stubshot/provider-icons`) [Optional]

* [x] Separate package
* [x] Environment-based directory config (`STUBSHOT_ICONS_DIR`)
* [x] Deterministic icon selection (given same dir contents)
* [x] SVG output
* [x] PNG/JPG/WebP output (via `sharp`)
* [x] Tests (determinism + png header)
