"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarLink {
  href: string;
  label: string;
}

export function Sidebar({ links, footerLabel }: { links: SidebarLink[]; footerLabel: string }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Marin Froid</div>
      <nav className="sidebar-nav">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link key={link.href} href={link.href} className={`sidebar-link ${isActive ? "active" : ""}`}>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button
          className="sidebar-link"
          style={{ width: "100%", background: "transparent", border: "none", textAlign: "left" }}
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
        >
          Déconnexion
        </button>
        <div style={{ fontSize: 12, color: "#94A3B8", padding: "8px 12px 0" }}>{footerLabel}</div>
      </div>
    </aside>
  );
}
