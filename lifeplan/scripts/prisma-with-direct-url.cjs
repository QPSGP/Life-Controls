/**
 * Run Prisma CLI with DATABASE_DIRECT_URL defaulted to DATABASE_URL when unset.
 * Required because prisma/schema.prisma uses directUrl (Neon-friendly).
 */
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const root = path.join(__dirname, "..");
const envPath = path.join(root, ".env");
if (fs.existsSync(envPath)) {
  require("dotenv").config({ path: envPath });
}

const env = { ...process.env };
const dbUrl = (env.DATABASE_URL || "").trim();
const directUrl = (env.DATABASE_DIRECT_URL || "").trim();
if (!directUrl && dbUrl) {
  env.DATABASE_DIRECT_URL = dbUrl;
}

const args = process.argv.slice(2);
if (!args.length) {
  console.error("Usage: node scripts/prisma-with-direct-url.cjs <prisma subcommand> [args...]");
  console.error("Example: node scripts/prisma-with-direct-url.cjs generate");
  process.exit(1);
}

const isWin = process.platform === "win32";
const r = spawnSync(isWin ? "npx.cmd" : "npx", ["prisma", ...args], {
  env,
  stdio: "inherit",
  shell: isWin,
  cwd: path.join(__dirname, ".."),
});
process.exit(r.status === null ? 1 : r.status);
