import type { Metadata } from "next";
import { Libre_Caslon_Display, Archivo } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteChrome from "@/components/SiteChrome";
import JsonLd from "@/components/JsonLd";
import { staticSiteOrigin } from "@/lib/site";

// Self-hosted at build time: no request to Google from visitors' browsers and
// no flash of unstyled text.
const display = Libre_Caslon_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--nf-display",
  display: "swap",
});
const body = Archivo({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--nf-body",
  display: "swap",
});

const SITE_DESCRIPTION =
  "Antique pieces recovered from the great weaving towns of Persia and Anatolia, alongside new work commissioned from families still knotting by hand. Each one photographed, measured and priced in full. Showroom in Stow-on-the-Wold.";

export const metadata: Metadata = {
  metadataBase: new URL(staticSiteOrigin()),
  title: "Shahkar Carpets — Antique & contemporary handmade carpets",
  openGraph: {
    type: "website",
    siteName: "Shahkar Carpets",
    locale: "en_GB",
    title: "Shahkar Carpets — Antique & contemporary handmade carpets",
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable}`}>
      <body>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Store",
            name: "Shahkar Carpets",
            url: staticSiteOrigin(),
            description: SITE_DESCRIPTION,
            priceRange: "££££",
          }}
        />
        <SiteChrome header={<Header />} footer={<Footer />}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
