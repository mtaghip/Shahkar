"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

const NAV = [
  { href: "/collection", label: "Collection" },
  { href: "/collection?filter=antique", label: "Antique" },
  { href: "/collection?filter=contemporary", label: "Contemporary" },
  { href: "/house", label: "House" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const { count } = useCart();
  return (
    <header className="header">
      <div className="header__inner">
        <Link href="/" className="brand" aria-label="Shahkar Carpets, home">
          <span className="brand__name">SHAHKAR</span>
          <span className="brand__sub">Carpets · est. 1974</span>
        </Link>
        <nav className="nav">
          {NAV.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header__util">
          <button type="button" className="linklike">
            Search
          </button>
          <button type="button" className="linklike">
            Bag ({count})
          </button>
        </div>
      </div>
    </header>
  );
}
