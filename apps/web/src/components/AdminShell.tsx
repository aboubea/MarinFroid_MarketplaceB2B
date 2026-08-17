"use client";

import { useState } from "react";
import Link from "next/link";
import { Sidebar } from "./Sidebar";
import { useBranding } from "./BrandingContext";
import { IconHome, IconList, IconUsers, IconPalette, IconBell, IconActivity, IconGrid, IconColumns, IconTruck, IconShield } from "./icons";

const LINKS = [
  { href: "/admin/overview", label: "Administration", icon: <IconHome /> },
  { href: "/admin/planning", label: "Planning", icon: <IconColumns /> },
  { href: "/admin/deliveries", label: "Livraisons du jour", icon: <IconTruck /> },
  { href: "/admin/orders", label: "Commandes", icon: <IconList /> },
  { href: "/admin/catalog", label: "Catalogue", icon: <IconGrid /> },
  { href: "/admin/clients", label: "Clients", icon: <IconUsers /> },
  { href: "/admin/staff", label: "Équipe Marin Froid", icon: <IconShield /> },
  { href: "/admin/notifications", label: "Emails & notifications", icon: <IconBell /> },
  { href: "/admin/activity", label: "Activité", icon: <IconActivity /> },
  { href: "/admin/branding", label: "Branding", icon: <IconPalette /> },
];

export function AdminShell({ children, fullName }: { children: React.ReactNode; fullName: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logoUrl } = useBranding();
  const homeHref = "/admin/overview";

  return (
    <div className="app-shell">
      <Sidebar links={LINKS} footerLabel="Équipe Marin Froid" homeHref={homeHref} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="app-shell-content">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {logoUrl && (
              <Link href={homeHref} className="topbar-logo-link" aria-label="Retour à l'accueil">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="Marin Froid" className="topbar-logo" />
              </Link>
            )}
            <span style={{ fontSize: 14, fontWeight: 600 }}>Back-office</span>
          </div>
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{fullName}</span>
        </header>
        <main className="container app-shell-scroll" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: "100%" }}>
          {children}
        </main>
      </div>
      <button
        type="button"
        aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
        className={`mobile-menu-fab ${mobileOpen ? "mobile-menu-fab-open" : ""}`}
        onClick={() => setMobileOpen((o) => !o)}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path className="mobile-menu-fab-bar mobile-menu-fab-bar-top" d="M4 6h16" />
          <path className="mobile-menu-fab-bar mobile-menu-fab-bar-mid" d="M4 12h16" />
          <path className="mobile-menu-fab-bar mobile-menu-fab-bar-bot" d="M4 18h16" />
        </svg>
      </button>
    </div>
  );
}
