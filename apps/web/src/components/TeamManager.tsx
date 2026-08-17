"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";
import { ListSkeleton } from "./Skeleton";
import { Avatar } from "./Avatar";
import { EmptyState } from "./EmptyState";
import { IconPower, IconSearch, IconUserPlus } from "./icons";

interface Member {
  id: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
  permissions: { canOrder: boolean; canManageUsers: boolean; receivesOrderEmails: boolean };
}

const ROLE_LABELS: Record<string, string> = {
  org_admin: "Administrateur",
  org_buyer: "Acheteur",
  org_viewer: "Lecture / administratif",
};

export function TeamManager({ currentUserId }: { currentUserId: string }) {
  const toast = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"org_buyer" | "org_viewer">("org_buyer");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    safeFetch<{ users: Member[] }>("/api/team/users").then((result) => {
      setLoading(false);
      if (result.ok && result.data) {
        setMembers(result.data.users ?? []);
      } else {
        toast.show(result.error ?? "Impossible de charger l'équipe.", "error");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.fullName.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  }, [members, query]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const result = await safeFetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    setSending(false);
    if (result.ok) {
      setEmail("");
      setShowInvite(false);
      toast.show("Invitation envoyée.", "success");
    } else {
      toast.show(result.error ?? "Erreur lors de l'envoi de l'invitation.", "error");
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const previous = members;
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, active } : m)));
    const result = await safeFetch(`/api/team/users/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (!result.ok) {
      setMembers(previous);
      toast.show(result.error ?? "Impossible de mettre à jour cet utilisateur.", "error");
    } else {
      toast.show(active ? "Utilisateur réactivé." : "Utilisateur désactivé.", "success");
    }
  }

  async function togglePermission(id: string, key: "canOrder" | "receivesOrderEmails", value: boolean) {
    const previous = members;
    const target = members.find((m) => m.id === id);
    if (!target) return;
    const nextPermissions = { ...target.permissions, [key]: value };
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, permissions: nextPermissions } : m)));
    const result = await safeFetch(`/api/team/users/${id}/permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canOrder: nextPermissions.canOrder, receivesOrderEmails: nextPermissions.receivesOrderEmails }),
    });
    if (!result.ok) {
      setMembers(previous);
      toast.show(result.error ?? "Impossible de mettre à jour les permissions.", "error");
    } else {
      toast.show("Permissions mises à jour.", "success");
    }
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 220, maxWidth: 320 }}>
          <IconSearch />
          <input className="input" placeholder="Rechercher un membre..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }} onClick={() => setShowInvite((v) => !v)}>
          <IconUserPlus /> Inviter un collaborateur
        </button>
      </div>

      {showInvite && (
        <form onSubmit={handleInvite} className="card fade-up" style={{ padding: 18, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
          <input className="input" style={{ flex: 1, minWidth: 200 }} type="email" autoComplete="email" placeholder="email@societe.fr" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <select className="input" style={{ width: "auto" }} value={role} onChange={(e) => setRole(e.target.value as "org_buyer" | "org_viewer")}>
            <option value="org_buyer">Acheteur</option>
            <option value="org_viewer">Lecture / administratif</option>
          </select>
          <button className="btn-primary" type="submit" disabled={sending}>{sending ? "Envoi..." : "Envoyer l'invitation"}</button>
          <button className="btn-secondary" type="button" onClick={() => setShowInvite(false)}>Annuler</button>
        </form>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20 }}><ListSkeleton rows={4} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState illustration="users" title="Aucun membre" description="Invitez un collaborateur pour qu'il accède au portail." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Peut commander</th>
                  <th>Reçoit les emails</th>
                  <th>Statut</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={m.fullName} />
                        <span style={{ fontWeight: 600 }}>{m.fullName}</span>
                      </div>
                    </td>
                    <td style={{ color: "var(--color-text-muted)" }}>{m.email}</td>
                    <td>{ROLE_LABELS[m.role] ?? m.role}</td>
                    <td>
                      {m.role === "org_admin" ? (
                        <span style={{ fontSize: 12, color: "var(--color-text-faint)" }}>Oui</span>
                      ) : (
                        <input
                          type="checkbox"
                          checked={m.permissions.canOrder}
                          onChange={(e) => togglePermission(m.id, "canOrder", e.target.checked)}
                        />
                      )}
                    </td>
                    <td>
                      {m.role === "org_admin" ? (
                        <span style={{ fontSize: 12, color: "var(--color-text-faint)" }}>Oui</span>
                      ) : (
                        <input
                          type="checkbox"
                          checked={m.permissions.receivesOrderEmails}
                          onChange={(e) => togglePermission(m.id, "receivesOrderEmails", e.target.checked)}
                        />
                      )}
                    </td>
                    <td>
                      <span className={`status-dot ${m.active ? "on" : "off"}`}>{m.active ? "Actif" : "Désactivé"}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {m.id !== currentUserId && m.role !== "org_admin" ? (
                        <button
                          className="icon-btn danger"
                          title={m.active ? "Désactiver" : "Réactiver"}
                          onClick={() => toggleActive(m.id, !m.active)}
                        >
                          <IconPower />
                        </button>
                      ) : (
                        <span style={{ fontSize: 12, color: "var(--color-text-faint)" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
