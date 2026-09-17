const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format an integer number of pence as GBP, e.g. 1840000 -> "£18,400". */
export function formatPrice(pence: number, from = false): string {
  const value = gbp.format(Math.round(pence / 100));
  return from ? `from ${value}` : value;
}

/** Format with pence shown, e.g. 1840050 -> "£18,400.50". Used at checkout. */
export function formatExact(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

/** Parse a user-entered pounds string ("18,400" or "£18400.50") to pence. */
export function poundsToPence(input: string): number {
  const cleaned = input.trim().replace(/^£\s*/, "").replace(/,/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return 0;
  const pounds = Number(cleaned);
  if (!Number.isFinite(pounds) || pounds > 21474836.47) return 0;
  return Math.round(pounds * 100);
}
