# Publishing

This repo publishes multiple npm packages:

- `@stubshot/core`
- `@stubshot/provider-local`
- `@stubshot/provider-openai` (optional BYOK)
- `stubshot` (CLI)

## Preflight

```bash
pnpm test
```

## Publish order

Publish dependencies first, then the CLI:

```bash
cd packages/core && npm publish --access public
cd ../provider-local && npm publish --access public
cd ../provider-openai && npm publish --access public
cd ../cli && npm publish
```

Notes:

- If npm requires 2FA, add `--otp 123456` per publish.
- If you see `EACCES` related to `~/.npm`, use a temporary cache:

```bash
npm --cache /tmp/npm-cache publish ...
```

