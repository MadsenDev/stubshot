#!/usr/bin/env node

import { main } from "./cli.js";

try {
  await main(process.argv);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error(message);
  process.exitCode = 1;
}
