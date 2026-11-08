import { VAT_RATE, vatIncluded } from "./vat";

export interface BreakdownInput {
  totalPence: number;
  shippingPence: number;
  discountPence: number;
  items: { pricePence: number; qty: number; category?: string | null }[];
}

export interface Breakdown {
  subtotalPence: number;
  discountPence: number;
  shippingPence: number;
  totalPence: number;
  /** VAT contained in the total; null when VAT isn't itemised. */
  vatPence: number | null;
  /** Part of the total sold under the margin scheme (no VAT shown). */
  marginSchemePence: number;
}

/**
 * Split an order's VAT-inclusive total for display. With the margin scheme on,
 * antique lines (after their share of any discount) carry no itemised VAT.
 */
export function orderBreakdown(
  order: BreakdownInput,
  opts: { vatRegistered: boolean; marginSchemeAntiques: boolean }
): Breakdown {
  const subtotalPence = order.totalPence - order.shippingPence + order.discountPence;
  const antiqueGross = order.items
    .filter((i) => i.category === "antique")
    .reduce((n, i) => n + i.pricePence * i.qty, 0);
  const discountShare =
    subtotalPence > 0 ? Math.round((order.discountPence * antiqueGross) / subtotalPence) : 0;
  const marginSchemePence = opts.marginSchemeAntiques ? Math.max(0, antiqueGross - discountShare) : 0;
  const vatPence = opts.vatRegistered ? vatIncluded(order.totalPence - marginSchemePence, VAT_RATE) : null;
  return {
    subtotalPence,
    discountPence: order.discountPence,
    shippingPence: order.shippingPence,
    totalPence: order.totalPence,
    vatPence,
    marginSchemePence,
  };
}
