# @stubshot/provider-openai

BYOK provider for Stubshot that generates placeholder images using the OpenAI Images API.

## Install

```bash
npm i -D @stubshot/provider-openai
```

## Configure (environment)

Required:

- `OPENAI_API_KEY`

Optional:

- `OPENAI_BASE_URL` (defaults to `https://api.openai.com/v1`)
- `STUBSHOT_OPENAI_MODEL` (defaults to `gpt-image-1`)
- `STUBSHOT_OPENAI_QUALITY` (`low` | `medium` | `high`, default `medium`)
- `STUBSHOT_OPENAI_BACKGROUND` (`transparent` | `opaque`, default `opaque`)
- `STUBSHOT_OPENAI_MAX_IMAGES` (non-negative integer; fails if exceeded, default: unlimited)

## Usage

```bash
stubshot generate --provider openai --format png --out public/placeholders --count 4 --sizes 1024x1024 --theme mesh-gradient --seed my-project
```

Note: the provider is **not deterministic** and does not guarantee exact pixel sizes for arbitrary `--sizes`. It will pick a supported size closest to your request.
