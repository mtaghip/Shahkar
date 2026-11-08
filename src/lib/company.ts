// Business identity in one place. Set the NEXT_PUBLIC_* variables in Vercel to
// your real details; optional registration numbers are simply omitted until set,
// so nothing fictional is ever displayed.

const env = (key: string) => process.env[key]?.trim() || "";

export const COMPANY = {
  tradingName: env("NEXT_PUBLIC_COMPANY_NAME") || "Shahkar Carpets",
  legalName: env("NEXT_PUBLIC_COMPANY_LEGAL_NAME"), // e.g. "Shahkar Carpets Ltd"
  companyNumber: env("NEXT_PUBLIC_COMPANY_NUMBER"), // Companies House number
  vatNumber: env("NEXT_PUBLIC_VAT_NUMBER"), // e.g. "GB123456789"
  registeredOffice: env("NEXT_PUBLIC_COMPANY_ADDRESS"),
  email: env("NEXT_PUBLIC_CONTACT_EMAIL") || "hello@shahkarcarpets.co.uk",
  phone: env("NEXT_PUBLIC_CONTACT_PHONE") || "01451 830 114",
  showroom: (
    env("NEXT_PUBLIC_SHOWROOM_ADDRESS") ||
    "The Wool Barn, Sheep Street|Stow-on-the-Wold|Gloucestershire GL54 1AA"
  ).split("|"),
  instagram: env("NEXT_PUBLIC_INSTAGRAM_URL"),
} as const;

/** "Shahkar Carpets Ltd · Registered in England & Wales No. 01234567 · VAT GB…" */
export function legalLine(): string {
  const parts = [COMPANY.legalName || COMPANY.tradingName];
  if (COMPANY.companyNumber) parts.push(`Registered in England & Wales No. ${COMPANY.companyNumber}`);
  if (COMPANY.vatNumber) parts.push(`VAT ${COMPANY.vatNumber}`);
  return parts.join(" · ");
}
