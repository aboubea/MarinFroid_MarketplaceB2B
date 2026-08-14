"use client";

import { Sidebar } from "./Sidebar";
import { CartIcon } from "./CartIcon";
import Link from "next/link";

const LINKS = [
  { href: "/dashboard", label: "Tableau de bord" },
  { href: "/catalog", label: "Catalogue" },
  { href: "/orders", label: "Commandes" },
  { href: "/account", label: "Compte" },
];

export function AppShell({
  children,
  fullName,
  organizationName,
}: {
  children: React.ReactNode;
  fullName: string;
  organizationName: string;
}) {
  return (
    <div className="app-shell">
      <Sidebar links={LINKS} footerLabel={organizationName} />
      <div>
        <header className="topbar">
          <span style={{ fontSize: 14, fontWeight: 600 }}>Bonjour, {fullName.split(" ")[0]}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{organizationName}</span>
            <Link href="/cart" aria-label="Panier"><CartIcon /></Link>
          </div>
        </header>
        <main className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
