/**
 * On Vercel/Render, DATABASE_URL is Postgres. Rewrite Prisma provider for the build.
 * Local sqlite (file:./dev.db) is left unchanged when this script is not run.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const schemaPath = resolve("prisma/schema.prisma");
const url = process.env.DATABASE_URL ?? "";
const isPostgres =
  url.startsWith("postgres://") ||
  url.startsWith("postgresql://") ||
  process.env.FORCE_POSTGRES === "1";

if (!isPostgres) {
  console.log("prepare-db: keeping sqlite provider (local)");
  process.exit(0);
}

let schema = readFileSync(schemaPath, "utf8");
if (!schema.includes('provider = "sqlite"')) {
  console.log("prepare-db: already postgres");
  process.exit(0);
}

schema = schema.replace('provider = "sqlite"', 'provider = "postgresql"');
writeFileSync(schemaPath, schema);
console.log("prepare-db: switched Prisma provider to postgresql");
