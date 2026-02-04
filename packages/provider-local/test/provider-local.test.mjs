import test from "node:test";
import assert from "node:assert/strict";

import provider from "../dist/index.js";

test("provider-local is deterministic for the same seed", async () => {
  const input = {
    width: 320,
    height: 240,
    seed: "seed:mesh-gradient:svg:320x240:1",
    theme: "mesh-gradient",
    index: 1,
    format: "svg",
  };

  const a = await provider.generate(input);
  const b = await provider.generate(input);
  assert.equal(a.toString("utf8"), b.toString("utf8"));
  assert.match(a.toString("utf8"), /<svg\b/);
});

test("provider-local changes output when seed changes", async () => {
  const a = await provider.generate({
    width: 320,
    height: 240,
    seed: "seed:mesh-gradient:svg:320x240:1",
    theme: "mesh-gradient",
    index: 1,
    format: "svg",
  });
  const b = await provider.generate({
    width: 320,
    height: 240,
    seed: "seed:mesh-gradient:svg:320x240:2",
    theme: "mesh-gradient",
    index: 2,
    format: "svg",
  });
  assert.notEqual(a.toString("utf8"), b.toString("utf8"));
});

test("provider-local rejects unsupported formats", async () => {
  await assert.rejects(
    () =>
      provider.generate({
        width: 10,
        height: 10,
        seed: "x",
        theme: "mesh-gradient",
        index: 1,
        format: "tiff",
      }),
    /unsupported format/i,
  );
});

test("provider-local can render png/jpg/webp", async () => {
  const common = {
    width: 64,
    height: 48,
    seed: "seed:mesh-gradient:svg:64x48:1",
    theme: "mesh-gradient",
    index: 1,
  };

  const png = await provider.generate({ ...common, format: "png" });
  assert.equal(png[0], 0x89);
  assert.equal(png[1], 0x50);
  assert.equal(png[2], 0x4e);
  assert.equal(png[3], 0x47);

  const jpg = await provider.generate({ ...common, format: "jpg" });
  assert.equal(jpg[0], 0xff);
  assert.equal(jpg[1], 0xd8);
  assert.equal(jpg[jpg.length - 2], 0xff);
  assert.equal(jpg[jpg.length - 1], 0xd9);

  const webp = await provider.generate({ ...common, format: "webp" });
  assert.equal(webp.toString("ascii", 0, 4), "RIFF");
  assert.equal(webp.toString("ascii", 8, 12), "WEBP");
});
