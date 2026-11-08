"use client";

// Last-resort boundary for errors in the root layout itself.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en-GB">
      <body style={{ fontFamily: "Georgia, serif", background: "#f3efe7", color: "#17130f", padding: "80px 24px", textAlign: "center" }}>
        <h1 style={{ fontWeight: 400 }}>Shahkar Carpets is briefly unavailable.</h1>
        <p>Please try again in a moment.</p>
        <button type="button" onClick={() => reset()} style={{ padding: "12px 24px", marginTop: 16 }}>
          Try again
        </button>
      </body>
    </html>
  );
}
