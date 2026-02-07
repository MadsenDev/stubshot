import type { StubshotProvider, StubshotProviderGenerateInput } from "@stubshot/core";
import { promises as fs } from "node:fs";
import path from "node:path";

type BgMode = "auto" | "transparent" | "opaque";

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function parseNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}

function parseBgMode(value: string | undefined): BgMode {
  const v = value?.toLowerCase();
  if (v === "transparent" || v === "opaque" || v === "auto") return v;
  return "auto";
}

function fnv1a32(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function hsl(h: number, s: number, l: number): string {
  const hh = ((h % 360) + 360) % 360;
  const ss = Math.round(clamp01(s) * 100);
  const ll = Math.round(clamp01(l) * 100);
  return `hsl(${hh} ${ss}% ${ll}%)`;
}

function palette(seed: string): { bg: string; fg: string } {
  const rand = (fnv1a32(seed) % 1000) / 1000;
  const baseHue = Math.floor(rand * 360);
  return {
    bg: hsl(baseHue, 0.65, 0.60),
    fg: hsl(baseHue + 180, 0.70, 0.40),
  };
}

function extractViewBox(svg: string): { minX: number; minY: number; width: number; height: number } | undefined {
  const m = svg.match(/viewBox\s*=\s*["']\s*([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s+([\d.+-]+)\s*["']/i);
  if (!m) return undefined;
  const minX = Number.parseFloat(m[1]!);
  const minY = Number.parseFloat(m[2]!);
  const width = Number.parseFloat(m[3]!);
  const height = Number.parseFloat(m[4]!);
  if (![minX, minY, width, height].every((n) => Number.isFinite(n))) return undefined;
  return { minX, minY, width, height };
}

function stripOuterSvg(svg: string): string {
  const start = svg.search(/<svg\b[^>]*>/i);
  if (start === -1) return svg;
  const openEnd = svg.indexOf(">", start);
  const end = svg.search(/<\/svg\s*>/i);
  if (openEnd === -1 || end === -1) return svg;
  return svg.slice(openEnd + 1, end);
}

function maybeMonochrome(svgInner: string, enabled: boolean): string {
  if (!enabled) return svgInner;
  // Best-effort: convert explicit fills/strokes to currentColor (except none).
  return svgInner
    .replace(/\sfill\s*=\s*(['"])(?!none\1)[^'"]*\1/gi, ' fill="currentColor"')
    .replace(/\sstroke\s*=\s*(['"])(?!none\1)[^'"]*\1/gi, ' stroke="currentColor"');
}

async function listSvgFiles(dirAbs: string): Promise<string[]> {
  const entries = await fs.readdir(dirAbs, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".svg"))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b));
  return files;
}

function buildSvg(
  input: StubshotProviderGenerateInput,
  iconSvg: string,
  iconFileName: string,
  opts: { paddingRatio: number; bgMode: BgMode; mono: boolean; color?: string },
): Buffer {
  const vb = extractViewBox(iconSvg) ?? { minX: 0, minY: 0, width: 24, height: 24 };
  const pad = Math.round(Math.min(input.width, input.height) * clamp01(opts.paddingRatio));
  const innerW = Math.max(1, input.width - pad * 2);
  const innerH = Math.max(1, input.height - pad * 2);
  const scale = Math.min(innerW / vb.width, innerH / vb.height);
  const tx = pad + (innerW - vb.width * scale) / 2 - vb.minX * scale;
  const ty = pad + (innerH - vb.height * scale) / 2 - vb.minY * scale;

  const colors = palette(`${input.seed}:${iconFileName}`);
  const fmt = input.format.toLowerCase();
  const useBg = opts.bgMode === "opaque" || (opts.bgMode === "auto" && fmt !== "png");
  const backgroundRect = useBg ? `<rect width="${input.width}" height="${input.height}" fill="${colors.bg}"/>` : "";

  const svgInnerRaw = stripOuterSvg(iconSvg);
  const svgInner = maybeMonochrome(svgInnerRaw, opts.mono);
  const colorStyle = opts.mono ? ` style="color: ${opts.color ?? colors.fg};"` : "";

  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${input.width}" height="${input.height}" viewBox="0 0 ${input.width} ${input.height}">${backgroundRect}<g transform="translate(${tx.toFixed(
    3,
  )} ${ty.toFixed(3)}) scale(${scale.toFixed(6)})"${colorStyle}>${svgInner}</g></svg>\n`;
  return Buffer.from(svg, "utf8");
}

async function generateIcon(input: StubshotProviderGenerateInput): Promise<Buffer> {
  const dir = env("STUBSHOT_ICONS_DIR");
  if (!dir) {
    throw new Error(`STUBSHOT_ICONS_DIR is required for @stubshot/provider-icons (directory of .svg files).`);
  }

  const dirAbs = path.resolve(process.cwd(), dir);
  const files = await listSvgFiles(dirAbs);
  if (files.length === 0) throw new Error(`No .svg files found in STUBSHOT_ICONS_DIR: ${dirAbs}`);

  const pick = fnv1a32(`${input.seed}:${input.index}`) % files.length;
  const fileName = files[pick]!;
  const iconSvg = await fs.readFile(path.join(dirAbs, fileName), "utf8");

  const paddingRatio = parseNumber(env("STUBSHOT_ICONS_PADDING"), 0.18);
  const bgMode = parseBgMode(env("STUBSHOT_ICONS_BG"));
  const mono = env("STUBSHOT_ICONS_MONO") === "1";
  const color = env("STUBSHOT_ICONS_COLOR");

  const svgBuffer = buildSvg(input, iconSvg, fileName, { paddingRatio, bgMode, mono, color });
  const fmt = input.format.toLowerCase();
  if (fmt === "svg") return svgBuffer;

  const { default: sharp } = await import("sharp");
  const pipeline = sharp(svgBuffer, { density: 144 });
  if (fmt === "png") return pipeline.png().toBuffer();
  if (fmt === "jpg" || fmt === "jpeg") return pipeline.jpeg({ quality: 85 }).toBuffer();
  if (fmt === "webp") return pipeline.webp({ quality: 80 }).toBuffer();
  throw new Error(`Unsupported format: ${input.format}`);
}

export const provider: StubshotProvider = {
  name: "icons",
  supports: {
    formats: ["svg", "png", "jpg", "jpeg", "webp"],
    deterministic: true,
  },
  async generate(input) {
    return generateIcon(input);
  },
};

export default provider;
