import UnsubscribeForm from "@/components/UnsubscribeForm";

export const metadata = { title: "Unsubscribe — Shahkar Carpets", robots: { index: false } };

export default function UnsubscribePage() {
  return (
    <section className="wrap narrow" style={{ paddingTop: "clamp(56px,8vw,110px)", paddingBottom: "clamp(56px,8vw,110px)" }}>
      <div className="eyebrow" style={{ marginBottom: 20 }}>Newsletter</div>
      <h1 className="serif" style={{ fontSize: "clamp(30px,4vw,42px)", margin: "0 0 28px" }}>Unsubscribe</h1>
      <UnsubscribeForm />
    </section>
  );
}
