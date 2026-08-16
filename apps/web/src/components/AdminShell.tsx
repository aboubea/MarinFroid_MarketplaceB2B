"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { useBranding } from "./BrandingContext";
import { IconHome, IconClipboard, IconList, IconUsers, IconPalette, IconBell, IconActivity, IconGrid, IconColumns, IconTruck, IconShield } from "./icons";

const ADMIN_ONLY_LINKS = [
  { href: "/admin/overview", label: "Administration", icon: <IconHome /> },
];

const SHARED_LINKS = [
  { href: "/admin", label: "Préparation", icon: <IconClipboard /> },
  { href: "/admin/planning", label: "Planning", icon: <IconColumns /> },
  { href: "/admin/deliveries", label: "Livraisons du jour", icon: <IconTruck /> },
  { href: "/admin/orders", label: "Commandes", icon: <IconList /> },
];

const ADMIN_ONLY_TAIL_LINKS = [
  { href: "/admin/catalog", label: "Catalogue", icon: <IconGrid /> },
  { href: "/admin/clients", label: "Clients", icon: <IconUsers /> },
  { href: "/admin/staff", label: "Équipe Marin Froid", icon: <IconShield /> },
  { href: "/admin/notifications", label: "Emails & notifications", icon: <IconBell /> },
  { href: "/admin/activity", label: "Activité", icon: <IconActivity /> },
  { href: "/admin/branding", label: "Branding", icon: <IconPalette /> },
];

export function AdminShell({ children, fullName, role }: { children: React.ReactNode; fullName: string; role?: string }) {
  const isAdmin = role === "mf_admin";
  const links = isAdmin
    ? [...ADMIN_ONLY_LINKS, ...SHARED_LINKS, ...ADMIN_ONLY_TAIL_LINKS]
    : SHARED_LINKS;
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logoUrl } = useBranding();

  return (
    <div className="app-shell">
      <Sidebar links={links} footerLabel="Équipe Marin Froid" mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
      <div className="app-shell-content">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button type="button" aria-label="Ouvrir le menu" className="hamburger-btn" onClick={() => setMobileOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            </button>
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Marin Froid" className="topbar-logo" />
            )}
            <span style={{ fontSize: 14, fontWeight: 600 }}>Back-office</span>
          </div>
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{fullName}</span>
        </header>
        <main className="container app-shell-scroll" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
