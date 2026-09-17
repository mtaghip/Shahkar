import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SiteChrome from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Shahkar Carpets — Antique & contemporary handmade carpets",
  description:
    "Antique pieces recovered from the great weaving towns of Persia and Anatolia, alongside new work commissioned from families still knotting by hand. Each one photographed, measured and priced in full. Showroom in Stow-on-the-Wold.",
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
        <SiteChrome header={<Header />} footer={<Footer />}>{children}</SiteChrome>
      </body>
    </html>
  );
}
