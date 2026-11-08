import type { ReactNode } from "react";

export const LEGAL_UPDATED = "8 November 2026";

export default function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article
      className="wrap legal"
      style={{
        maxWidth: 760,
        paddingTop: "clamp(48px,7vw,92px)",
        paddingBottom: "clamp(56px,7vw,100px)",
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 20 }}>
        {eyebrow}
      </div>
      <h1 className="serif" style={{ fontSize: "clamp(32px,4.4vw,50px)", margin: "0 0 20px" }}>
        {title}
      </h1>
      {intro ? <p className="legal__intro">{intro}</p> : null}
      {children}
      <p className="legal__updated">Last updated {LEGAL_UPDATED}.</p>
    </article>
  );
}
