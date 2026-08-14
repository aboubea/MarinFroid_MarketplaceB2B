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

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20 }}><ListSkeleton rows={4} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState illustration="inbox" title="Aucune notification" description="Vous serez informé ici des mises à jour de vos commandes." />
        ) : (
          filtered.map((n, idx) => {
            const content = (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "16px 20px",
                  borderBottom: idx < filtered.length - 1 ? "1px solid var(--color-border)" : "none",
                  background: n.readAt ? "transparent" : "rgba(56, 189, 248, 0.05)",
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
          })
        )}
      </div>
    </div>
  );
}
