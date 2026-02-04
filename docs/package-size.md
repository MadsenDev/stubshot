# Package size audit

Current packed tarball sizes (approx):

- `@stubshot/core`: ~13 KB (`stubshot-core-*.tgz`)
- `@stubshot/provider-local`: ~6 KB (`stubshot-provider-local-*.tgz`)
- `@stubshot/provider-openai`: ~5 KB (`stubshot-provider-openai-*.tgz`)
- `stubshot` (CLI): ~7 KB (`stubshot-*.tgz`)

To re-run locally:

```bash
rm -rf /tmp/stubshot-size && mkdir -p /tmp/stubshot-size
pnpm -C packages/core pack --pack-destination /tmp/stubshot-size
pnpm -C packages/provider-local pack --pack-destination /tmp/stubshot-size
pnpm -C packages/provider-openai pack --pack-destination /tmp/stubshot-size
pnpm -C packages/cli pack --pack-destination /tmp/stubshot-size
du -h /tmp/stubshot-size/*.tgz
```

