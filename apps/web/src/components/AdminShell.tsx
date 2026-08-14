"use client";

import Link from "next/link";

export function AdminShell({ children, fullName }: { children: React.ReactNode; fullName: string }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid var(--color-border)", background: "var(--color-primary)" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <Link href="/admin" style={{ fontWeight: 700, fontSize: 16, color: "#fff" }}>Marin Froid — Admin</Link>
            <nav style={{ display: "flex", gap: 20, fontSize: 14 }}>
              <Link href="/admin/orders" style={{ color: "#E2E8F0" }}>Commandes</Link>
              <Link href="/admin/clients" style={{ color: "#E2E8F0" }}>Clients</Link>
              <Link href="/admin/branding" style={{ color: "#E2E8F0" }}>Branding</Link>
            </nav>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontSize: 13, color: "#CBD5E1" }}>{fullName}</span>
            <button
              className="btn-secondary"
              style={{ background: "transparent", color: "#fff", borderColor: "#334155" }}
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
