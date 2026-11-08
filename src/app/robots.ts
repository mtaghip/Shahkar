import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = await siteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/account", "/cart", "/checkout", "/order", "/api"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
