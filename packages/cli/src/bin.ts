#!/usr/bin/env node

import { main } from "./cli.js";

try {
  await main(process.argv);
} catch (err) {
  const verbose = process.argv.includes("--verbose");
  const message = err instanceof Error ? err.message : String(err);
  console.error(`stubshot: error: ${message}`);
  if (verbose && err instanceof Error && err.stack) {
    console.error(err.stack);
  }
  process.exitCode = 1;
}
