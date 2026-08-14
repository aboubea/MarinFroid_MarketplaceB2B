"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "./EmptyState";
import { IconSearch } from "./icons";
import { ListSkeleton } from "./Skeleton";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  organizationName: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Envoyée",
  accepted: "Acceptée",
  expired: "Expirée",
  revoked: "Annulée",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "badge-submitted",
  accepted: "badge-completed",
  expired: "badge-cancelled",
  revoked: "badge-cancelled",
};

export function InvitationsTable() {
  const toast = useToast();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    safeFetch<{ invitations: Invitation[] }>("/api/admin/invitations").then((result) => {
      setLoading(false);
      if (result.ok && result.data) {
        setInvitations(result.data.invitations);
      } else {
        toast.show(result.error ?? "Impossible de charger les invitations.", "error");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invitations;
    return invitations.filter((i) => i.email.toLowerCase().includes(q) || i.organizationName.toLowerCase().includes(q));
  }, [invitations, query]);

  function isExpired(inv: Invitation) {
    return inv.status === "pending" && new Date(inv.expiresAt) < new Date();
  }

  async function handleResend(id: string) {
    setBusyId(id);
    const result = await safeFetch(`/api/admin/invitations/${id}/resend`, { method: "POST" });
    setBusyId(null);
    if (result.ok) {
      setInvitations((prev) => prev.map((i) => (i.id === id ? { ...i, status: "pending" } : i)));
      toast.show("Invitation renvoyée.", "success");
    } else {
      toast.show(result.error ?? "Impossible de renvoyer l'invitation.", "error");
    }
  }

  async function handleCancel(id: string) {
    setBusyId(id);
    const result = await safeFetch(`/api/admin/invitations/${id}/cancel`, { method: "POST" });
    setBusyId(null);
    if (result.ok) {
      setInvitations((prev) => prev.map((i) => (i.id === id ? { ...i, status: "revoked" } : i)));
      toast.show("Invitation annulée.", "success");
    } else {
      toast.show(result.error ?? "Impossible d'annuler l'invitation.", "error");
    }
  }

  return (
    <div>
      <div className="search-input-wrap" style={{ marginBottom: 16, maxWidth: 360 }}>
        <IconSearch />
        <input className="input" placeholder="Rechercher par email ou société..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20 }}><ListSkeleton rows={4} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState illustration="inbox" title="Aucune invitation" description="Les invitations envoyées depuis la fiche client apparaîtront ici." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Société</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Envoyée le</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const expired = isExpired(inv);
                  const status = expired ? "expired" : inv.status;
                  return (
                    <tr key={inv.id}>
                      <td style={{ fontWeight: 600 }}>{inv.email}</td>
                      <td style={{ color: "var(--color-text-muted)" }}>{inv.organizationName}</td>
                      <td>{inv.role}</td>
                      <td><span className={`badge ${STATUS_BADGE[status]}`}>{STATUS_LABELS[status]}</span></td>
                      <td style={{ color: "var(--color-text-muted)" }}>{new Date(inv.createdAt).toLocaleDateString("fr-FR")}</td>
                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          {(status === "pending" || status === "expired") && (
                            <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} disabled={busyId === inv.id} onClick={() => handleResend(inv.id)}>
                              Renvoyer
                            </button>
                          )}
                          {status === "pending" && (
                            <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} disabled={busyId === inv.id} onClick={() => handleCancel(inv.id)}>
                              Annuler
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
