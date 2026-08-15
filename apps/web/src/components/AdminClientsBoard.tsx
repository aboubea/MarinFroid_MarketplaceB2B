"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar } from "./Avatar";
import { EmptyState } from "./EmptyState";
import { IconSearch } from "./icons";
import { ListSkeleton } from "./Skeleton";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";
import { orderStatusLabel } from "@/lib/order-status";

interface OrgRow {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface OrgDetail {
  organization: OrgRow;
  users: { id: string; fullName: string; email: string; role: string; active: boolean }[];
  recentOrders: { id: string; reference: string; status: string; createdAt: string }[];
}

const TABS = [
  { key: "all", label: "Toutes" },
  { key: "active", label: "Actives" },
  { key: "invited", label: "Invitées" },
  { key: "suspended", label: "Suspendues" },
];

const STATUS_LABELS: Record<string, string> = { active: "Active", invited: "Invitée", suspended: "Suspendue" };
const STATUS_BADGE: Record<string, string> = { active: "badge-completed", invited: "badge-submitted", suspended: "badge-cancelled" };

export function AdminClientsBoard({ initialOrganizations }: { initialOrganizations: OrgRow[] }) {
  const toast = useToast();
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrgDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    safeFetch<OrgDetail>(`/api/admin/clients/${selectedId}`).then((result) => {
      setDetailLoading(false);
      if (result.ok && result.data) {
        setDetail(result.data);
      } else {
        toast.show(result.error ?? "Impossible de charger cette société.", "error");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return organizations.filter((o) => {
      const matchesTab = tab === "all" || o.status === tab;
      const matchesQuery = !q || o.name.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [organizations, tab, query]);

  async function toggleStatus() {
    if (!detail) return;
    const nextStatus = detail.organization.status === "suspended" ? "active" : "suspended";
    setSavingStatus(true);
    const result = await safeFetch(`/api/admin/clients/${detail.organization.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setSavingStatus(false);
    if (!result.ok) {
      toast.show(result.error ?? "Impossible de mettre à jour la société.", "error");
      return;
    }
    setDetail({ ...detail, organization: { ...detail.organization, status: nextStatus } });
    setOrganizations((prev) => prev.map((o) => (o.id === detail.organization.id ? { ...o, status: nextStatus } : o)));
    toast.show(nextStatus === "suspended" ? "Société suspendue." : "Société réactivée.", "success");
  }

  return (
    <div>
      <div className="search-input-wrap" style={{ marginBottom: 16, maxWidth: 360 }}>
        <IconSearch />
        <input className="input" placeholder="Rechercher une société..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t.key} className={`pill-filter ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className={detail || detailLoading ? "grid-sidebar-380" : undefined} style={{ display: detail || detailLoading ? undefined : "grid", gridTemplateColumns: detail || detailLoading ? undefined : "1fr", gap: 16, alignItems: "start" }}>
        <div className={filtered.length === 0 ? "" : "card"} style={filtered.length === 0 ? {} : { overflow: "hidden" }}>
          {filtered.length === 0 ? (
            <EmptyState illustration="search" title="Aucune société" description="Aucune société ne correspond à ces filtres." />
          ) : (
            filtered.map((o, idx) => (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  background: selectedId === o.id ? "var(--color-bg)" : "transparent",
                  border: "none",
                  padding: "14px 20px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid var(--color-border)" : "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={o.name} />
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{o.name}</span>
                </div>
                <span className={`badge ${STATUS_BADGE[o.status] ?? "badge-submitted"}`}>{STATUS_LABELS[o.status] ?? o.status}</span>
              </button>
            ))
          )}
        </div>

        {(detail || detailLoading) && (
          <div className="card fade-up" style={{ padding: 20, position: "sticky", top: 84 }}>
            {detailLoading || !detail ? (
              <ListSkeleton rows={3} />
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={detail.organization.name} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{detail.organization.name}</div>
                      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                        Depuis {new Date(detail.organization.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                </div>

                <button className="btn-secondary" style={{ width: "100%", marginBottom: 16 }} onClick={toggleStatus} disabled={savingStatus}>
                  {detail.organization.status === "suspended" ? "Réactiver la société" : "Suspendre la société"}
                </button>

                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                  Utilisateurs ({detail.users.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {detail.users.length === 0 && <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>Aucun utilisateur.</div>}
                  {detail.users.map((u) => (
                    <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                      <span>{u.fullName}</span>
                      <span className={`status-dot ${u.active ? "on" : "off"}`}>{u.active ? "Actif" : "Désactivé"}</span>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8, borderTop: "1px solid var(--color-border)", paddingTop: 14 }}>
                  Dernières commandes
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                  {detail.recentOrders.length === 0 && <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>Aucune commande.</div>}
                  {detail.recentOrders.map((o) => (
                    <div key={o.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                      <span>{o.reference}</span>
                      <span className={`badge badge-${o.status}`}>{orderStatusLabel(o.status)}</span>
                    </div>
                  ))}
                </div>

                <a href={`/admin/clients/${detail.organization.id}`} style={{ display: "block", fontSize: 12.5, fontWeight: 600 }}>
                  Ouvrir la fiche complète →
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
