import "server-only";
import { prisma } from "./prisma";

/**
 * Everything we hold about one person, keyed by email (subject access /
 * data portability). Password hashes and internal tokens are never included.
 */
export async function exportPersonalData(rawEmail: string) {
  const email = rawEmail.trim().toLowerCase();
  const [user, customer, orders, enquiries, newsletter] = await Promise.all([
    prisma.user.findUnique({
      where: { email },
      select: { email: true, name: true, role: true, createdAt: true },
    }),
    prisma.customer.findUnique({
      where: { email },
      include: {
        messages: {
          select: { subject: true, body: true, status: true, createdAt: true, sentAt: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.order.findMany({
      where: { email },
      orderBy: { createdAt: "asc" },
      select: {
        reference: true,
        createdAt: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        status: true,
        fulfillmentStatus: true,
        totalPence: true,
        shippingPence: true,
        shippingMethod: true,
        trackingCarrier: true,
        trackingNumber: true,
        items: { select: { name: true, qty: true, pricePence: true } },
        returns: { select: { reason: true, status: true, createdAt: true } },
      },
    }),
    prisma.enquiry.findMany({
      where: { email },
      orderBy: { createdAt: "asc" },
      select: {
        name: true,
        email: true,
        phone: true,
        roomSize: true,
        budget: true,
        message: true,
        product: true,
        createdAt: true,
      },
    }),
    prisma.newsletterSubscriber.findUnique({
      where: { email },
      select: { email: true, consentAt: true, unsubscribedAt: true },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    subject: email,
    account: user,
    customerProfile: customer
      ? {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          marketingConsent: customer.marketingConsent,
          createdAt: customer.createdAt,
          emailsWeSentYou: customer.messages,
        }
      : null,
    orders,
    enquiries,
    newsletter,
  };
}

/**
 * Right to erasure. Removes the sign-in account, enquiries, newsletter record
 * and email history, and anonymises the customer profile. Order records are
 * kept unchanged because UK tax law requires them for six years.
 */
export async function erasePersonalData(customerId: string): Promise<string | null> {
  return prisma.$transaction(async (tx) => {
    const customer = await tx.customer.findUnique({ where: { id: customerId } });
    if (!customer) return null;
    const email = customer.email;
    await tx.emailMessage.deleteMany({ where: { customerId } });
    await tx.enquiry.deleteMany({ where: { email } });
    await tx.newsletterSubscriber.deleteMany({ where: { email } });
    await tx.user.deleteMany({ where: { email, role: { not: "admin" } } });
    await tx.customer.update({
      where: { id: customerId },
      data: {
        name: "Erased customer",
        email: `erased-${customerId}@erased.invalid`,
        phone: "",
        address: "",
        notes: "",
        tags: "",
        marketingConsent: false,
      },
    });
    return email;
  });
}
