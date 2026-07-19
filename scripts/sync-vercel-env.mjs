import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const sourcePath = process.argv[2] ?? ".env";
const target = process.argv[3] ?? "production";
const requestedKeys = process.argv.slice(4);
if (!requestedKeys.length) throw new Error("Pass one or more environment variable names to sync.");

const values = new Map();
for (const line of readFileSync(sourcePath, "utf8").split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (!match) continue;
  let value = match[2];
  if (value.startsWith('"') && value.endsWith('"')) value = JSON.parse(value);
  values.set(match[1], value);
}

for (const key of requestedKeys) {
  const value = values.get(key);
  if (!value) throw new Error(`${key} is missing or empty in ${sourcePath}.`);
  const executable = process.platform === "win32" ? "vercel.cmd" : "vercel";
  spawnSync(executable, ["env", "rm", key, target, "--yes"], {
    cwd: process.cwd(),
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const result = spawnSync(executable, ["env", "add", key, target, "--sensitive"], {
    cwd: process.cwd(),
    input: value,
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: ["pipe", "pipe", "pipe"],
  });
  if (result.status !== 0) throw new Error(`${key} could not be synchronized: ${(result.stderr || result.stdout).trim()}`);
  console.log(`${key}: synchronized`);
}
