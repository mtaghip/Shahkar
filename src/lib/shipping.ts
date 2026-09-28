// Shipping options. Kept as simple flat rates (pure module, no DB) so the
// storefront, checkout and Stripe all price shipping identically.

export interface ShippingRate {
  id: string;
  label: string;
  detail: string;
  pricePence: number;
}

export const SHIPPING_RATES: ShippingRate[] = [
  {
    id: "uk-standard",
    label: "UK delivery, underlay & fitting",
    detail: "Included · 5–10 working days",
    pricePence: 0,
  },
  {
    id: "uk-express",
    label: "UK express",
    detail: "1–2 working days",
    pricePence: 4500,
  },
  {
    id: "europe",
    label: "Europe",
    detail: "Tracked & insured · 5–10 working days",
    pricePence: 12000,
  },
  {
    id: "worldwide",
    label: "Rest of world",
    detail: "Tracked & insured · 7–14 working days",
    pricePence: 20000,
  },
];

export const DEFAULT_SHIPPING_ID = SHIPPING_RATES[0].id;

export function shippingRate(id: string | null | undefined): ShippingRate {
  return SHIPPING_RATES.find((r) => r.id === id) ?? SHIPPING_RATES[0];
}
