// Product specifications are stored as plain text, one "Label: value" per
// line, so the shop owner can edit them freely in the admin.

export interface Spec {
  k: string;
  v: string;
}

export const MAX_SPEC_LINES = 20;

export function parseSpecs(text: string | null | undefined): Spec[] {
  if (!text) return [];
  const specs: Spec[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const i = line.indexOf(":");
    if (i <= 0) continue;
    const k = line.slice(0, i).trim().slice(0, 60);
    const v = line.slice(i + 1).trim().slice(0, 200);
    if (k && v) specs.push({ k, v });
    if (specs.length >= MAX_SPEC_LINES) break;
  }
  return specs;
}

/** Normalise admin input: keep only well-formed "Label: value" lines. */
export function cleanSpecs(text: string): string {
  return parseSpecs(text)
    .map((s) => `${s.k}: ${s.v}`)
    .join("\n");
}
