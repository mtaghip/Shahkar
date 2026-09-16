import ImageSlot from "@/components/ImageSlot";
import { POSTS } from "@/lib/catalogue";

export const metadata = {
  title: "Journal — Shahkar Carpets",
  description:
    "Notes on wool, dye and use. Written by us, mostly for people who own one carpet and want to understand it better.",
};

export default function JournalPage() {
  return (
    <>
      <section
        className="wrap"
        style={{ paddingTop: "clamp(56px,7vw,92px)", paddingBottom: 0 }}
      >
        <div className="eyebrow" style={{ marginBottom: 24 }}>
          Journal
        </div>
        <h1
          className="serif"
          style={{
            fontSize: "clamp(34px,4.4vw,56px)",
            margin: "0 0 20px",
            letterSpacing: "-0.01em",
          }}
        >
          Notes on wool, dye and use
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "var(--muted-2)",
            margin: "0 0 64px",
            maxWidth: "56ch",
            textWrap: "pretty",
          }}
        >
          Written by us, mostly for people who own one carpet and want to
          understand it better.
        </p>
      </section>

      <section
        className="wrap"
        style={{
          paddingTop: 0,
          paddingBottom: 100,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          gap: "48px 36px",
        }}
      >
        {POSTS.map((a) => (
          <article
            key={a.title}
            style={{ display: "flex", flexDirection: "column", gap: 18 }}
          >
            <ImageSlot caption={a.ph} ratio="3/2" />
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
                {a.cat}
              </div>
              <div
                className="serif"
                style={{
                  fontSize: 24,
                  lineHeight: 1.24,
                  marginBottom: 10,
                  textWrap: "pretty",
                }}
              >
                {a.title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "var(--muted)",
                  textWrap: "pretty",
                }}
              >
                {a.dek}
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
