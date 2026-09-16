import Link from "next/link";
import { cartCount } from "@/lib/cart";
import { getCurrentUser } from "@/lib/auth";

const NAV = [
  { href: "/collection", label: "Collection" },
  { href: "/collection?filter=antique", label: "Antique" },
  { href: "/collection?filter=contemporary", label: "Contemporary" },
  { href: "/house", label: "House" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export default async function Header() {
  const [count, user] = await Promise.all([cartCount(), getCurrentUser()]);

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
          {user ? (
            <Link href={user.role === "admin" ? "/admin" : "/account"}>
              {user.role === "admin" ? "Admin" : "Account"}
            </Link>
          ) : (
            <Link href="/account/login">Sign in</Link>
          )}
          <Link href="/cart">Bag ({count})</Link>
        </div>
      </div>
    </header>
  );
}
