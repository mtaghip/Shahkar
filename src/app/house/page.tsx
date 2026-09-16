import ImageSlot from "@/components/ImageSlot";

export const metadata = {
  title: "The House — Shahkar Carpets",
  description:
    "Fifty years in England, three hundred on the loom. The story of Shahkar Carpets, from a single room in Tehran to a Cotswolds showroom.",
};

const stats = [
  { n: "1974", t: "The year the business arrived in England, with eleven carpets" },
  { n: "148", t: "Pieces currently held, each one seen and bought in person" },
  { n: "6", t: "Workshops we commission new work from, in Iran and Nepal" },
];

export default function HousePage() {
  return (
    <>
      <section
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "clamp(56px,7vw,92px) clamp(20px,3vw,32px) 0",
          width: "100%",
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 24 }}>
          The house
        </div>
        <h1
          className="serif"
          style={{
            fontSize: "clamp(36px,5vw,62px)",
            lineHeight: 1.06,
            margin: "0 0 40px",
            letterSpacing: "-0.01em",
            textWrap: "pretty",
          }}
        >
          Fifty years in England, three hundred on the loom.
        </h1>
      </section>

      <section
        className="wrap"
        style={{ paddingTop: 40, paddingBottom: 0 }}
      >
        <ImageSlot
          caption="Wide — the showroom, carpets stacked and rolled"
          ratio="21/9"
        />
      </section>

      <section
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "72px 32px 100px",
          width: "100%",
        }}
      >
        <div
          className="serif"
          style={{
            fontSize: 21,
            lineHeight: 1.6,
            color: "var(--ink)",
            marginBottom: 40,
            textWrap: "pretty",
          }}
        >
          Shahkar means masterpiece. It was my grandfather&rsquo;s word for the
          one carpet in a hundred he would not sell, and we have kept it as a
          standard rather than a slogan.
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
            gap: 48,
            fontSize: 16,
            lineHeight: 1.78,
            color: "var(--muted-2)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{ margin: 0, textWrap: "pretty" }}>
              The business began in Tehran in the 1940s, buying from village
              dealers who walked their stock in from Arak and Sarouk. In 1974 my
              father brought it to England with eleven carpets and no customers.
              He found them slowly, one drawing room at a time.
            </p>
            <p style={{ margin: 0, textWrap: "pretty" }}>
              We still buy the same way: in person, with a torch and a
              magnifying glass, turning the carpet over to read the back where
              the honest information is. No agents, no container lots, nothing
              bought from a photograph.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{ margin: 0, textWrap: "pretty" }}>
              What I have changed is who we talk to. A great carpet has spent its
              life being treated as an investment or an heirloom, and both of
              those words make people nervous about walking on it. They were made
              to be walked on. The wool was chosen for it.
            </p>
            <p style={{ margin: 0, textWrap: "pretty" }}>
              So we photograph everything in real rooms, publish the price, and
              send pieces out on trial. If it does not work in your hallway you
              send it back and we have lost nothing but postage.
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          borderTop: "1px solid var(--line)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div
          style={{
            maxWidth: "var(--maxw)",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
            width: "100%",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.n}
              style={{
                padding: "64px 40px",
                borderRight:
                  i < stats.length - 1 ? "1px solid var(--line)" : undefined,
              }}
            >
              <div
                className="serif"
                style={{ fontSize: 52, marginBottom: 12 }}
              >
                {s.n}
              </div>
              <div
                style={{ fontSize: 14, lineHeight: 1.6, color: "var(--muted)" }}
              >
                {s.t}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="wrap"
        style={{
          paddingTop: 92,
          paddingBottom: 92,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          gap: 40,
        }}
      >
        <ImageSlot
          caption="Portrait — the owner in the showroom"
          ratio="4/5"
        />
        <ImageSlot
          caption="Detail — hand washing or the wool store"
          ratio="4/5"
        />
      </section>
    </>
  );
}
