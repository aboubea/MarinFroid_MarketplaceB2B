"use client";

import { Sidebar } from "./Sidebar";
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

  return (
    <div className="app-shell">
      <Sidebar links={links} footerLabel="Équipe Marin Froid" />
      <div className="app-shell-content">
        <header className="topbar">
          <span style={{ fontSize: 14, fontWeight: 600 }}>Back-office</span>
          <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{fullName}</span>
        </header>
        <main className="container app-shell-scroll" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
