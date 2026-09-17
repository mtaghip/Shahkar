"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
export default function SiteChrome({ children, header, footer }: { children: ReactNode; header: ReactNode; footer: ReactNode }) {
  const path = usePathname();
  if (path === "/admin" || path.startsWith("/admin/")) return <>{children}</>;
  return <div className="page"><div className="announce">Complimentary worldwide shipping &amp; 14-day home trial</div>{header}<main>{children}</main>{footer}</div>;
}
