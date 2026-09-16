import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";
import { SEED_PRODUCTS } from "../src/lib/catalogue";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  // ---- admin user ----
  const email = process.env.ADMIN_EMAIL || "admin@shahkarcarpets.co.uk";
  const password = process.env.ADMIN_PASSWORD || "shahkar-admin";

  await prisma.user.upsert({
    where: { email },
    update: { role: "admin" },
    create: {
      email,
      name: "Shahkar Admin",
      role: "admin",
      passwordHash: hashPassword(password),
    },
  });
  console.log(`✓ Admin user ready: ${email}  (password: ${password})`);

  // ---- products ----
  // Only seed the catalogue when it's empty, so re-running the seed (e.g. on
  // every Vercel deploy) never clobbers products the shop owner has edited.
  const existingProducts = await prisma.product.count();
  if (existingProducts > 0) {
    console.log(`• ${existingProducts} products already present — skipping catalogue seed`);
    return;
  }

  for (const p of SEED_PRODUCTS) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        tag: p.tag,
        meta: p.meta,
        pricePence: p.pricePence,
        priceFrom: p.priceFrom ?? false,
        category: p.category,
        description: p.description,
        provenance: p.provenance,
        imageCaption: p.imageCaption,
        reserved: p.reserved ?? false,
        featured: p.featured ?? false,
        stock: p.stock ?? 1,
      },
      create: {
        slug: p.slug,
        name: p.name,
        tag: p.tag,
        meta: p.meta,
        pricePence: p.pricePence,
        priceFrom: p.priceFrom ?? false,
        category: p.category,
        description: p.description,
        provenance: p.provenance,
        imageCaption: p.imageCaption,
        reserved: p.reserved ?? false,
        featured: p.featured ?? false,
        stock: p.stock ?? 1,
      },
    });
  }
  console.log(`✓ Seeded ${SEED_PRODUCTS.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
