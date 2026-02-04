import test from "node:test";
import assert from "node:assert/strict";

import { validateConfig } from "../dist/index.js";

test("validateConfig rejects invalid count", () => {
  assert.throws(
    () =>
      validateConfig({
        provider: "local",
        outDir: "out",
        count: 0,
        theme: "mesh-gradient",
        format: "svg",
        prefix: "x",
        padding: 2,
        startIndex: 1,
        seed: "seed",
        cache: true,
        dryRun: true,
        overwrite: false,
        silent: true,
        verbose: false,
        concurrency: 1,
      }),
    /count.*positive integer/i,
  );
});

test("validateConfig accepts minimal config shape", () => {
  assert.doesNotThrow(() =>
    validateConfig({
      provider: "local",
      outDir: "out",
      count: 1,
      theme: "mesh-gradient",
      format: "svg",
      prefix: "x",
      padding: 2,
      startIndex: 1,
      seed: "seed",
      cache: true,
      dryRun: true,
      overwrite: false,
      silent: true,
      verbose: false,
      concurrency: 4,
    }),
  );
});
