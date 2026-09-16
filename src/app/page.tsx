import Link from "next/link";
import ImageSlot from "@/components/ImageSlot";
import ProductCard from "@/components/ProductCard";
import { getFeatured } from "@/lib/products";

export const dynamic = "force-dynamic";

const homeJournal = [
  {
    cat: "Craft · 8 min",
    ph: "Journal image — dye pots",
    title: "Why a madder red fades beautifully and a chrome red does not",
  },
  {
    cat: "Living with it · 5 min",
    ph: "Journal image — carpet under a dining table",
    title:
      "Put the good carpet in the kitchen. An argument for use over reverence",
  },
];

export default async function HomePage() {
  const featured = await getFeatured(3);
  return (
    <>
      {/* ============ HERO ============ */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            padding: "clamp(48px,6vw,96px) clamp(24px,4vw,64px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            maxWidth: 640,
            marginLeft: "auto",
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 28 }}>
            Three generations of weaving
          </div>
          <h1
            className="serif"
            style={{
              fontSize: "clamp(38px,5.2vw,66px)",
              lineHeight: 1.04,
              margin: "0 0 28px",
              letterSpacing: "-0.01em",
              textWrap: "pretty",
            }}
          >
            Carpets worth
            <br />
            living on.
          </h1>
          <p
            style={{
              fontSize: 17,
              lineHeight: 1.65,
              color: "var(--muted-2)",
              margin: "0 0 40px",
              maxWidth: "44ch",
              textWrap: "pretty",
            }}
          >
            Antique pieces recovered from the great weaving towns of Persia and
            Anatolia, alongside new work we commission from the families still
            knotting by hand. Each one photographed, measured and priced in
            full.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/collection" className="btn btn--solid">
              Browse the collection
            </Link>
            <Link href="/house" className="btn btn--outline">
              Our story
            </Link>
          </div>
        </div>
        <div
          style={{
            position: "relative",
            minHeight: "min(660px, 60vh)",
            borderLeft: "1px solid var(--line)",
          }}
        >
          <ImageSlot caption="Hero — a carpet in a lived-in room, shot from above" />
        </div>
      </section>

      {/* ============ TRUST BAR ============ */}
      <section
        style={{
          borderBottom: "1px solid var(--line)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
        }}
      >
        {[
          { t: "Hand-knotted, never machine-made", mid: false },
          { t: "Full provenance with every piece", mid: true },
          { t: "Showroom & viewing, Cotswolds", mid: false },
        ].map((c) => (
          <div
            key={c.t}
            style={{
              padding: "30px 32px",
              fontSize: 12,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--muted)",
              textAlign: "center",
              borderLeft: c.mid ? "1px solid var(--line)" : undefined,
              borderRight: c.mid ? "1px solid var(--line)" : undefined,
            }}
          >
            {c.t}
          </div>
        ))}
      </section>

      {/* ============ RECENTLY ACQUIRED ============ */}
      <section
        className="wrap"
        style={{ paddingTop: "clamp(56px,7vw,92px)", paddingBottom: 40 }}
      >
        <div className="section-head">
          <h2>Recently acquired</h2>
          <Link href="/collection" className="section-head__link">
            View all 148 pieces
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
            gap: 40,
          }}
        >
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ============ CATEGORY TILES ============ */}
      <section
        className="wrap"
        style={{
          paddingTop: 60,
          paddingBottom: 92,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: 40,
        }}
      >
        <CategoryTile
          href="/collection?filter=antique"
          caption="Antique — a worn Heriz corner, close crop"
          title="Antique & collectable"
          meta="1860–1940 · 62 pieces"
        />
        <CategoryTile
          href="/collection?filter=contemporary"
          caption="Contemporary — flat weave in a bright modern interior"
          title="Contemporary handmade"
          meta="Woven to order · 86 designs"
        />
      </section>

      {/* ============ THE HOUSE (dark) ============ */}
      <section style={{ background: "var(--ink)", color: "var(--on-ink)" }}>
        <div
          className="wrap"
          style={{
            paddingTop: "clamp(64px,8vw,110px)",
            paddingBottom: "clamp(64px,8vw,110px)",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
            gap: "clamp(40px,6vw,88px)",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", aspectRatio: "4/3" }}>
            <ImageSlot caption="Workshop — hands at the loom" />
          </div>
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 26,
              }}
            >
              The house
            </div>
            <h2
              className="serif"
              style={{
                fontSize: "clamp(30px,3.4vw,44px)",
                lineHeight: 1.12,
                margin: "0 0 26px",
                textWrap: "pretty",
              }}
            >
              We buy the way a collector buys, and sell the way a shop should.
            </h2>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                color: "var(--on-ink-2)",
                margin: "0 0 20px",
                maxWidth: "50ch",
                textWrap: "pretty",
              }}
            >
              My grandfather sold carpets out of a single room in Tehran. My
              father moved the business to England in 1974. I grew up under the
              pile, learning to read a knot count before I could read a balance
              sheet.
            </p>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                color: "var(--on-ink-2)",
                margin: "0 0 36px",
                maxWidth: "50ch",
                textWrap: "pretty",
              }}
            >
              What has changed with me is the room it goes in. These are not
              museum objects to be roped off. They belong in kitchens, under
              dogs, in houses with children.
            </p>
            <Link
              href="/house"
              style={{
                color: "var(--on-ink)",
                borderBottom: "1px solid #6b5e4a",
                paddingBottom: 4,
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Read more
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FROM THE JOURNAL ============ */}
      <section
        className="wrap"
        style={{
          paddingTop: "clamp(56px,7vw,92px)",
          paddingBottom: "clamp(56px,7vw,92px)",
        }}
      >
        <div className="section-head">
          <h2>From the journal</h2>
          <Link href="/journal" className="section-head__link">
            All writing
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: 40,
          }}
        >
          {homeJournal.map((j) => (
            <Link
              key={j.title}
              href="/journal"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              <ImageSlot caption={j.ph} ratio="16/10" />
              <div>
                <div
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "var(--muted)",
                    marginBottom: 10,
                  }}
                >
                  {j.cat}
                </div>
                <div
                  className="serif"
                  style={{ fontSize: 26, lineHeight: 1.25, textWrap: "pretty" }}
                >
                  {j.title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function CategoryTile({
  href,
  caption,
  title,
  meta,
}: {
  href: string;
  caption: string;
  title: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      style={{ position: "relative", aspectRatio: "3/2", display: "block" }}
    >
      <ImageSlot caption={caption} />
      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          padding: "36px 34px",
          background:
            "linear-gradient(to top, rgba(23,19,15,0.86), rgba(23,19,15,0))",
          pointerEvents: "none",
        }}
      >
        <div
          className="serif"
          style={{ fontSize: 34, color: "var(--paper)", marginBottom: 6 }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--gold-warm)",
          }}
        >
          {meta}
        </div>
      </div>
    </Link>
  );
}
