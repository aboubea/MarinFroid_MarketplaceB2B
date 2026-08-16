"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { CartPopover } from "./CartPopover";
import { NotificationPopover } from "./NotificationPopover";
import { IconHome, IconGrid, IconList, IconUser, IconUsers, IconRefresh } from "./icons";
import Link from "next/link";

export function AppShell({
  children,
  fullName,
  organizationName,
  role,
  compact,
}: {
  children: React.ReactNode;
  fullName: string;
  organizationName: string;
  role?: string;
  compact?: boolean;
}) {
  const links = [
    { href: "/dashboard", label: "Tableau de bord", icon: <IconHome /> },
    { href: "/catalog", label: "Catalogue", icon: <IconGrid /> },
    { href: "/reachat", label: "Réachat rapide", icon: <IconRefresh size={16} /> },
    { href: "/orders", label: "Commandes", icon: <IconList /> },
    ...(role === "org_admin" ? [{ href: "/team", label: "Équipe", icon: <IconUsers /> }] : []),
    { href: "/account", label: "Compte", icon: <IconUser /> },
  ];
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar links={links} footerLabel={organizationName} mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
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
            <span style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.015em" }}>
              Bonjour, {fullName.split(" ")[0]}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="topbar-org" style={{ fontSize: 13.5, color: "var(--color-text-muted)", marginRight: 8 }}>
              {organizationName}
            </span>
            <NotificationPopover />
            <CartPopover />
          </div>
        </header>
        <main className="container app-shell-scroll" style={{ paddingTop: compact ? 18 : 32, paddingBottom: compact ? 20 : 64, maxWidth: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
