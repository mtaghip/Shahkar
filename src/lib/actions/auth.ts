"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";

export interface AuthState {
  error?: string;
}

function safeNext(next: FormDataEntryValue | null): string | null {
  const s = typeof next === "string" ? next : "";
  // only allow internal, absolute paths
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  return null;
}

export async function loginAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) return {error:"Sign-in is not configured. The store owner must set AUTH_SECRET in Vercel and redeploy."};
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "Those details don't match an account." };
  }

  await createSession(user.id);
  const next = safeNext(formData.get("next"));
  redirect(next ?? (user.role === "admin" ? "/admin" : "/account"));
}

export async function registerAction(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (process.env.NODE_ENV === "production" && !process.env.AUTH_SECRET) return {error:"Account registration is temporarily unavailable."};
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "Enter your email and a password." };
  }
  if (password.length < 8) {
    return { error: "Please use a password of at least 8 characters." };
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

  await prisma.customer.upsert({where:{email},update:{},create:{email,name:name || email}});
  await createSession(user.id);
  redirect("/account");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
