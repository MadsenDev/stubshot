export function parseSizes(value: string): Array<{ width: number; height: number }> {
  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) throw new Error(`Invalid --sizes: ${value}`);

  return parts.map((part) => {
    const match = part.match(/^(\d+)\s*[xX]\s*(\d+)$/);
    if (!match) throw new Error(`Invalid size "${part}" (expected WxH like 1200x800)`);
    const width = Number.parseInt(match[1]!, 10);
    const height = Number.parseInt(match[2]!, 10);
    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
      throw new Error(`Invalid size "${part}" (width/height must be positive integers)`);
    }
    return { width, height };
  });
}

export function parseAspectRatio(value: string): number {
  const trimmed = value.trim();
  const colon = trimmed.match(/^(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)$/);
  if (colon) {
    const w = Number.parseFloat(colon[1]!);
    const h = Number.parseFloat(colon[2]!);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) {
      throw new Error(`Invalid --aspect: ${value}`);
    }
    return w / h;
  }

  const ratio = Number.parseFloat(trimmed);
  if (!Number.isFinite(ratio) || ratio <= 0) throw new Error(`Invalid --aspect: ${value}`);
  return ratio;
}

