"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
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
              {link.icon}
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
          Déconnexion
        </button>
        <div style={{ fontSize: 12, color: "#8A93A6", padding: "10px 13px 0" }}>{footerLabel}</div>
      </div>
    </aside>
  );
}
