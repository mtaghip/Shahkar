import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHmac,
} from "crypto";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

const COOKIE = "shahkar_session";
const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) throw new Error("AUTH_SECRET is required in production.");
  return process.env.AUTH_SECRET || "insecure-dev-secret-change-me";
}

/* ---------- password hashing (scrypt) ---------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const test = scryptSync(password, salt, 64);
  return hashBuf.length === test.length && timingSafeEqual(hashBuf, test);
}

/* ---------- signed session token ---------- */

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function makeToken(userId: string): string {
  const exp = Date.now() + MAX_AGE_S * 1000;
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp })).toString(
    "base64url"
  );
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string): string | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  // constant-time compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { uid, exp } = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );
    if (typeof uid !== "string" || typeof exp !== "number") return null;
    if (Date.now() > exp) return null;
    return uid;
  } catch {
    return null;
  }
}

/* ---------- session cookie helpers ---------- */

export async function createSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, makeToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_S,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) return null;
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const uid = readToken(token);
  if (!uid) return null;
  return prisma.user.findUnique({ where: { id: uid } });
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/account/login?admin=1");
  return user;
}
