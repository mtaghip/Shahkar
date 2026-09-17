import { prisma } from "./prisma";
import type { Category } from "./catalogue";
import type { Prisma, Product } from "@prisma/client";

export type { Product };

export function getAllProducts() {
  return prisma.product.findMany({ where: { status: "ACTIVE" }, orderBy: { createdAt: "desc" } });
}

export function getByCategory(category: Category) {
  return prisma.product.findMany({
    where: { category, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
}

export function getBySlug(slug: string) {
  return prisma.product.findFirst({ where: { slug, status: "ACTIVE" } });
}

export function getById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export function getFeatured(limit = 3) {
  return prisma.product.findMany({
    where: { featured: true, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function countByCategory() {
  const [all, antique, contemporary] = await Promise.all([
    prisma.product.count({where:{status:"ACTIVE"}}),
    prisma.product.count({ where: { category: "antique",status:"ACTIVE" } }),
    prisma.product.count({ where: { category: "contemporary",status:"ACTIVE" } }),
  ]);
  return { all, antique, contemporary };
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
