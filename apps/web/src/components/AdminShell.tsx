"use client";

import { Sidebar } from "./Sidebar";
import { IconClipboard, IconList, IconUsers, IconPalette, IconBell } from "./icons";

const LINKS = [
  { href: "/admin", label: "À traiter", icon: <IconClipboard /> },
  { href: "/admin/orders", label: "Commandes", icon: <IconList /> },
  { href: "/admin/clients", label: "Clients", icon: <IconUsers /> },
  { href: "/admin/notifications", label: "Emails & notifications", icon: <IconBell /> },
  { href: "/admin/branding", label: "Branding", icon: <IconPalette /> },
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
        <main className="container fade-up" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
