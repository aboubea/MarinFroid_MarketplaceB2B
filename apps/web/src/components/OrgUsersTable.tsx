"use client";

import { useState } from "react";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";
import { Avatar } from "./Avatar";
import { EmptyState } from "./EmptyState";
import { IconTrash } from "./icons";

interface OrgUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  active: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  mf_admin: "Admin Marin Froid",
  mf_ops: "Équipe préparation",
  org_admin: "Administrateur",
  org_buyer: "Acheteur",
  org_viewer: "Lecture / administratif",
};

export function OrgUsersTable({ organizationId, initialUsers }: { organizationId: string; initialUsers: OrgUser[] }) {
  const toast = useToast();
  const [users, setUsers] = useState(initialUsers);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function deleteUser(u: OrgUser) {
    if (!window.confirm(`Supprimer définitivement ${u.fullName} ?`)) return;
    setDeletingId(u.id);
    const result = await safeFetch(`/api/admin/clients/${organizationId}/users/${u.id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!result.ok) {
      toast.show(result.error ?? "Impossible de supprimer cet utilisateur.", "error");
      return;
    }
    setUsers((prev) => prev.filter((m) => m.id !== u.id));
    toast.show("Utilisateur supprimé.", "success");
  }

  if (users.length === 0) {
    return <EmptyState illustration="users" title="Aucun utilisateur" description="Cette société n'a pas encore d'utilisateur actif." />;
  }

  return (
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
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={u.fullName} />
                  <span style={{ fontWeight: 600 }}>{u.fullName}</span>
                </div>
              </td>
              <td style={{ color: "var(--color-text-muted)" }}>{u.email}</td>
              <td>{ROLE_LABELS[u.role] ?? u.role}</td>
              <td>
                <span className={`status-dot ${u.active ? "on" : "off"}`}>{u.active ? "Actif" : "Désactivé"}</span>
              </td>
              <td style={{ textAlign: "right" }}>
                <button
                  className="icon-btn danger"
                  title="Supprimer"
                  onClick={() => deleteUser(u)}
                  disabled={deletingId === u.id}
                >
                  <IconTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
