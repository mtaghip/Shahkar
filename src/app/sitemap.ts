import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = await siteOrigin();
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
  const pages = [
    { path: "/", priority: 1 },
    { path: "/collection", priority: 0.9 },
    { path: "/collection?filter=antique", priority: 0.8 },
    { path: "/collection?filter=contemporary", priority: 0.8 },
    { path: "/house", priority: 0.5 },
    { path: "/journal", priority: 0.5 },
    { path: "/contact", priority: 0.5 },
    { path: "/terms", priority: 0.2 },
    { path: "/privacy", priority: 0.2 },
    { path: "/cookies", priority: 0.2 },
  ];
  return [
    ...pages.map((p) => ({ url: origin + p.path, priority: p.priority })),
    ...products.map((p) => ({
      url: `${origin}/product/${p.slug}`,
      lastModified: p.updatedAt,
      priority: 0.7,
    })),
  ];
}
