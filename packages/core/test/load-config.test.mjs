import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { loadConfigFile } from "../dist/lib/load-config.js";

async function withTempDir(fn) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "stubshot-core-test-"));
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

test("loadConfigFile loads stubshot.config.json", async () => {
  await withTempDir(async (dir) => {
    await fs.writeFile(
      path.join(dir, "stubshot.config.json"),
      JSON.stringify({ out: "public/placeholders", count: 3, theme: "geometric" }),
      "utf8",
    );

    const cfg = await loadConfigFile(dir);
    assert.equal(cfg.outDir, "public/placeholders");
    assert.equal(cfg.count, 3);
    assert.equal(cfg.theme, "geometric");
  });
});

test("loadConfigFile loads stubshot.config.js default export", async () => {
  await withTempDir(async (dir) => {
    await fs.writeFile(
      path.join(dir, "stubshot.config.js"),
      "export default { outDir: 'out', prefix: 'p' };\n",
      "utf8",
    );
    const cfg = await loadConfigFile(dir);
    assert.equal(cfg.outDir, "out");
    assert.equal(cfg.prefix, "p");
  });
});

