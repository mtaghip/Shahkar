import Link from "next/link";
import { notFound } from "next/navigation";
import ImageSlot from "@/components/ImageSlot";
import AddToBagButton from "@/components/AddToBagButton";
import { parseSpecs } from "@/lib/specs";
import { getBySlug } from "@/lib/products";
import { formatPrice } from "@/lib/money";
import JsonLd from "@/components/JsonLd";
import type { Metadata } from "next";
import { staticSiteOrigin } from "@/lib/site";

export const dynamic = "force-dynamic";

function summary(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + "…" : clean;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getBySlug(slug);
  if (!product) return { title: "Not found — Shahkar Carpets", robots: { index: false } };
  const title = `${product.name} — ${product.tag || "Handmade carpet"} | Shahkar Carpets`;
  const description = summary(
    `${product.meta}. ${formatPrice(product.pricePence, product.priceFrom)}. ${product.description}`
  );
  const images = product.imageIds.slice(0, 1).map((id) => ({
    url: `/api/media/${id}`,
    alt: product.imageCaption || product.name,
  }));
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title, description, images, type: "website" },
    twitter: { card: images.length ? "summary_large_image" : "summary", title, description },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getBySlug(slug);
  if (!product) notFound();

  const soldOut = product.reserved || product.stock <= 0;
  const specs = parseSpecs(product.specs);
  if (product.sku && !specs.some((s) => /^ref/i.test(s.k))) {
    specs.unshift({ k: "Reference", v: product.sku });
  }

  const origin = staticSiteOrigin();
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.sku || undefined,
    category: product.category === "antique" ? "Antique rugs" : "Handmade rugs",
    image: product.imageIds.map((id) => `${origin}/api/media/${id}`),
    brand: { "@type": "Brand", name: "Shahkar Carpets" },
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: (product.pricePence / 100).toFixed(2),
      availability: soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      itemCondition:
        product.category === "antique"
          ? "https://schema.org/UsedCondition"
          : "https://schema.org/NewCondition",
      url: `${origin}/product/${product.slug}`,
    },
  };

  return (
    <>
      <JsonLd data={productLd} />
      {/* breadcrumb */}
      <div
        className="wrap"
        style={{
          paddingTop: 22,
          paddingBottom: 22,
          fontSize: 12,
          letterSpacing: "0.1em",
          color: "var(--muted)",
        }}
      >
        <Link href="/" style={{ color: "var(--muted)" }}>
          Home
        </Link>{" "}
        &nbsp;/&nbsp;{" "}
        <Link href="/collection" style={{ color: "var(--muted)" }}>
          Collection
        </Link>{" "}
        &nbsp;/&nbsp;{" "}
        <span style={{ color: "var(--ink)" }}>{product.name}</span>
      </div>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
          borderTop: "1px solid var(--line)",
        }}
      >
        {/* images */}
        <div style={{ borderRight: "1px solid var(--line)" }}>
          <ImageSlot src={product.imageIds[0] ? "/api/media/"+product.imageIds[0] : undefined} caption={product.imageCaption || product.name} ratio="1/1">
            {soldOut ? <span className="tag-reserved">Reserved</span> : null}
          </ImageSlot>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              borderTop: "1px solid var(--line)",
            }}
          >
            {product.imageIds.slice(1).map((id,index)=><a key={id} href={"/api/media/"+id} target="_blank" rel="noreferrer"><ImageSlot src={"/api/media/"+id} caption={product.name+" — photo "+(index+2)} ratio="1/1"/></a>)}
          </div>
        </div>

        {/* info */}
        <div style={{ padding: "clamp(40px,5vw,60px) clamp(24px,4vw,56px) 80px" }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: "var(--madder)",
              marginBottom: 18,
            }}
          >
            {product.tag}
          </div>
          <h1
            className="serif"
            style={{
              fontSize: "clamp(30px,3.4vw,42px)",
              lineHeight: 1.1,
              margin: "0 0 14px",
            }}
          >
            {product.name}
          </h1>
          <div style={{ fontSize: 15, color: "var(--muted)", marginBottom: 30 }}>
            {product.meta}
          </div>
          <div className="serif" style={{ fontSize: 30, marginBottom: 8 }}>
            {formatPrice(product.pricePence, product.priceFrom)}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 34 }}>
            Includes UK delivery, underlay and fitting
          </div>

          <p
            style={{
              fontSize: 15,
              lineHeight: 1.75,
              color: "var(--muted-2)",
              margin: "0 0 34px",
              textWrap: "pretty",
            }}
          >
            {product.description}
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 40,
            }}
          >
            <AddToBagButton productId={product.id} soldOut={soldOut} />
            <Link href="/contact" className="btn btn--outline btn--block">
              Request a home trial
            </Link>
          </div>

          {specs.length > 0 && (
          <div style={{ borderTop: "1px solid var(--line)" }}>
            {specs.map((s) => (
              <div
                key={s.k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 20,
                  padding: "15px 0",
                  borderBottom: "1px solid var(--line-soft)",
                  fontSize: 13,
                }}
              >
                <span
                  style={{
                    color: "var(--muted)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontSize: 11,
                    paddingTop: 2,
                  }}
                >
                  {s.k}
                </span>
                <span style={{ textAlign: "right", maxWidth: "58%" }}>
                  {s.v}
                </span>
              </div>
            ))}
          </div>
          )}

          <div
            style={{ marginTop: 36, padding: 26, background: "var(--card-2)" }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 12,
              }}
            >
              Provenance
            </div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: "var(--muted-2)",
                margin: 0,
                textWrap: "pretty",
              }}
            >
              {product.provenance}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
