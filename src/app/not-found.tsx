import Link from "next/link";

export default function NotFound() {
  return (
    <section
      className="wrap"
      style={{
        paddingTop: "clamp(80px,10vw,140px)",
        paddingBottom: "clamp(80px,10vw,140px)",
        textAlign: "center",
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 20 }}>
        Not found
      </div>
      <h1
        className="serif"
        style={{
          fontSize: "clamp(34px,4.4vw,56px)",
          margin: "0 0 24px",
          letterSpacing: "-0.01em",
        }}
      >
        This piece has moved on.
      </h1>
      <p
        style={{
          fontSize: 16,
          lineHeight: 1.7,
          color: "var(--muted-2)",
          margin: "0 auto 40px",
          maxWidth: "46ch",
        }}
      >
        The page you were after isn&rsquo;t here — it may have sold, or the link
        may be old. The collection is the best place to start again.
      </p>
      <Link href="/collection" className="btn btn--solid">
        Browse the collection
      </Link>
    </section>
  );
}
