import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { CATALOGUE, COLLECTION_COPY, type Category } from "@/lib/catalogue";

const FILTERS: { id: "all" | Category; label: string; href: string }[] = [
  { id: "all", label: "Everything", href: "/collection" },
  { id: "antique", label: "Antique", href: "/collection?filter=antique" },
  {
    id: "contemporary",
    label: "Contemporary",
    href: "/collection?filter=contemporary",
  },
];

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter: raw } = await searchParams;
  const filter: "all" | Category =
    raw === "antique" || raw === "contemporary" ? raw : "all";

  const copy = COLLECTION_COPY[filter];
  const shown =
    filter === "all"
      ? CATALOGUE
      : CATALOGUE.filter((c) => c.cat === filter);

  return (
    <>
      <section
        className="wrap"
        style={{ paddingTop: "clamp(48px,6vw,72px)", paddingBottom: 0 }}
      >
        <div className="eyebrow" style={{ marginBottom: 22 }}>
          {copy.eyebrow}
        </div>
        <h1
          className="serif"
          style={{
            fontSize: "clamp(34px,4.4vw,56px)",
            margin: "0 0 20px",
            letterSpacing: "-0.01em",
          }}
        >
          {copy.title}
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "var(--muted-2)",
            margin: "0 0 52px",
            maxWidth: "58ch",
            textWrap: "pretty",
          }}
        >
          {copy.blurb}
        </p>
      </section>

      {/* filter bar */}
      <div
        style={{
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div
          className="wrap"
          style={{
            paddingTop: 18,
            paddingBottom: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 28,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {FILTERS.map((f) => {
              const active = f.id === filter;
              return (
                <Link
                  key={f.id}
                  href={f.href}
                  className="filter-tab"
                  data-active={active}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>
          <div
            style={{
              fontSize: 12,
              letterSpacing: "0.1em",
              color: "var(--muted)",
            }}
          >
            {shown.length} pieces
          </div>
        </div>
      </div>

      <section
        className="wrap"
        style={{ paddingTop: 56, paddingBottom: 100 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: "44px 36px",
          }}
        >
          {shown.map((c) => (
            <ProductCard key={c.id} carpet={c} />
          ))}
        </div>
      </section>
    </>
  );
}
