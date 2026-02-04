import test from "node:test";
import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import provider from "../dist/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const snapshotDir = path.join(__dirname, "snapshots");

async function expectSvgSnapshot(theme) {
  const fileName = `${theme}_320x240.svg`;
  const expected = await fs.readFile(path.join(snapshotDir, fileName), "utf8");
  const actual = (await provider.generate({
    width: 320,
    height: 240,
    seed: `snapshot:${theme}:320x240`,
    theme,
    index: 1,
    format: "svg",
  })).toString("utf8");

  assert.equal(actual, expected);
}

test("local provider SVG snapshots", async () => {
  await expectSvgSnapshot("mesh-gradient");
  await expectSvgSnapshot("geometric");
  await expectSvgSnapshot("skeleton-ui");
});

