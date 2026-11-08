"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section
      className="wrap narrow"
      style={{ paddingTop: "clamp(64px,9vw,120px)", paddingBottom: "clamp(64px,9vw,120px)", textAlign: "center" }}
    >
      <div className="eyebrow" style={{ marginBottom: 18 }}>Something went wrong</div>
      <h1 className="serif" style={{ fontSize: "clamp(30px,4vw,44px)", margin: "0 0 16px" }}>
        We couldn&rsquo;t load this page.
      </h1>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--muted-2)", margin: "0 auto 32px", maxWidth: "44ch" }}>
        It&rsquo;s usually momentary. Please try again — if it keeps happening, call
        or email us and we&rsquo;ll help directly.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <button type="button" className="btn btn--solid" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/" className="btn btn--outline">Back to the homepage</Link>
      </div>
      {error.digest ? (
        <p style={{ marginTop: 28, fontSize: 12, color: "var(--muted)" }}>Reference: {error.digest}</p>
      ) : null}
    </section>
  );
}
