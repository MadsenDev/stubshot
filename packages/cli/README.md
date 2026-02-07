# Stubshot (CLI)

This package provides the `stubshot` CLI.

## Usage

From a project:

```bash
npx stubshot generate --out public/placeholders --count 12 --sizes 1200x800,800x800 --theme mesh-gradient --format svg --prefix product --seed my-project --manifest --base-url /placeholders
```

Formats: `svg`, `png`, `jpg`, `webp` (via the default local provider).

## BYOK providers

You can install optional providers, like OpenAI:

```bash
npm i -D @stubshot/provider-openai
```

Then run:

```bash
stubshot generate --provider openai --format png --out public/placeholders --count 4 --sizes 1024x1024 --theme mesh-gradient --seed my-project
```

You can also install an icon-based provider (directory-based SVG icons):

```bash
npm i -D @stubshot/provider-icons
export STUBSHOT_ICONS_DIR=./stubshot-icons
stubshot generate --provider icons --format png --out public/placeholders --count 8 --sizes 512x512 --seed my-project
```

## Provider discovery

List known providers and whether they’re installed:

```bash
stubshot providers
```

## Shell completion

Bash:

```bash
stubshot completion bash > /tmp/stubshot.bash
source /tmp/stubshot.bash
```

Zsh:

```bash
stubshot completion zsh > /tmp/_stubshot
fpath=(/tmp $fpath)
autoload -Uz compinit && compinit
```

## Caching

To avoid regenerating identical images (especially with BYOK providers), enable a disk cache:

```bash
stubshot generate --provider openai --format png --cache-dir .stubshot-cache --out public/placeholders --count 4 --sizes 1024x1024 --theme mesh-gradient --seed my-project
```

Disable cache:

```bash
stubshot generate --no-cache ...
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
