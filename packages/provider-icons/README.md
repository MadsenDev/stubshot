# @stubshot/provider-icons

Optional Stubshot provider that generates placeholder images by rendering SVG icons from a directory.

## Install

```bash
npm i -D @stubshot/provider-icons
```

## Configure (environment)

Required:

- `STUBSHOT_ICONS_DIR` — directory containing `.svg` files

Optional:

- `STUBSHOT_ICONS_PADDING` — padding ratio (default `0.18`)
- `STUBSHOT_ICONS_BG` — background (`auto` | `transparent` | `opaque`, default `auto`)
- `STUBSHOT_ICONS_COLOR` — icon color (CSS color; only applied when `STUBSHOT_ICONS_MONO=1`)
- `STUBSHOT_ICONS_MONO` — when `1`, attempt to force the icon to a single color

## Usage

```bash
export STUBSHOT_ICONS_DIR=./stubshot-icons
npx stubshot generate --provider icons --format png --out public/placeholders --count 12 --sizes 512x512 --seed my-project --cache-dir .stubshot-cache
```

