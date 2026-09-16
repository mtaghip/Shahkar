import EnquiryForm from "@/components/EnquiryForm";

export const metadata = {
  title: "Contact — Shahkar Carpets",
  description:
    "Tell us the room and we will send you three carpets. Showroom at The Wool Barn, Stow-on-the-Wold. No charge for a home trial.",
};

const details = [
  {
    k: "Showroom",
    lines: ["The Wool Barn, Sheep Street", "Stow-on-the-Wold", "Gloucestershire GL54 1AA"],
  },
  {
    k: "Opening",
    lines: ["Tuesday–Saturday, 10–5", "Sunday & Monday by appointment"],
  },
  { k: "Telephone", lines: ["01451 830 114"] },
  { k: "Email", lines: ["hello@shahkarcarpets.co.uk"] },
  {
    k: "Trade",
    lines: ["Designers and architects: ask for the trade folio and net pricing"],
  },
];

export default function ContactPage() {
  return (
    <section
      className="wrap"
      style={{
        paddingTop: "clamp(56px,7vw,92px)",
        paddingBottom: 100,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 380px), 1fr))",
        gap: "clamp(40px,6vw,88px)",
      }}
    >
      <div>
        <div className="eyebrow" style={{ marginBottom: 24 }}>
          Contact
        </div>
        <h1
          className="serif"
          style={{
            fontSize: "clamp(32px,4vw,52px)",
            lineHeight: 1.08,
            margin: "0 0 26px",
            textWrap: "pretty",
          }}
        >
          Tell us the room and we will send you three carpets.
        </h1>
        <p
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            color: "var(--muted-2)",
            margin: "0 0 44px",
            maxWidth: "46ch",
            textWrap: "pretty",
          }}
        >
          Measurements, a photograph and a rough budget are enough to start.
          There is no charge for a home trial and no obligation to keep
          anything.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: "36px 32px",
            borderTop: "1px solid var(--line)",
            paddingTop: 36,
          }}
        >
          {details.map((d) => (
            <div key={d.k}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 10,
                }}
              >
                {d.k}
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.65 }}>
                {d.lines.map((l, i) => (
                  <span key={i}>
                    {l}
                    {i < d.lines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <EnquiryForm />
    </section>
  );
}
