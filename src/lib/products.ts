import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "./prisma";
import type { Category } from "./catalogue";
import type { Prisma, Product } from "@prisma/client";

export type { Product };

export const PRODUCTS_TAG = "products";
const TTL = 300; // seconds; mutations invalidate the tag immediately anyway

// unstable_cache serialises results to JSON, so Date fields come back as
// strings. Revive them so callers always get real Dates.
function revive<T extends Product | null>(p: T): T {
  if (!p) return p;
  return {
    ...p,
    createdAt: new Date(p.createdAt),
    updatedAt: new Date(p.updatedAt),
  };
}

const cachedAll = unstable_cache(
  () => prisma.product.findMany({ where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } }),
  ["products:all"],
  { tags: [PRODUCTS_TAG], revalidate: TTL }
);
const cachedByCategory = unstable_cache(
  (category: Category) =>
    prisma.product.findMany({
      where: { category, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
  ["products:category"],
  { tags: [PRODUCTS_TAG], revalidate: TTL }
);
const cachedBySlug = unstable_cache(
  (slug: string) => prisma.product.findFirst({ where: { slug, status: "ACTIVE" } }),
  ["products:slug"],
  { tags: [PRODUCTS_TAG], revalidate: TTL }
);
const cachedFeatured = unstable_cache(
  (limit: number) =>
    prisma.product.findMany({
      where: { featured: true, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
  ["products:featured"],
  { tags: [PRODUCTS_TAG], revalidate: TTL }
);
const cachedCounts = unstable_cache(
  async () => {
    const [all, antique, contemporary] = await Promise.all([
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.product.count({ where: { category: "antique", status: "ACTIVE" } }),
      prisma.product.count({ where: { category: "contemporary", status: "ACTIVE" } }),
    ]);
    return { all, antique, contemporary };
  },
  ["products:counts"],
  { tags: [PRODUCTS_TAG], revalidate: TTL }
);

export async function getAllProducts() {
  return (await cachedAll()).map(revive);
}

export async function getByCategory(category: Category) {
  return (await cachedByCategory(category)).map(revive);
}

export async function getBySlug(slug: string) {
  return revive(await cachedBySlug(slug));
}

/** Uncached — admin screens must always see the live row. */
export function getById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function getFeatured(limit = 3) {
  return (await cachedFeatured(limit)).map(revive);
}

export function countByCategory() {
  return cachedCounts();
}

/** Call after any change to products or stock. */
export function invalidateProducts() {
  revalidateTag(PRODUCTS_TAG);
}

export function createProduct(data: Prisma.ProductCreateInput) {
  return prisma.product.create({ data });
}

export function updateProduct(id: string, data: Prisma.ProductUpdateInput) {
  return prisma.product.update({ where: { id }, data });
}

export function deleteProduct(id: string) {
  return prisma.product.delete({ where: { id } });
}

/** Turn a title into a URL-safe, unique-ish slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
