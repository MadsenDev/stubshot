type StubshotProviderSupports = {
  formats: string[];
  deterministic: boolean;
};

type StubshotProviderGenerateInput = {
  width: number;
  height: number;
  seed: string;
  theme: string;
  index: number;
  format: string;
};

type StubshotProvider = {
  name: string;
  supports: StubshotProviderSupports;
  generate(input: StubshotProviderGenerateInput): Promise<Buffer>;
};

function fnv1a32(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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

function palette(rand: () => number): string[] {
  const baseHue = Math.floor(rand() * 360);
  const spread = 40 + rand() * 120;
  const colors = [];
  for (let i = 0; i < 5; i += 1) {
    const hue = baseHue + (i - 2) * (spread / 2);
    const sat = 0.55 + rand() * 0.35;
    const lit = 0.35 + rand() * 0.35;
    colors.push(hsl(hue, sat, lit));
  }
  return colors;
}

function svgHeader(width: number, height: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
}

function themeMeshGradient(input: StubshotProviderGenerateInput, rand: () => number, colors: string[]): string {
  const { width, height } = input;
  const gId = "g";
  const blurId = "b";
  const stop1 = colors[0]!;
  const stop2 = colors[4]!;

  const circles = Array.from({ length: 6 }, (_, i) => {
    const cx = Math.round(rand() * width);
    const cy = Math.round(rand() * height);
    const r = Math.round((0.25 + rand() * 0.55) * Math.min(width, height));
    const fill = colors[i % colors.length]!;
    const opacity = 0.55 + rand() * 0.35;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity.toFixed(3)}"/>`;
  }).join("");

  return [
    "<defs>",
    `<linearGradient id="${gId}" x1="0" y1="0" x2="1" y2="1">`,
    `<stop offset="0" stop-color="${stop1}"/>`,
    `<stop offset="1" stop-color="${stop2}"/>`,
    "</linearGradient>",
    `<filter id="${blurId}" x="-20%" y="-20%" width="140%" height="140%">`,
    `<feGaussianBlur stdDeviation="${(18 + rand() * 28).toFixed(2)}" />`,
    "</filter>",
    "</defs>",
    `<rect width="${width}" height="${height}" fill="url(#${gId})"/>`,
    `<g filter="url(#${blurId})">${circles}</g>`,
  ].join("");
}

function themeGeometric(input: StubshotProviderGenerateInput, rand: () => number, colors: string[]): string {
  const { width, height } = input;
  const shapes = [];
  shapes.push(`<rect width="${width}" height="${height}" fill="${colors[2]!}"/>`);

  const count = 18;
  for (let i = 0; i < count; i += 1) {
    const w = Math.round((0.08 + rand() * 0.3) * width);
    const h = Math.round((0.08 + rand() * 0.3) * height);
    const x = Math.round(rand() * (width - w));
    const y = Math.round(rand() * (height - h));
    const rot = Math.round((rand() * 80 - 40) * 10) / 10;
    const fill = colors[i % colors.length]!;
    const opacity = 0.35 + rand() * 0.45;
    shapes.push(
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.round(rand() * 18)}" fill="${fill}" opacity="${opacity.toFixed(
        3,
      )}" transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"/>`,
    );
  }
  return shapes.join("");
}

function themeNoise(input: StubshotProviderGenerateInput, rand: () => number, colors: string[]): string {
  const { width, height } = input;
  const fId = "n";
  const base = colors[1]!;
  const freq = (0.6 + rand() * 1.2).toFixed(3);
  return [
    "<defs>",
    `<filter id="${fId}">`,
    `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${Math.floor(rand() * 1_000_000)}"/>`,
    `<feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.35 0"/>`,
    "</filter>",
    "</defs>",
    `<rect width="${width}" height="${height}" fill="${base}"/>`,
    `<rect width="${width}" height="${height}" filter="url(#${fId})" />`,
  ].join("");
}

function themePatternGrid(input: StubshotProviderGenerateInput, rand: () => number, colors: string[]): string {
  const { width, height } = input;
  const cell = Math.max(12, Math.round((0.03 + rand() * 0.05) * Math.min(width, height)));
  const cols = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const bg = colors[3]!;
  const fg = colors[0]!;

  const rects = [];
  rects.push(`<rect width="${width}" height="${height}" fill="${bg}"/>`);
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      if (rand() < 0.35) continue;
      const opacity = 0.06 + rand() * 0.16;
      rects.push(
        `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" fill="${fg}" opacity="${opacity.toFixed(3)}"/>`,
      );
    }
  }
  return rects.join("");
}

