# Shahkar Carpets

A luxury handmade-carpet e-commerce site for the UK market — antique &
collectable pieces alongside contemporary work woven to order. Built as a
faithful, from-scratch implementation of the [Claude Design](https://claude.ai/design)
handoff for **Shahkar Carpets** ("shahkar" is Persian for *masterpiece*).

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · plain CSS with
design tokens. No database required — the catalogue is static data, so the
site builds and runs anywhere.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm run start   # production build
```

## Design language

- **Palette** — ivory paper `#F3EFE7` and ink `#17130F`, with a single madder-red
  accent `#8E3A2B` and an antique-gold `#B9946A` on the dark sections.
- **Type** — Libre Caslon Display (headings) over Archivo (body), loaded from
  Google Fonts.
- **Detailing** — hard edges, no rounded corners, no drop shadows, generous
  margins, very large imagery. Tokens live in [`src/app/globals.css`](src/app/globals.css).

## Pages

| Route | Page |
| --- | --- |
| `/` | Home — hero, recently acquired, category tiles, house intro, journal |
| `/collection` | Browse grid with working **Everything / Antique / Contemporary** filters (`?filter=`) |
| `/product/[slug]` | Single carpet — gallery, price, specs, provenance, add-to-bag |
| `/house` | The house — heritage story and figures |
| `/journal` | Notes on wool, dye and use |
| `/contact` | Showroom details and an enquiry form |

## Structure

```
src/
├── app/                 # routes (home, collection, product, house, journal, contact)
│   ├── globals.css      # design tokens + shared styles
│   └── layout.tsx       # fonts, announcement bar, header, footer
├── components/          # Header, Footer, ProductCard, ImageSlot, forms, cart
└── lib/catalogue.ts     # carpet catalogue, specs, journal posts
```

## Images

Every photo is a labelled drop-in placeholder ([`ImageSlot`](src/components/ImageSlot.tsx))
— replace each with a real `next/image` (or a background photo) once
photography is available. The `caption` on each slot describes the intended
shot.

## Notes on scope

Prices are shown with an add-to-bag flow and a 14-day home trial, matching the
brief. The bag counter is client-side (persisted per browser); payment capture,
a real cart/checkout, and a CMS-backed catalogue are intentionally left for a
later pass. Copy (est. 1974, the Stow-on-the-Wold showroom, the
grandfather-in-Tehran story) is placeholder narrative from the design brief —
swap in the real history when ready.
