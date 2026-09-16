import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";

export const metadata = { title: "Admin — Shahkar Carpets" };
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="admin">
      <div className="admin-bar">
        <div className="admin-bar__inner wrap">
          <div className="admin-bar__brand">
            <span className="serif">Shahkar</span>
            <span>Admin</span>
          </div>
          <nav className="admin-bar__nav">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/products/new">Add product</Link>
            <Link href="/admin/orders">Orders</Link>
            <Link href="/" target="_blank">
              View shop ↗
            </Link>
          </nav>
          <div className="admin-bar__user">
            <span>{user.email}</span>
            <form action={logoutAction}>
              <button type="submit" className="linklike">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="wrap" style={{ paddingTop: 40, paddingBottom: 80 }}>
        {children}
      </div>
    </div>
  );
}
