"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { validEmail } from "@/lib/admin-validation";
import { isRateLimited, clientIp } from "@/lib/rate-limit";
import { sendMail } from "@/lib/mailer";

export interface FormState {
  error?: string;
  ok?: boolean;
}

const TOO_MANY = "You've sent a few of these already — please try again later.";
const field = (f: FormData, name: string, max: number) =>
  String(f.get(name) || "")
    .trim()
    .slice(0, max);

/** Contact-page enquiry: stored for the admin inbox and emailed to the owner. */
export async function submitEnquiry(_prev: FormState, form: FormData): Promise<FormState> {
  // Honeypot: real visitors never see or fill this field.
  if (field(form, "company", 200)) return { ok: true };

  const name = field(form, "name", 150);
  const email = field(form, "email", 254).toLowerCase();
  if (!name || !validEmail(email)) return { error: "Please give your name and a valid email address." };

  if (await isRateLimited([`enquiry:ip:${await clientIp()}`], 5, 60 * 60)) return { error: TOO_MANY };

  const enquiry = await prisma.enquiry.create({
    data: {
      name,
      email,
      phone: field(form, "phone", 80),
      roomSize: field(form, "roomSize", 100),
      budget: field(form, "budget", 60),
      message: field(form, "message", 5000),
      product: field(form, "product", 100),
    },
  });
  await prisma.customer.upsert({ where: { email }, update: {}, create: { email, name } });

  const owner = process.env.EMAIL_REPLY_TO || process.env.ADMIN_EMAIL;
  if (owner) {
    await sendMail(
      owner,
      `New enquiry from ${name}`,
      `${name} <${email}> sent an enquiry.

Room size: ${enquiry.roomSize || "—"}
Budget: ${enquiry.budget || "—"}${enquiry.product ? `\nAbout: /product/${enquiry.product}` : ""}

${enquiry.message || "(no message)"}

Reply from Admin → Inbox.`,
      `enquiry-${enquiry.id}`
    );
  }
  revalidatePath("/admin/inbox");
  return { ok: true };
}

/** Footer newsletter sign-up. Records explicit consent time. */
export async function subscribeNewsletter(_prev: FormState, form: FormData): Promise<FormState> {
  if (field(form, "company", 200)) return { ok: true };
  const email = field(form, "email", 254).toLowerCase();
  if (!validEmail(email)) return { error: "Please enter a valid email address." };
  if (await isRateLimited([`newsletter:ip:${await clientIp()}`], 10, 60 * 60)) return { error: TOO_MANY };

  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { unsubscribedAt: null, consentAt: new Date() },
    create: { email },
  });
  await prisma.customer.updateMany({ where: { email }, data: { marketingConsent: true } });
  revalidatePath("/admin/inbox");
  return { ok: true };
}

/** Newsletter opt-out. Same reply whether or not the address was subscribed. */
export async function unsubscribeNewsletter(_prev: FormState, form: FormData): Promise<FormState> {
  const email = field(form, "email", 254).toLowerCase();
  if (!validEmail(email)) return { error: "Please enter a valid email address." };
  if (await isRateLimited([`unsubscribe:ip:${await clientIp()}`], 20, 60 * 60)) return { error: TOO_MANY };
  await prisma.newsletterSubscriber.updateMany({
    where: { email, unsubscribedAt: null },
    data: { unsubscribedAt: new Date() },
  });
  await prisma.customer.updateMany({ where: { email }, data: { marketingConsent: false } });
  revalidatePath("/admin/inbox");
  return { ok: true };
}
