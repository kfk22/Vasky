// One-time migration: copy local .data/*.json into Postgres.
// Run AFTER setting DATABASE_URL (pasted from Vercel Storage or Neon):
//   $env:DATABASE_URL="postgres://..."; node scripts/migrate-to-pg.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  console.error("Set DATABASE_URL first.");
  process.exit(1);
}
const __dir = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dir, "..", ".data");
function read(name, fb) {
  try { return JSON.parse(fs.readFileSync(path.join(dataDir, name), "utf8")); }
  catch { return fb; }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await pool.query(`CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v JSONB NOT NULL)`);
await pool.query(`CREATE TABLE IF NOT EXISTS orders (number TEXT PRIMARY KEY, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT now())`);
await pool.query(`CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT now())`);

const orders = read("orders.json", []);
for (const o of orders) {
  await pool.query("INSERT INTO orders(number,data) VALUES($1,$2) ON CONFLICT(number) DO NOTHING", [o.number, o]);
}
console.log("orders:", orders.length);

for (const [file, key] of [["product-overrides.json", "product-overrides"], ["delivery.json", "delivery"], ["promos.json", "promos"]]) {
  const v = read(file, null);
  if (v) {
    await pool.query("INSERT INTO kv(k,v) VALUES($1,$2) ON CONFLICT(k) DO UPDATE SET v=$2", [key, v]);
    console.log("migrated:", key);
  }
}
const reviews = read("reviews.json", []);
for (const r of reviews) await pool.query("INSERT INTO reviews(data) VALUES($1)", [r]);
console.log("reviews:", reviews.length);
await pool.end();
console.log("DONE — verify in /admin, then keep .data/ as local backup.");