function themeSkeletonUi(input: StubshotProviderGenerateInput, rand: () => number, colors: string[]): string {
  const { width, height } = input;
  const bg = colors[4]!;
  const surface = colors[2]!;
  const shimmer = colors[0]!;
  const gId = "s";

  const padding = Math.round(Math.min(width, height) * 0.06);
  const lineH = Math.max(10, Math.round(height * 0.06));
  const gap = Math.round(lineH * 0.6);
  const maxLines = Math.max(4, Math.round((height - padding * 2) / (lineH + gap)));

  const blocks = [];
  for (let i = 0; i < maxLines; i += 1) {
    const w = Math.round((0.55 + rand() * 0.4) * (width - padding * 2));
    const x = padding;
    const y = padding + i * (lineH + gap);
    blocks.push(`<rect x="${x}" y="${y}" width="${w}" height="${lineH}" rx="${Math.round(lineH / 2)}" fill="${surface}"/>`);
  }

  return [
    "<defs>",
    `<linearGradient id="${gId}" x1="0" y1="0" x2="1" y2="0">`,
    `<stop offset="0" stop-color="${surface}"/>`,
    `<stop offset="0.5" stop-color="${shimmer}" stop-opacity="0.45"/>`,
    `<stop offset="1" stop-color="${surface}"/>`,
    "</linearGradient>",
    "</defs>",
    `<rect width="${width}" height="${height}" fill="${bg}"/>`,
    blocks.join(""),
    `<rect width="${width}" height="${height}" fill="url(#${gId})" opacity="0.20"/>`,
  ].join("");
}

function themeBlobs(input: StubshotProviderGenerateInput, rand: () => number, colors: string[]): string {
  const { width, height } = input;
  const blurId = "bb";
  const blobs = Array.from({ length: 7 }, (_, i) => {
    const cx = Math.round(rand() * width);
    const cy = Math.round(rand() * height);
    const r = Math.round((0.12 + rand() * 0.25) * Math.min(width, height));
    const fill = colors[(i + 1) % colors.length]!;
    const opacity = 0.35 + rand() * 0.35;
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity.toFixed(3)}"/>`;
  }).join("");

  return [
    "<defs>",
    `<filter id="${blurId}" x="-20%" y="-20%" width="140%" height="140%">`,
    `<feGaussianBlur stdDeviation="${(10 + rand() * 22).toFixed(2)}" />`,
    "</filter>",
    "</defs>",
    `<rect width="${width}" height="${height}" fill="${colors[0]!}"/>`,
    `<g filter="url(#${blurId})">${blobs}</g>`,
  ].join("");
}

function buildSvgBody(input: StubshotProviderGenerateInput, rand: () => number): string {
  const colors = palette(rand);
  switch (input.theme) {
    case "mesh-gradient":
      return themeMeshGradient(input, rand, colors);
    case "geometric":
      return themeGeometric(input, rand, colors);
    case "noise":
      return themeNoise(input, rand, colors);
    case "pattern-grid":
      return themePatternGrid(input, rand, colors);
    case "skeleton-ui":
      return themeSkeletonUi(input, rand, colors);
    case "blobs":
      return themeBlobs(input, rand, colors);
    default:
      return themeMeshGradient({ ...input, theme: "mesh-gradient" }, rand, colors);
  }
}

async function generateSvg(input: StubshotProviderGenerateInput): Promise<Buffer> {
  const seed = fnv1a32(input.seed);
  const rand = mulberry32(seed);
  const body = buildSvgBody(input, rand);
  const svg = `${svgHeader(input.width, input.height)}${body}</svg>\n`;
  return Buffer.from(svg, "utf8");
}

export const provider: StubshotProvider = {
  name: "local",
  supports: {
    formats: ["svg", "png", "jpg", "jpeg", "webp"],
    deterministic: true,
  },
  async generate(input) {
    const fmt = input.format.toLowerCase();
    const svgBuffer = await generateSvg(input);
    if (fmt === "svg") return svgBuffer;

    // Raster formats are rendered from the deterministic SVG.
    // sharp is intentionally only imported when needed.
    const { default: sharp } = await import("sharp");
    const pipeline = sharp(svgBuffer, { density: 144 });

    if (fmt === "png") return pipeline.png().toBuffer();
    if (fmt === "jpg" || fmt === "jpeg") return pipeline.jpeg({ quality: 85 }).toBuffer();
    if (fmt === "webp") return pipeline.webp({ quality: 80 }).toBuffer();

    throw new Error(`Unsupported format: ${input.format}`);
  },
};

export default provider;
