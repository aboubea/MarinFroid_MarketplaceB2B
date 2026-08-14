"use client";

import { Sidebar } from "./Sidebar";

const LINKS = [
  { href: "/admin", label: "Commandes à traiter" },
  { href: "/admin/orders", label: "Commandes" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/branding", label: "Branding" },
];

export function AdminShell({ children, fullName }: { children: React.ReactNode; fullName: string }) {
  return (
    <div className="app-shell">
      <Sidebar links={LINKS} footerLabel="Équipe Marin Froid" />
      <div>
        <header className="topbar">
          <span style={{ fontSize: 14, fontWeight: 600 }}>Back-office</span>
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{fullName}</span>
        </header>
        <main className="container" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
