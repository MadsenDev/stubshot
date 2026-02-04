# Provider authoring guide

Stubshot providers are npm packages that export a provider object (default export).

## Naming

Recommended naming:

- `@stubshot/provider-<name>`

The CLI resolves `--provider <name>` to `@stubshot/provider-<name>`.

## Minimal shape

Providers must export an object with:

- `name: string`
- `supports: { formats: string[]; deterministic: boolean }`
- `generate(input): Promise<Buffer>`

Input includes:

- `width`, `height`
- `seed` (string)
- `theme` (string)
- `index` (number)
- `format` (string)

Note: Stubshot treats provider input as immutable; the core engine may pass a **frozen** input object. Providers must not mutate it.

## Constraints

Providers should be:

- Stateless per invocation
- Pure input → output (no hidden globals)
- Filesystem-free (return a Buffer; core writes files)
- CLI-free (core/CLI parse flags and config)
