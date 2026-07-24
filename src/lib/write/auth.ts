import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const WRITE_SESSION_COOKIE = "life_write_session";
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 14; // 14 days

function getSecret() {
  const secret = process.env.LIFE_WRITE_SECRET;
  if (!secret) return null;
  return secret;
}

export function isWriteSecretConfigured() {
  return Boolean(getSecret());
}

export function verifyWritePassword(password: string) {
  const secret = getSecret();
  if (!secret) return false;

  const a = Buffer.from(password);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createWriteSessionToken() {
  const secret = getSecret();
  if (!secret) {
    throw new Error("LIFE_WRITE_SECRET is not configured.");
  }

  const exp = Date.now() + SESSION_MAX_AGE_SEC * 1000;
  const payload = `exp=${exp}`;
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyWriteSessionToken(token: string | undefined | null) {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const expMatch = /^exp=(\d+)$/.exec(payload);
  if (!expMatch) return false;
  const exp = Number(expMatch[1]);
  return Number.isFinite(exp) && Date.now() <= exp;
}

export function writeSessionCookieOptions(token: string) {
  return {
    name: WRITE_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SEC,
  };
}

export async function hasWriteSession() {
  const jar = await cookies();
  return verifyWriteSessionToken(jar.get(WRITE_SESSION_COOKIE)?.value);
}
