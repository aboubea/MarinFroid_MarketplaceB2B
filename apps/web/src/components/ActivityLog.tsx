"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "./EmptyState";
import { ListSkeleton } from "./Skeleton";
import { safeFetch } from "@/lib/safe-fetch";
import { useToast } from "./Toast";

interface ActivityEntry {
  id: string;
  actorLabel: string | null;
  action: string;
  entityType: string;
  summary: string;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  order_created: "Commande créée",
  order_status_updated: "Statut modifié",
  invitation_sent: "Invitation envoyée",
  account_activated: "Compte activé",
  client_suspended: "Société suspendue",
  client_reactivated: "Société réactivée",
  product_deleted: "Produit supprimé",
  order_deleted: "Commande supprimée",
  client_deleted: "Société supprimée",
  staff_deleted: "Collaborateur supprimé",
  org_user_deleted: "Utilisateur supprimé",
};

const ACTION_BADGE: Record<string, string> = {
  order_created: "badge-submitted",
  order_status_updated: "badge-processing",
  invitation_sent: "badge-submitted",
  account_activated: "badge-completed",
  client_suspended: "badge-cancelled",
  client_reactivated: "badge-completed",
  product_deleted: "badge-cancelled",
  order_deleted: "badge-cancelled",
  client_deleted: "badge-cancelled",
  staff_deleted: "badge-cancelled",
  org_user_deleted: "badge-cancelled",
};

export function ActivityLog() {
  const toast = useToast();
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");

  useEffect(() => {
    safeFetch<{ activity: ActivityEntry[] }>("/api/admin/activity").then((result) => {
      setLoading(false);
      if (result.ok && result.data) {
        setEntries(result.data.activity);
      } else {
        toast.show(result.error ?? "Impossible de charger le journal d'activité.", "error");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions = useMemo(() => Array.from(new Set(entries.map((e) => e.action))), [entries]);
  const filtered = useMemo(() => (actionFilter === "all" ? entries : entries.filter((e) => e.action === actionFilter)), [entries, actionFilter]);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
        <button className={`pill-filter ${actionFilter === "all" ? "active" : ""}`} onClick={() => setActionFilter("all")}>Toutes</button>
        {actions.map((a) => (
          <button key={a} className={`pill-filter ${actionFilter === a ? "active" : ""}`} onClick={() => setActionFilter(a)}>
            {ACTION_LABELS[a] ?? a}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20 }}><ListSkeleton rows={6} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState illustration="inbox" title="Aucune activité" description="Les actions effectuées sur la plateforme apparaîtront ici." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Événement</th>
                  <th>Acteur</th>
                  <th>Type</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <span className={`badge ${ACTION_BADGE[e.action] ?? "badge-submitted"}`} style={{ marginRight: 8 }}>
                        {ACTION_LABELS[e.action] ?? e.action}
                      </span>
                      {e.summary}
                    </td>
                    <td style={{ color: "var(--color-text-muted)" }}>{e.actorLabel ?? "Système"}</td>
                    <td style={{ color: "var(--color-text-muted)" }}>{e.entityType}</td>
                    <td style={{ color: "var(--color-text-muted)" }}>{new Date(e.createdAt).toLocaleString("fr-FR")}</td>
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
