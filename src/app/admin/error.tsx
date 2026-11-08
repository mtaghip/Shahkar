"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="admin-card">
      <h2>This page didn&rsquo;t load</h2>
      <p className="subtle">
        Nothing has been changed. Try again; if it persists, check the database connection in Vercel.
        {error.digest ? ` Reference: ${error.digest}` : ""}
      </p>
      <button type="button" className="btn btn--solid" onClick={() => reset()}>
        Try again
      </button>
    </section>
  );
}
