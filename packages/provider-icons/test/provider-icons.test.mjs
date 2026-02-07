import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

import provider from "../dist/index.js";

async function withTempDir(fn) {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "stubshot-icons-test-"));
  try {
    await fn(dir);
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

const ICON_A = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2 L22 22 H2 Z" fill="currentColor"/></svg>
`;

const ICON_B = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="currentColor"/></svg>
`;

test("provider-icons requires STUBSHOT_ICONS_DIR", async () => {
  const prev = process.env.STUBSHOT_ICONS_DIR;
  delete process.env.STUBSHOT_ICONS_DIR;
  try {
    await assert.rejects(
      () =>
        provider.generate({
          width: 64,
          height: 64,
          seed: "x",
          theme: "icons",
          index: 1,
          format: "svg",
        }),
      /STUBSHOT_ICONS_DIR is required/i,
    );
  } finally {
    if (prev) process.env.STUBSHOT_ICONS_DIR = prev;
  }
});

test("provider-icons is deterministic for same seed/icons dir", async () => {
  await withTempDir(async (dir) => {
    const iconsDir = path.join(dir, "icons");
    await fs.mkdir(iconsDir, { recursive: true });
    await fs.writeFile(path.join(iconsDir, "a.svg"), ICON_A, "utf8");
    await fs.writeFile(path.join(iconsDir, "b.svg"), ICON_B, "utf8");

    process.env.STUBSHOT_ICONS_DIR = iconsDir;
    process.env.STUBSHOT_ICONS_MONO = "1";
    process.env.STUBSHOT_ICONS_COLOR = "#ff00ff";

    const input = {
      width: 128,
      height: 96,
      seed: "seed",
      theme: "icons",
      index: 1,
      format: "svg",
    };

    const a = (await provider.generate(input)).toString("utf8");
    const b = (await provider.generate(input)).toString("utf8");
    assert.equal(a, b);
    assert.match(a, /<svg\b/);
    assert.match(a, /color:\s*#ff00ff/);
  });
});

test("provider-icons can render png", async () => {
  await withTempDir(async (dir) => {
    const iconsDir = path.join(dir, "icons");
    await fs.mkdir(iconsDir, { recursive: true });
    await fs.writeFile(path.join(iconsDir, "a.svg"), ICON_A, "utf8");
    process.env.STUBSHOT_ICONS_DIR = iconsDir;
    process.env.STUBSHOT_ICONS_MONO = "1";

    const png = await provider.generate({
      width: 64,
      height: 64,
      seed: "seed",
      theme: "icons",
      index: 1,
      format: "png",
    });

    assert.equal(png[0], 0x89);
    assert.equal(png[1], 0x50);
    assert.equal(png[2], 0x4e);
    assert.equal(png[3], 0x47);
  });
});
