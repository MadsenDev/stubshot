Here we go. This is the **authoritative project summary** you can drop straight into the repo and also feed to an IDE AI without it hallucinating a SaaS backend or inventing React hooks you never asked for.

I’ll write this as if it’s the source of truth. Dry, explicit, and slightly paranoid. Exactly what tools understand.

---

# Stubshot – Project Summary

## 1. What Stubshot Is

**Stubshot** is a CLI-first developer tool for generating **local placeholder images** for web and app projects.

Its primary goal is to replace:

* random online placeholder URLs
* ad-hoc image downloads
* inconsistent mock assets

with **deterministic, reproducible, themed placeholder images** that live in the project repository.

Stubshot is:

* framework-agnostic
* asset-focused (outputs real files)
* deterministic by default
* automation- and CI-friendly

It is **not** a UI component library, a SaaS, or a design tool.

---

## 2. Core Philosophy

Stubshot follows these principles:

1. **Local-first**
   Placeholders are generated as files and committed to the repo.

2. **Deterministic output**
   Given the same config and seed, Stubshot produces the same images every time.

3. **CLI over UI**
   The CLI is the primary interface. No dashboards. No GUIs.

4. **Provider-based extensibility**
   Image generation logic is implemented via pluggable providers.

5. **Offline by default**
   The default provider does not require internet or API keys.

6. **Optional BYOK (Bring Your Own Key)**
   External image models are supported via optional provider packages.

---

## 3. Non-Goals (Important)

Stubshot explicitly does **not** aim to:

* host images
* generate runtime placeholders
* replace design tools
* score, analyze, or “improve” images
* be React-specific
* be AI-first

If a feature pushes Stubshot toward “design platform” territory, it is probably out of scope.

---

## 4. High-Level Architecture

Stubshot is implemented as a **monorepo** with multiple npm packages.

### Package Structure

```txt
stubshot/
├─ packages/
│  ├─ core/                 # CLI, config parsing, provider loading
│  ├─ provider-local/       # deterministic offline image generation
│  └─ provider-openai/      # optional BYOK image provider
```

### Core Responsibilities (`@stubshot/core`)

* CLI command parsing
* Config file loading
* Provider resolution and validation
* Output directory handling
* File naming and indexing
* Manifest generation (JSON)
* Error handling and user-facing messages

### Provider Responsibilities

* Generate an image buffer given structured input
* Declare supported formats and capabilities
* Remain stateless per invocation

Providers do **not**:

* parse CLI flags
* touch the filesystem directly
* manage config files
* know about project structure

---

## 5. Provider System

Stubshot uses a **provider plugin model** via npm packages.

### Provider Naming Convention

Providers are installed as scoped packages:

```txt
@stubshot/provider-local
@stubshot/provider-openai
```

The CLI resolves providers dynamically based on name.

Example:

```bash
stubshot generate --provider local
```

Resolves to:

```ts
@stubshot/provider-local
```

If the provider is missing, Stubshot fails with a clear error message.

---

## 6. Provider Interface (Conceptual)

All providers must implement the same minimal interface.

Conceptually:

```ts
interface StubshotProvider {
  name: string;

  supports: {
    formats: ("png" | "jpg" | "webp" | "svg")[];
    deterministic: boolean;
  };

  generate(input: {
    width: number;
    height: number;
    seed: string;
    theme: string;
    index: number;
    format: string;
  }): Promise<Buffer>;
}
```

Providers must be:

* pure (no hidden global state)
* side-effect free
* predictable

---

## 7. Default Provider: Local Generator

The **local provider** is the default and always recommended starting point.

### Characteristics

* No API keys
* Fully offline
* Deterministic
* Fast
* Uses programmatic generation (SVG or canvas-based)

### Example Themes (non-exhaustive)

* mesh-gradient
* geometric
* blobs
* noise
* pattern-grid
* skeleton-ui
* avatar-silhouette

Themes are intentionally abstract and generic. They should not attempt photorealism.

---

## 8. Optional BYOK Providers

BYOK providers allow Stubshot to generate placeholders using external image APIs.

### Key Characteristics

* Installed separately
* Disabled by default
* Require user-provided API keys
* Must respect rate limits and costs
* Should support caching where possible

API keys are provided via:

* environment variables
* config files

Never via CLI flags.

---

## 9. CLI Design

Stubshot is intended to be run:

* manually during development
* as part of scaffolding
* in CI or setup scripts

### Example Usage

```bash
npx stubshot generate \
  --out public/placeholders \
  --count 12 \
  --sizes 1200x800,800x800 \
  --theme mesh-gradient \
  --format png \
  --prefix product \
  --seed my-project
```

### Key CLI Concepts

* Batch generation
* Predictable naming
* Explicit output directories
* No hidden defaults that affect assets silently

---

## 10. File Naming and Output

Stubshot generates:

* image files
* optional manifest file

### Example Output

```txt
public/placeholders/
├─ product_01.png
├─ product_02.png
├─ product_03.png
└─ manifest.json
```

### Manifest File (Optional)

The manifest is a JSON index intended for easy consumption in frontend code.

Example:

```json
[
  {
    "name": "product_01",
    "src": "/placeholders/product_01.png",
    "width": 1200,
    "height": 800,
    "theme": "mesh-gradient"
  }
]
```

---

## 11. Determinism and Seeding

Stubshot supports deterministic output via a seed value.

* The same seed + config must produce identical images.
* Providers that cannot guarantee determinism must declare that explicitly.

This is critical for:

* reproducible builds
* consistent visuals across environments
* avoiding asset churn in version control

---

## 12. Target Users

Stubshot is built for:

* frontend developers
* full-stack developers
* design-system maintainers
* teams that care about reproducible builds

It assumes:

* basic CLI familiarity
* npm or pnpm usage
* version control

---

## 13. Development Expectations

When extending Stubshot:

* prefer clarity over cleverness
* keep interfaces small
* avoid global state
* document assumptions
* fail loudly and clearly

The tool should feel boring to use. That’s intentional.

---

## 14. Summary (The One-Liner)

**Stubshot generates deterministic, local placeholder images via a simple CLI and a pluggable provider system, with offline generation by default and optional BYOK image providers when needed.**

That’s the whole deal.