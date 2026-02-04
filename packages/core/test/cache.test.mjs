import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { generate } from "../dist/index.js";

async function withTempDir(fn) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "stubshot-cache-test-"));
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

async function writeProvider(dir, name) {
  const moduleDir = path.join(dir, "node_modules", ...name.split("/"));
  await fs.mkdir(moduleDir, { recursive: true });
  await fs.writeFile(
    path.join(moduleDir, "package.json"),
    JSON.stringify({ name, version: "0.0.0", type: "module", exports: "./index.js" }),
    "utf8",
  );
  await fs.writeFile(
    path.join(moduleDir, "index.js"),
    `export default {
      name: "test",
      supports: { formats: ["png"], deterministic: true },
      async generate(input) {
        globalThis.__stubshotCalls ??= [];
        globalThis.__stubshotCalls.push(input);
        // A tiny valid PNG header + IHDR chunk is overkill; for this test we just need stable bytes.
        return Buffer.from("hello:" + input.seed, "utf8");
      }
    };`,
    "utf8",
  );
}

test("disk cache skips provider.generate on cache hit", async () => {
  await withTempDir(async (dir) => {
    const entry = path.join(dir, "entry.js");
    await fs.writeFile(entry, "// entry\n", "utf8");
    await writeProvider(dir, "@stubshot/provider-test");

    const prevCwd = process.cwd();
    const prevArgv1 = process.argv[1];
    process.chdir(dir);
    process.argv[1] = entry;
    try {
      const outDir = "out";
      const cacheDir = ".cache";

      globalThis.__stubshotCalls = [];
      await generate({
        provider: "@stubshot/provider-test",
        outDir,
        sizes: "10x10",
        count: 1,
        theme: "mesh-gradient",
        format: "png",
        prefix: "x",
        seed: "seed",
        overwrite: true,
        cacheDir,
        cache: true,
      });
      assert.equal(globalThis.__stubshotCalls.length, 1);

      // Remove output but keep cache.
      await fs.rm(path.join(dir, outDir), { recursive: true, force: true });

      globalThis.__stubshotCalls = [];
      await generate({
        provider: "@stubshot/provider-test",
        outDir,
        sizes: "10x10",
        count: 1,
        theme: "mesh-gradient",
        format: "png",
        prefix: "x",
        seed: "seed",
        overwrite: true,
        cacheDir,
        cache: true,
      });
      assert.equal(globalThis.__stubshotCalls.length, 0);
    } finally {
      process.argv[1] = prevArgv1;
      process.chdir(prevCwd);
    }
  });
});

