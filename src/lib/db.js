// Database front door. Local dev (no DATABASE_URL) uses file JSON;
// production (DATABASE_URL set, e.g. Vercel Postgres / Neon) uses Postgres.
// All functions are async — always `await` them.
let pg = null;
let json = null;

async function impl() {
  if (process.env.DATABASE_URL || process.env.POSTGRES_URL) {
    if (!pg) pg = await import("./db.pg.js");
    return pg;
  }
  if (!json) json = await import("./db.json.js");
  return json;
}

export async function getOrders(...a) { return (await impl()).getOrders(...a); }
export async function addOrder(...a) { return (await impl()).addOrder(...a); }
export async function setOrderStatus(...a) { return (await impl()).setOrderStatus(...a); }
export async function getOverrides(...a) { return (await impl()).getOverrides(...a); }
export async function setOverrides(...a) { return (await impl()).setOverrides(...a); }
export async function getDelivery(...a) { return (await impl()).getDelivery(...a); }
export async function setDelivery(...a) { return (await impl()).setDelivery(...a); }
export async function getPromos(...a) { return (await impl()).getPromos(...a); }
export async function getReviews(...a) { return (await impl()).getReviews(...a); }
export async function addReview(...a) { return (await impl()).addReview(...a); }
export async function deleteReview(...a) { return (await impl()).deleteReview(...a); }
export async function deleteOrder(...a) { return (await impl()).deleteOrder(...a); }
export async function setPromos(...a) { return (await impl()).setPromos(...a); }
export async function getSetting(...a) { return (await impl()).getSetting(...a); }
export async function setSetting(...a) { return (await impl()).setSetting(...a); }
