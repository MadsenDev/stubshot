import test from "node:test";
import assert from "node:assert/strict";

import provider, { buildPrompt, chooseOpenAIImageSize } from "../dist/index.js";

test("chooseOpenAIImageSize selects orientation-based sizes", () => {
  assert.equal(chooseOpenAIImageSize(100, 100), "1024x1024");
  assert.equal(chooseOpenAIImageSize(200, 100), "1536x1024");
  assert.equal(chooseOpenAIImageSize(100, 200), "1024x1536");
});

test("buildPrompt includes theme and seed", () => {
  const prompt = buildPrompt({
    width: 1,
    height: 1,
    seed: "seed123",
    theme: "geometric",
    index: 1,
    format: "png",
  });
  assert.match(prompt, /geometric/i);
  assert.match(prompt, /seed123/i);
});

test("provider-openai requires OPENAI_API_KEY", async () => {
  const prev = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    await assert.rejects(
      () =>
        provider.generate({
          width: 1024,
          height: 1024,
          seed: "x",
          theme: "mesh-gradient",
          index: 1,
          format: "png",
        }),
      /OPENAI_API_KEY is required/i,
    );
  } finally {
    if (prev) process.env.OPENAI_API_KEY = prev;
  }
});

test("provider-openai honors STUBSHOT_OPENAI_MAX_IMAGES guard", async () => {
  const prevKey = process.env.OPENAI_API_KEY;
  const prevMax = process.env.STUBSHOT_OPENAI_MAX_IMAGES;
  process.env.OPENAI_API_KEY = "test";
  process.env.STUBSHOT_OPENAI_MAX_IMAGES = "0";
  try {
    await assert.rejects(
      () =>
        provider.generate({
          width: 1024,
          height: 1024,
          seed: "x",
          theme: "mesh-gradient",
          index: 1,
          format: "png",
        }),
      /MAX_IMAGES=0 exceeded/i,
    );
  } finally {
    if (prevKey) process.env.OPENAI_API_KEY = prevKey;
    else delete process.env.OPENAI_API_KEY;
    if (prevMax) process.env.STUBSHOT_OPENAI_MAX_IMAGES = prevMax;
    else delete process.env.STUBSHOT_OPENAI_MAX_IMAGES;
  }
});
