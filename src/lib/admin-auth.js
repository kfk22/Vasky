// Admin auth. Password hash in DB wins; otherwise the ADMIN_TOKEN env bootstrap.
import crypto from "crypto";
import { getSetting } from "./db.js";

function envToken() {
  return process.env.ADMIN_TOKEN || "vasky-admin-dev";
}

export function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pw, salt, 64).toString("hex");
  return salt + ":" + hash;
}

function checkHash(pw, stored) {
  try {
    const [salt, hash] = String(stored).split(":");
    const h = crypto.scryptSync(pw, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(hash));
  } catch {
    return false;
  }
}

export async function verifyAdmin(req) {
  const token = req.headers["x-admin-token"];
  if (!token) return false;
  const stored = await getSetting("admin-hash");
  if (stored) return checkHash(String(token), stored);
  return token === envToken();
}
