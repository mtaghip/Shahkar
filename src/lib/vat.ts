// UK VAT helpers. Shop prices are VAT-inclusive (consumer pricing).

export const VAT_RATE = 20;

export function vatRegistered(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_VAT_NUMBER?.trim());
}

/** Antiques sold under the second-hand margin scheme: VAT is not itemised. */
export function marginSchemeForAntiques(): boolean {
  return process.env.VAT_MARGIN_SCHEME_ANTIQUES === "true";
}

/** The VAT contained in a VAT-inclusive amount. */
export function vatIncluded(grossPence: number, ratePct = VAT_RATE): number {
  return Math.round((grossPence * ratePct) / (100 + ratePct));
}
