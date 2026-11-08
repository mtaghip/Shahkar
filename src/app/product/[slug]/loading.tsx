export default function ProductLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
        borderTop: "1px solid var(--line)",
        marginTop: 62,
      }}
    >
      <div className="skeleton" style={{ aspectRatio: "1/1" }} />
      <div style={{ padding: "clamp(40px,5vw,60px) clamp(24px,4vw,56px)" }}>
        <div className="skeleton" style={{ width: 140, height: 12, marginBottom: 18 }} />
        <div className="skeleton" style={{ width: "80%", height: 38, marginBottom: 16 }} />
        <div className="skeleton" style={{ width: "50%", height: 14, marginBottom: 30 }} />
        <div className="skeleton" style={{ width: 160, height: 30, marginBottom: 34 }} />
        <div className="skeleton" style={{ height: 120 }} />
      </div>
    </section>
  );
}
