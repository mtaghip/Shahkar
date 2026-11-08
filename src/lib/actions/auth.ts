"use server";

import { createHash, randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, hashPassword, verifyPassword } from "@/lib/auth";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { audit } from "@/lib/audit";
import { sendMail } from "@/lib/mailer";
import { siteOrigin } from "@/lib/site";

export interface AuthState {
  error?: string;
  ok?: boolean;
}

const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";
const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

function safeNext(next: FormDataEntryValue | null): string | null {
  const s = typeof next === "string" ? next : "";
  // only allow internal, absolute paths
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  return null;
}

function authDisabled(): boolean {
  return process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET;
}

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (authDisabled())
    return {
      error: "Sign-in is not configured. The store owner must set AUTH_SECRET in Vercel and redeploy.",
    };
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase()
    .slice(0, 254);
  const password = String(formData.get("password") || "").slice(0, 200);

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const ip = await clientIp();
  if (await isRateLimited([`login:ip:${ip}`], 30, 15 * 60)) return { error: TOO_MANY };
  if (await isRateLimited([`login:email:${email}`], 8, 15 * 60)) return { error: TOO_MANY };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    if (user?.role === "admin") await audit(null, "admin.login_failed", email, `ip ${ip}`);
    return { error: "Those details don't match an account." };
  }

  await createSession(user.id, user.sessionVersion);
  if (user.role === "admin") await audit(user, "admin.login", email, `ip ${ip}`);
  const next = safeNext(formData.get("next"));
  redirect(next ?? (user.role === "admin" ? "/admin" : "/account"));
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (authDisabled()) return { error: "Account registration is temporarily unavailable." };
  const name = String(formData.get("name") || "")
    .trim()
    .slice(0, 150);
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase()
    .slice(0, 254);
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and a password." };
  }
  if (password.length < 8 || password.length > 200) {
    return { error: "Please use a password of 8 to 200 characters." };
  }
  if (await isRateLimited([`register:ip:${await clientIp()}`], 5, 60 * 60)) {
    return { error: TOO_MANY };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: name || null,
      passwordHash: hashPassword(password),
      role: "customer",
    },
  });

  await prisma.customer.upsert({
    where: { email },
    update: {},
    create: { email, name: name || email },
  });
  await createSession(user.id, user.sessionVersion);
  redirect("/account");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

/**
 * Email a one-time reset link. The response is identical whether or not the
 * account exists, so the form cannot be used to discover registered emails.
 */
export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase()
    .slice(0, 254);
  if (!email) return { error: "Enter your email address." };

  const ip = await clientIp();
  if (
    (await isRateLimited([`reset:ip:${ip}`], 10, 60 * 60)) ||
    (await isRateLimited([`reset:email:${email}`], 3, 60 * 60))
  ) {
    return { error: TOO_MANY };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = randomBytes(32).toString("base64url");
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: sha256(token),
          expiresAt: new Date(Date.now() + RESET_TTL_MS),
        },
      }),
    ]);
    const link = `${await siteOrigin()}/account/reset?token=${token}`;
    await sendMail(
      user.email,
      "Reset your Shahkar Carpets password",
      `We received a request to reset your password.

Choose a new password here (the link works once and expires in one hour):
${link}

If you didn't ask for this, you can ignore this email — your password won't change.

Shahkar Carpets`
    );
    if (user.role === "admin") await audit(user, "admin.password_reset_requested", email, `ip ${ip}`);
  }
  return { ok: true };
}

/** Complete a reset: set the new password, burn the token, sign out everywhere. */
export async function resetPassword(token: string, _prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") || "");
  if (password.length < 8 || password.length > 200) {
    return { error: "Please use a password of 8 to 200 characters." };
  }
  if (await isRateLimited([`reset-complete:ip:${await clientIp()}`], 20, 60 * 60)) {
    return { error: TOO_MANY };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: sha256(String(token || "")) },
    include: { user: true },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }
  if (record.user.role === "admin" && password.length < 12) {
    return { error: "Administrator passwords must be at least 12 characters." };
  }

  const claimed = await prisma.passwordResetToken.updateMany({
    where: { id: record.id, usedAt: null },
    data: { usedAt: new Date() },
  });
  if (claimed.count !== 1) {
    return { error: "This reset link has already been used." };
  }
  await prisma.user.update({
    where: { id: record.userId },
    data: {
      passwordHash: hashPassword(password),
      sessionVersion: { increment: 1 },
    },
  });
  if (record.user.role === "admin") {
    await audit(record.user, "admin.password_reset", record.user.email);
  }
  redirect("/account/login?reset=1");
}
