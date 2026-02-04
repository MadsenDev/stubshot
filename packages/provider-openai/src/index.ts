import type { StubshotProvider, StubshotProviderGenerateInput } from "@stubshot/core";

type OpenAIImageSize = "1024x1024" | "1024x1536" | "1536x1024";

function env(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function getApiKey(): string {
  const key = env("OPENAI_API_KEY");
  if (!key) {
    throw new Error(
      `OPENAI_API_KEY is required for @stubshot/provider-openai. Set it in your environment (never via CLI flags).`,
    );
  }
  return key;
}

function clampQuality(value: string | undefined): "low" | "medium" | "high" {
  if (!value) return "medium";
  const v = value.toLowerCase();
  if (v === "low" || v === "medium" || v === "high") return v;
  return "medium";
}

function clampBackground(value: string | undefined): "transparent" | "opaque" {
  if (!value) return "opaque";
  const v = value.toLowerCase();
  if (v === "transparent" || v === "opaque") return v;
  return "opaque";
}

function parseNonNegativeInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

export function chooseOpenAIImageSize(width: number, height: number): OpenAIImageSize {
  if (width === height) return "1024x1024";
  return width > height ? "1536x1024" : "1024x1536";
}

export function buildPrompt(input: StubshotProviderGenerateInput): string {
  const theme = input.theme.trim() || "mesh-gradient";
  const common = [
    "A clean abstract placeholder image for a software product.",
    "No text, no letters, no numbers, no logos, no watermarks, no UI screenshots.",
    "Not photorealistic; avoid people, animals, brands, and real-world scenes.",
    "High-quality, modern, simple composition.",
  ];

  const themeHints: Record<string, string> = {
    "mesh-gradient": "Smooth mesh gradients with soft color transitions.",
    geometric: "Bold geometric shapes, clean edges, layered rectangles.",
    blobs: "Organic blobby shapes, soft shadows, playful composition.",
    noise: "Subtle grain/noise texture, gentle gradients, minimalism.",
    "pattern-grid": "Repeating grid patterns, subtle variation, modern design.",
    "skeleton-ui": "Neutral skeleton placeholder blocks, subtle shimmer-like highlight (static).",
  };

  const hint = themeHints[theme] ?? `Abstract style inspired by theme "${theme}".`;

  // Seed isn't guaranteed to be honored by the model; we include it to improve reproducibility as much as possible.
  return [...common, hint, `Reference key: ${input.seed}`].join(" ");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  attempts: number,
): Promise<Response> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url, init);
      if (res.status === 429 || (res.status >= 500 && res.status <= 599)) {
        const delay = 500 * Math.pow(2, i);
        await sleep(delay);
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      const delay = 500 * Math.pow(2, i);
      await sleep(delay);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

async function generateViaOpenAI(input: StubshotProviderGenerateInput): Promise<Buffer> {
  const apiKey = getApiKey();
  const baseUrl = env("OPENAI_BASE_URL") ?? "https://api.openai.com/v1";
  const model = env("STUBSHOT_OPENAI_MODEL") ?? "gpt-image-1";
  const quality = clampQuality(env("STUBSHOT_OPENAI_QUALITY"));
  const background = clampBackground(env("STUBSHOT_OPENAI_BACKGROUND"));
  const maxImages = parseNonNegativeInt(env("STUBSHOT_OPENAI_MAX_IMAGES"));

  const fmt = input.format.toLowerCase();
  if (fmt !== "png") {
    throw new Error(`@stubshot/provider-openai currently only supports PNG output (requested: ${input.format}).`);
  }

  const calls = (globalThis as any).__stubshotOpenAiCalls as number | undefined;
  const nextCalls = (calls ?? 0) + 1;
  (globalThis as any).__stubshotOpenAiCalls = nextCalls;
  if (maxImages !== undefined && nextCalls > maxImages) {
    throw new Error(
      `OpenAI image generation blocked: STUBSHOT_OPENAI_MAX_IMAGES=${maxImages} exceeded (attempted ${nextCalls}).`,
    );
  }

  const size = chooseOpenAIImageSize(input.width, input.height);
  const prompt = buildPrompt(input);

  const body = {
    model,
    prompt,
    size,
    quality,
    background,
    output_format: "png",
  };

  const res = await fetchWithRetry(`${baseUrl.replace(/\/+$/, "")}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }, 3);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenAI Images API error (${res.status}): ${text || res.statusText}`);
  }

  const json = (await res.json()) as {
    data?: Array<{ b64_json?: string }>;
  };
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error(`OpenAI Images API response missing data[0].b64_json`);
  return Buffer.from(b64, "base64");
}

export const provider: StubshotProvider = {
  name: "openai",
  supports: {
    formats: ["png"],
    deterministic: false,
  },
  async generate(input) {
    return generateViaOpenAI(input);
  },
};

export default provider;
