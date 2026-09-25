// Postgres backend (production on Vercel). Same function names as db.json.js.
// Activates when DATABASE_URL is set. Tables self-create on first use.
import { Pool } from "pg";

let pool = null;
function db() {
  if (!pool) {
    const cs = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    pool = new Pool({
      connectionString: cs,
      ssl: /localhost|127\.0\.0\.1/.test(cs || "")
        ? false
        : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

let ready = null;
function init() {
  if (!ready) {
    ready = (async () => {
      const p = db();
      await p.query(`CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v JSONB NOT NULL)`);
      await p.query(`CREATE TABLE IF NOT EXISTS orders (number TEXT PRIMARY KEY, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT now())`);
      await p.query(`CREATE TABLE IF NOT EXISTS reviews (id SERIAL PRIMARY KEY, data JSONB NOT NULL, created_at TIMESTAMPTZ DEFAULT now())`);
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

async function kvGet(k, fb) {
  await init();
  const r = await db().query("SELECT v FROM kv WHERE k=$1", [k]);
  return r.rows.length ? r.rows[0].v : fb;
}
async function kvSet(k, v) {
  await init();
  await db().query("INSERT INTO kv(k,v) VALUES($1,$2) ON CONFLICT(k) DO UPDATE SET v=$2", [k, v]);
  return v;
}

export async function getOrders() {
  await init();
  const r = await db().query("SELECT data FROM orders ORDER BY created_at DESC LIMIT 500");
  return r.rows.map((x) => x.data);
}
export async function addOrder(order) {
  await init();
  await db().query("INSERT INTO orders(number,data) VALUES($1,$2) ON CONFLICT(number) DO NOTHING", [order.number, order]);
  return order;
}
export async function setOrderStatus(number, status) {
  await init();
  const r = await db().query("SELECT data FROM orders WHERE number=$1", [number]);
  if (!r.rows.length) return null;
  const o = { ...r.rows[0].data, status, updatedAt: new Date().toISOString() };
  await db().query("UPDATE orders SET data=$2 WHERE number=$1", [number, o]);
  return o;
}
export async function getOverrides() { return kvGet("product-overrides", {}); }
export async function setOverrides(next) { await kvSet("product-overrides", next); return next; }
export async function getDelivery() { return kvGet("delivery", null); }
export async function setDelivery(cfg) { await kvSet("delivery", cfg); return cfg; }
export async function getPromos() { return kvGet("promos", null); }
export async function getSetting(key) {
  const s = await kvGet("settings", {});
  return (s || {})[key] ?? null;
}
export async function setSetting(key, value) {
  const s = (await kvGet("settings", {})) || {};
  s[key] = value;
  await kvSet("settings", s);
  return value;
}
export async function getReviews() {
  await init();
  const r = await db().query("SELECT data FROM reviews ORDER BY created_at DESC LIMIT 1000");
  return r.rows.map((x) => x.data);
}
export async function addReview(rv) {
  await init();
  await db().query("INSERT INTO reviews(data) VALUES($1)", [rv]);
  return rv;
}
export async function deleteReview(id) {
  await init();
  await db().query("DELETE FROM reviews WHERE data->>'id'=$1", [id]);
  return true;
}
export async function setPromos(list) {
  await kvSet("promos", list);
  return list;
}
