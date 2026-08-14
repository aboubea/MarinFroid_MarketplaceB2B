"use client";

import { useEffect, useState } from "react";

interface Member {
  id: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  org_admin: "Administrateur",
  org_buyer: "Acheteur",
  org_viewer: "Utilisateur secondaire (lecture)",
};

export function TeamManager({ currentUserId }: { currentUserId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"org_buyer" | "org_viewer">("org_buyer");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  useEffect(() => {
    fetch("/api/team/users").then((r) => r.json()).then((d) => setMembers(d.users ?? []));
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setStatus("idle");
    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    setSending(false);
    setStatus(res.ok ? "sent" : "error");
    if (res.ok) setEmail("");
  }

  async function toggleActive(id: string, active: boolean) {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, active } : m)));
    await fetch(`/api/team/users/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
  }

  return (
    <div>
      <div className="card" style={{ overflow: "hidden", marginBottom: 24 }}>
        {members.map((m, idx) => (
          <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: idx < members.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.fullName}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{m.email} · {ROLE_LABELS[m.role] ?? m.role}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className={`badge ${m.active ? "badge-completed" : "badge-cancelled"}`}>{m.active ? "actif" : "désactivé"}</span>
              {m.id !== currentUserId && m.role !== "org_admin" && (
                <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => toggleActive(m.id, !m.active)}>
                  {m.active ? "Désactiver" : "Réactiver"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 15, marginBottom: 12 }}>Inviter un collaborateur</h2>
      <form onSubmit={handleInvite} className="card" style={{ padding: 18, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input className="input" style={{ flex: 1, minWidth: 200 }} type="email" placeholder="email@societe.fr" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <select className="input" style={{ width: "auto" }} value={role} onChange={(e) => setRole(e.target.value as "org_buyer" | "org_viewer")}>
          <option value="org_buyer">Acheteur</option>
          <option value="org_viewer">Utilisateur secondaire (lecture)</option>
        </select>
        <button className="btn-primary" type="submit" disabled={sending}>{sending ? "Envoi..." : "Inviter"}</button>
      </form>
      {status === "sent" && <p style={{ color: "var(--color-success)", fontSize: 13, marginTop: 8 }}>Invitation envoyée.</p>}
      {status === "error" && <p style={{ color: "var(--color-danger)", fontSize: 13, marginTop: 8 }}>Erreur lors de l'envoi.</p>}
    </div>
  );
}
