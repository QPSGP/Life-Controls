/**
 * Run Prisma CLI with DATABASE_DIRECT_URL defaulted to DATABASE_URL when unset.
 * Required because prisma/schema.prisma uses directUrl (Neon-friendly).
 */
const { spawnSync } = require("child_process");
const path = require("path");

const env = { ...process.env };
if (!(env.DATABASE_DIRECT_URL || "").trim()) {
  env.DATABASE_DIRECT_URL = (env.DATABASE_URL || "").trim();
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
