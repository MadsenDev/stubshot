import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const bin = path.resolve(__dirname, "..", "dist", "bin.js");

test("stubshot --help exits 0", () => {
  const result = spawnSync(process.execPath, [bin, "--help"], { encoding: "utf8" });
  assert.equal(result.status, 0);
});

test("stubshot providers exits 0", () => {
  const result = spawnSync(process.execPath, [bin, "providers"], { encoding: "utf8" });
  assert.equal(result.status, 0);
});

test("stubshot completion bash exits 0", () => {
  const result = spawnSync(process.execPath, [bin, "completion", "bash"], { encoding: "utf8" });
  assert.equal(result.status, 0);
});

test("stubshot completion zsh exits 0", () => {
  const result = spawnSync(process.execPath, [bin, "completion", "zsh"], { encoding: "utf8" });
  assert.equal(result.status, 0);
});
