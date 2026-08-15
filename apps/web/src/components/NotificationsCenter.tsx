"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState } from "./EmptyState";
import { ListSkeleton } from "./Skeleton";
import { safeFetch } from "@/lib/safe-fetch";

interface Notification {
  id: string;
  category: string;
  title: string;
  body: string | null;
  orderId: string | null;
  readAt: string | null;
  createdAt: string;
}

const FILTERS = [
  { key: "all", label: "Toutes" },
  { key: "order_created", label: "Commandes" },
  { key: "order_status_updated", label: "Statut" },
  { key: "system", label: "Système" },
];

function accentColor(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("annul")) return "var(--color-danger, #DC2626)";
  if (t.includes("livr")) return "var(--color-success)";
  if (t.includes("expédi")) return "var(--color-success)";
  if (t.includes("préparation")) return "var(--color-warning, #D97706)";
  if (t.includes("confirm")) return "var(--color-accent, #2563EB)";
  if (t.includes("reçue") || t.includes("créée")) return "var(--color-secondary)";
  return "var(--color-border-strong)";
}

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  async function load() {
    const result = await safeFetch<{ notifications: Notification[] }>("/api/notifications");
    setLoading(false);
    if (result.ok && result.data) setNotifications(result.data.notifications);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.category === filter);
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  async function markRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    await safeFetch(`/api/notifications/${id}/read`, { method: "POST" });
    window.dispatchEvent(new CustomEvent("notifications:updated"));
  }

  async function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    await safeFetch("/api/notifications/read-all", { method: "POST" });
    window.dispatchEvent(new CustomEvent("notifications:updated"));
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          {FILTERS.map((f) => (
            <button key={f.key} className={`pill-filter ${filter === f.key ? "active" : ""}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
        {unreadCount > 0 && (
          <button className="btn-secondary" style={{ fontSize: 12.5, padding: "8px 14px" }} onClick={markAllRead}>
            Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <div className="card" style={{ padding: 20 }}><ListSkeleton rows={4} /></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ overflow: "hidden" }}>
          <EmptyState illustration="inbox" title="Aucune notification" description="Vous serez informé ici des mises à jour de vos commandes." />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filtered.map((n, idx) => {
            const accent = accentColor(n.title);
            const content = (
              <div
                className="card"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "16px 20px",
                  marginTop: idx === 0 ? 0 : -14,
                  marginLeft: Math.min(idx, 3) * 6,
                  marginRight: Math.min(idx, 3) * 6,
                  position: "relative",
                  zIndex: filtered.length - idx,
                  borderLeft: `4px solid ${accent}`,
                  background: n.readAt ? "var(--color-surface)" : "rgba(56, 189, 248, 0.06)",
                  boxShadow: idx === 0 ? "var(--shadow-md, 0 4px 16px rgba(15,23,42,0.08))" : "var(--shadow-sm, 0 2px 6px rgba(15,23,42,0.06))",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: n.readAt ? "transparent" : "var(--color-secondary)",
                    marginTop: 6,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{n.title}</div>
                  {n.body && <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: 2 }}>{n.body}</div>}
                  <div style={{ fontSize: 11.5, color: "var(--color-text-faint)", marginTop: 4 }}>
                    {new Date(n.createdAt).toLocaleString("fr-FR")}
                  </div>
                </div>
              </div>
            );
            return n.orderId ? (
              <Link key={n.id} href={`/orders/${n.orderId}`} onClick={() => markRead(n.id)} style={{ display: "block" }}>
                {content}
              </Link>
            ) : (
              <div key={n.id} onClick={() => markRead(n.id)} style={{ cursor: "pointer" }}>
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
