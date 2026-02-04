import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { generate } from "../dist/index.js";

async function withTempDir(fn) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "stubshot-generate-test-"));
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
      supports: { formats: ["svg"], deterministic: true },
      async generate(input) {
        globalThis.__stubshotCalls ??= [];
        globalThis.__stubshotCalls.push(input);
        return Buffer.from("<svg/>");
      }
    };`,
    "utf8",
  );
}

test("generate uses config file defaults and allows overrides", async () => {
  await withTempDir(async (dir) => {
    const entry = path.join(dir, "entry.js");
    await fs.writeFile(entry, "// entry\n", "utf8");

    await writeProvider(dir, "@stubshot/provider-test");

    await fs.writeFile(
      path.join(dir, "stubshot.config.json"),
      JSON.stringify({ theme: "geometric", seed: "fromfile", prefix: "fromfile" }),
      "utf8",
    );

    const prevCwd = process.cwd();
    const prevArgv1 = process.argv[1];
    process.chdir(dir);
    process.argv[1] = entry;
    try {
      globalThis.__stubshotCalls = [];
      await generate({
        provider: "@stubshot/provider-test",
        outDir: "out",
        dryRun: true,
        sizes: "10x10",
        count: 1,
        format: "svg",
      });

      assert.equal(globalThis.__stubshotCalls.length, 1);
      assert.equal(globalThis.__stubshotCalls[0].theme, "geometric");
      assert.match(globalThis.__stubshotCalls[0].seed, /^fromfile:/);

      globalThis.__stubshotCalls = [];
      await generate({
        provider: "@stubshot/provider-test",
        outDir: "out",
        dryRun: true,
        sizes: "10x10",
        count: 1,
        theme: "noise",
        seed: "fromcli",
        prefix: "fromcli",
        format: "svg",
      });

      assert.equal(globalThis.__stubshotCalls.length, 1);
      assert.equal(globalThis.__stubshotCalls[0].theme, "noise");
      assert.match(globalThis.__stubshotCalls[0].seed, /^fromcli:/);
    } finally {
      process.argv[1] = prevArgv1;
      process.chdir(prevCwd);
    }
  });
});

test("generate produces stable per-image seeds for same inputs", async () => {
  await withTempDir(async (dir) => {
    const entry = path.join(dir, "entry.js");
    await fs.writeFile(entry, "// entry\n", "utf8");
    await writeProvider(dir, "@stubshot/provider-test");

    const prevCwd = process.cwd();
    const prevArgv1 = process.argv[1];
    process.chdir(dir);
    process.argv[1] = entry;
    try {
      globalThis.__stubshotCalls = [];
      await generate({
        provider: "@stubshot/provider-test",
        outDir: "out",
        dryRun: true,
        sizes: "10x10",
        count: 2,
        startIndex: 1,
        seed: "seed",
        theme: "mesh-gradient",
        format: "svg",
        prefix: "x",
      });
      const seeds1 = globalThis.__stubshotCalls.map((c) => c.seed);

      globalThis.__stubshotCalls = [];
      await generate({
        provider: "@stubshot/provider-test",
        outDir: "out",
        dryRun: true,
        sizes: "10x10",
        count: 2,
        startIndex: 1,
        seed: "seed",
        theme: "mesh-gradient",
        format: "svg",
        prefix: "x",
      });
      const seeds2 = globalThis.__stubshotCalls.map((c) => c.seed);

      assert.deepEqual(seeds1, seeds2);
      assert.equal(seeds1.length, 2);
      assert.notEqual(seeds1[0], seeds1[1]);
    } finally {
      process.argv[1] = prevArgv1;
      process.chdir(prevCwd);
    }
  });
});

test("generate freezes provider input to enforce purity", async () => {
  await withTempDir(async (dir) => {
    const entry = path.join(dir, "entry.js");
    await fs.writeFile(entry, "// entry\n", "utf8");

    // Provider tries to mutate the input object; this should throw in strict mode (ESM).
    await writeProvider(dir, "@stubshot/provider-mutate");
    await fs.writeFile(
      path.join(dir, "node_modules", "@stubshot", "provider-mutate", "index.js"),
      `export default {
        name: "mutate",
        supports: { formats: ["svg"], deterministic: true },
        async generate(input) {
          input.theme = "mutated";
          return Buffer.from("<svg/>");
        }
      };`,
      "utf8",
    );

    const prevCwd = process.cwd();
    const prevArgv1 = process.argv[1];
    process.chdir(dir);
    process.argv[1] = entry;
    try {
      await assert.rejects(
        () =>
          generate({
            provider: "@stubshot/provider-mutate",
            outDir: "out",
            dryRun: true,
            sizes: "10x10",
            count: 1,
            format: "svg",
            prefix: "x",
            seed: "seed",
          }),
        /Some images failed to generate|read only|Cannot assign/i,
      );
    } finally {
      process.argv[1] = prevArgv1;
      process.chdir(prevCwd);
    }
  });
});
