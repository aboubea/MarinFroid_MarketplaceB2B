"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useBranding } from "./BrandingContext";

export interface SidebarLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export function Sidebar({
  links,
  footerLabel,
  mobileOpen,
  onCloseMobile,
}: {
  links: SidebarLink[];
  footerLabel: string;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();

  const matches = links.filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`));
  const bestMatch = matches.sort((a, b) => b.href.length - a.href.length)[0];

  const { logoUrl } = useBranding();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onCloseMobile?.(); }, [pathname]);

  return (
    <>
      {mobileOpen ? <div className="sidebar-backdrop" onClick={onCloseMobile} /> : null}
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <button
          type="button"
          aria-label="Fermer le menu"
          className="sidebar-close"
          onClick={onCloseMobile}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
        <div className={`sidebar-logo ${logoUrl ? "sidebar-logo-image-mode" : ""}`}>
          {logoUrl ? (
            <div className="sidebar-logo-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Marin Froid" className="sidebar-logo-img" />
            </div>
          ) : (
            <>
              <span className="sidebar-logo-full">Marin Froid</span>
              <span className="sidebar-logo-short">MF</span>
            </>
          )}
        </div>
        <div className="sidebar-body">
          <nav className="sidebar-nav">
            {links.map((link) => {
              const isActive = link.href === bestMatch?.href;
              return (
                <Link key={link.href} href={link.href} className={`sidebar-link ${isActive ? "active" : ""}`} title={link.label}>
                  {link.icon}
                  <span className="sidebar-link-label">{link.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            <button
              className="sidebar-link"
              style={{ width: "100%", background: "transparent", border: "none", textAlign: "left" }}
              title="Déconnexion"
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
              <span className="sidebar-link-label">Déconnexion</span>
            </button>
            <div className="sidebar-link-label" style={{ fontSize: 12, color: "#8A93A6", padding: "10px 13px 0" }}>{footerLabel}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
