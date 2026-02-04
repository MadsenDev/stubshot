# BYOK OpenAI provider

This project includes an optional provider package:

- `@stubshot/provider-openai`

## Install

```bash
npm i -D @stubshot/provider-openai
```

## Environment variables

Required:

- `OPENAI_API_KEY`

Optional:

- `OPENAI_BASE_URL`
- `STUBSHOT_OPENAI_MODEL`
- `STUBSHOT_OPENAI_QUALITY`
- `STUBSHOT_OPENAI_BACKGROUND`
- `STUBSHOT_OPENAI_MAX_IMAGES` (guardrail; fails when exceeded)

## Recommended flags

Because remote generation is not deterministic, use disk cache:

```bash
npx stubshot generate --provider openai --format png --cache-dir .stubshot-cache --out public/placeholders --count 4 --sizes 1024x1024 --seed my-project
```

