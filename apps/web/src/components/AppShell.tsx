"use client";

import { Sidebar } from "./Sidebar";
import { CartIcon } from "./CartIcon";
import { NotificationBell } from "./NotificationBell";
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

  return (
    <div className="app-shell">
      <Sidebar links={links} footerLabel={organizationName} />
      <div className="app-shell-content">
        <header className="topbar">
          <span style={{ fontSize: 15, fontWeight: 650, letterSpacing: "-0.015em" }}>
            Bonjour, {fullName.split(" ")[0]}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="topbar-org" style={{ fontSize: 13.5, color: "var(--color-text-muted)", marginRight: 8 }}>
              {organizationName}
            </span>
            <Link href="/notifications" aria-label="Notifications" className="topbar-action"><NotificationBell /></Link>
            <Link href="/cart" aria-label="Panier" className="topbar-action"><CartIcon /></Link>
          </div>
        </header>
        <main className="container app-shell-scroll" style={{ paddingTop: compact ? 18 : 32, paddingBottom: compact ? 20 : 64, maxWidth: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
