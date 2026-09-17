import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import AdminNav from "@/components/AdminNav";
import "./admin.css";
export const metadata = { title: "Admin — Shahkar Carpets", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
 const user = await requireAdmin();
 return <div className="workspace">
  <header className="workspace-top"><Link href="/admin" className="workspace-brand">shahkar<span>STORE ADMIN</span></Link><div className="workspace-user"><span>{user.email}</span><form action={logoutAction}><button>Sign out</button></form></div></header>
  <div className="workspace-body"><aside className="workspace-sidebar"><div className="store-label"><span>S</span><div>Shahkar Carpets<small>Your store workspace</small></div></div><AdminNav/><div className="sidebar-bottom"><small>SALES CHANNEL</small><Link href="/" target="_blank">Online store ↗</Link></div></aside>
  <main className="workspace-main">{children}</main></div>
 </div>;
}
