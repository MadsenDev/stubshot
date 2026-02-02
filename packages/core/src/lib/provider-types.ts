export type StubshotProviderSupports = {
  formats: Array<"png" | "jpg" | "webp" | "svg"> | string[];
  deterministic: boolean;
};

export type StubshotProviderGenerateInput = {
  width: number;
  height: number;
  seed: string;
  theme: string;
  index: number;
  format: string;
};

export type StubshotProvider = {
  name: string;
  supports: StubshotProviderSupports;
  generate(input: StubshotProviderGenerateInput): Promise<Buffer>;
};

export function isStubshotProvider(value: unknown): value is StubshotProvider {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v.name !== "string") return false;
  if (typeof v.generate !== "function") return false;
  const supports = v.supports as Record<string, unknown> | undefined;
  if (!supports || typeof supports !== "object") return false;
  const formats = (supports as Record<string, unknown>).formats;
  const deterministic = (supports as Record<string, unknown>).deterministic;
  if (!Array.isArray(formats)) return false;
  if (typeof deterministic !== "boolean") return false;
  return true;
}

