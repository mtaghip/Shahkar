export default function Loading() {
  return (
    <section
      className="wrap"
      aria-busy="true"
      aria-label="Loading"
      style={{ paddingTop: 56, paddingBottom: 100 }}
    >
      <div className="skeleton" style={{ width: 160, height: 12, marginBottom: 22 }} />
      <div className="skeleton" style={{ width: "min(520px, 80%)", height: 40, marginBottom: 48 }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
          gap: "44px 36px",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton" style={{ aspectRatio: "4/5", marginBottom: 16 }} />
            <div className="skeleton" style={{ width: "70%", height: 16, marginBottom: 8 }} />
            <div className="skeleton" style={{ width: "40%", height: 12 }} />
          </div>
        ))}
      </div>
    </section>
  );
}
