import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteChrome from "@/components/SiteChrome";
import JsonLd from "@/components/JsonLd";
import { staticSiteOrigin } from "@/lib/site";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Archivo:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
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
        <SiteChrome header={<Header />} footer={<Footer />}>{children}</SiteChrome>
      </body>
    </html>
  );
}
