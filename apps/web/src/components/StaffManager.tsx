"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";
import { ListSkeleton } from "./Skeleton";
import { Avatar } from "./Avatar";
import { EmptyState } from "./EmptyState";
import { IconPower, IconSearch, IconUserPlus } from "./icons";

interface StaffMember {
  id: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  mf_admin: "Administrateur",
  mf_ops: "Équipe préparation",
};

export function StaffManager({ currentUserId }: { currentUserId: string }) {
  const toast = useToast();
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"mf_admin" | "mf_ops">("mf_ops");
  const [sending, setSending] = useState(false);

  function loadStaff() {
    safeFetch<{ users: StaffMember[] }>("/api/admin/staff").then((result) => {
      setLoading(false);
      if (result.ok && result.data) {
        setMembers(result.data.users ?? []);
      } else {
        toast.show(result.error ?? "Impossible de charger l'équipe.", "error");
      }
    });
  }

  useEffect(() => {
    loadStaff();
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
    const result = await safeFetch("/api/admin/staff/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, fullName: role === "mf_ops" ? fullName : undefined }),
    });
    setSending(false);
    if (result.ok) {
      setEmail("");
      setFullName("");
      setShowInvite(false);
      toast.show(role === "mf_ops" ? "Destinataire ajouté." : "Invitation envoyée.", "success");
      loadStaff();
    } else {
      toast.show(result.error ?? "Erreur lors de l'envoi de l'invitation.", "error");
    }
  }

  async function changeRole(id: string, role: "mf_admin" | "mf_ops") {
    const previous = members;
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    const result = await safeFetch(`/api/admin/staff/${id}/role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!result.ok) {
      setMembers(previous);
      toast.show(result.error ?? "Impossible de mettre à jour le rôle.", "error");
    } else {
      toast.show("Rôle mis à jour.", "success");
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const previous = members;
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, active } : m)));
    const result = await safeFetch(`/api/admin/staff/${id}/status`, {
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
        <form onSubmit={handleInvite} className="card fade-up invite-client-form" style={{ padding: 18, marginBottom: 20 }}>
          <input className="input" type="email" autoComplete="email" placeholder="email@marinfroid.fr" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {role === "mf_ops" && (
            <input className="input" placeholder="Nom (ex. Équipe préparation)" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          )}
          <select className="input" value={role} onChange={(e) => setRole(e.target.value as "mf_admin" | "mf_ops")}>
            <option value="mf_ops">Équipe préparation — reçoit le récapitulatif des commandes par email</option>
            <option value="mf_admin">Administrateur — accès complet au back-office</option>
          </select>
          <button className="btn-primary" type="submit" disabled={sending}>
            {sending ? "Envoi..." : role === "mf_ops" ? "Ajouter le destinataire" : "Envoyer l'invitation"}
          </button>
          <button className="btn-secondary" type="button" onClick={() => setShowInvite(false)}>Annuler</button>
        </form>
      )}

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20 }}><ListSkeleton rows={4} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState illustration="users" title="Aucun membre" description="Invitez un collaborateur Marin Froid pour qu'il accède au back-office." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Membre</th>
                  <th>Email</th>
                  <th>Rôle</th>
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
                    <td>
                      {m.id === currentUserId ? (
                        ROLE_LABELS[m.role] ?? m.role
                      ) : (
                        <select
                          className="input"
                          style={{ width: "auto", fontSize: 12.5, padding: "6px 10px" }}
                          value={m.role}
                          onChange={(e) => changeRole(m.id, e.target.value as "mf_admin" | "mf_ops")}
                        >
                          <option value="mf_ops">Équipe préparation</option>
                          <option value="mf_admin">Administrateur</option>
                        </select>
                      )}
                    </td>
                    <td>
                      <span className={`status-dot ${m.active ? "on" : "off"}`}>{m.active ? "Actif" : "Désactivé"}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {m.id !== currentUserId ? (
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
