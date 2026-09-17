"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [["/admin","⌂","Home"],["/admin/orders","▤","Orders"],["/admin/products","◇","Products"],["/admin/customers","♧","Customers"],["/admin/email","✉","Email"],["/admin/settings","⚙","Settings"]];
export default function AdminNav() {
 const path = usePathname();
 return <nav aria-label="Store administration">{links.map(([href,icon,label]) => <Link key={href} href={href} aria-current={(href === "/admin" ? path === href : path.startsWith(href)) ? "page" : undefined}><span aria-hidden="true">{icon}</span>{label}</Link>)}</nav>;
}
