import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const binPath = path.resolve(__dirname, "..", "dist", "bin.js");
const shebang = "#!/usr/bin/env node\n";

const contents = await fs.readFile(binPath, "utf8");
if (!contents.startsWith(shebang)) {
  await fs.writeFile(binPath, `${shebang}${contents.replace(/^\s*\n/, "")}`, "utf8");
}

