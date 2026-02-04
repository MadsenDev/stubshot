import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import { loadProvider } from "../dist/index.js";

async function withTempDir(fn) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "stubshot-provider-test-"));
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

async function writeModule(dir, name, source) {
  const moduleDir = path.join(dir, "node_modules", ...name.split("/"));
  await fs.mkdir(moduleDir, { recursive: true });
  await fs.writeFile(
    path.join(moduleDir, "package.json"),
    JSON.stringify({ name, version: "0.0.0", type: "module", exports: "./index.js" }),
    "utf8",
  );
  await fs.writeFile(path.join(moduleDir, "index.js"), source, "utf8");
}

test("loadProvider resolves @stubshot/provider-<name> via entry-script base", async () => {
  await withTempDir(async (dir) => {
    const entry = path.join(dir, "entry.js");
    await fs.writeFile(entry, "// entry\n", "utf8");

    await writeModule(
      dir,
      "@stubshot/provider-foo",
      `export default {
        name: "foo",
        supports: { formats: ["svg"], deterministic: true },
        async generate() { return Buffer.from("ok"); }
      };`,
    );

    const prev = process.argv[1];
    process.argv[1] = entry;
    try {
      const provider = await loadProvider("foo");
      assert.equal(provider.name, "foo");
    } finally {
      process.argv[1] = prev;
    }
  });
});

