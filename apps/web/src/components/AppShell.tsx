"use client";

import Link from "next/link";
import { CartIcon } from "./CartIcon";

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
    <div style={{ minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <Link href="/dashboard" style={{ fontWeight: 700, fontSize: 16 }}>Marin Froid</Link>
            <nav style={{ display: "flex", gap: 20, fontSize: 14 }}>
              <Link href="/dashboard">Accueil</Link>
              <Link href="/catalog">Catalogue</Link>
              <Link href="/orders">Commandes</Link>
              <Link href="/account">Compte</Link>
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 13, color: "var(--color-text-muted)" }}>{organizationName} · {fullName}</span>
            <Link href="/cart" aria-label="Panier"><CartIcon /></Link>
            <button
              className="btn-secondary"
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <main className="container" style={{ paddingTop: 32, paddingBottom: 64 }}>{children}</main>
    </div>
  );
}
