# CI

GitHub Actions CI is configured in `.github/workflows/ci.yml`.

It runs:

- `pnpm install --frozen-lockfile`
- `pnpm -r build`
- `pnpm test`

