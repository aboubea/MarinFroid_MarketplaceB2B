"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { NotificationBell } from "./NotificationBell";
import { safeFetch } from "@/lib/safe-fetch";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  orderId: string | null;
  readAt: string | null;
  createdAt: string;
}

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

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const wrapRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    setLoading(true);
    const result = await safeFetch<{ notifications: Notification[] }>("/api/notifications");
    setLoading(false);
    if (result.ok && result.data) setNotifications(result.data.notifications.slice(0, 6));
  }

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    function onUpdate() {
      if (open) refresh();
    }
    window.addEventListener("notifications:updated", onUpdate);
    return () => window.removeEventListener("notifications:updated", onUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        aria-label="Notifications"
        className="topbar-action"
        style={{ background: "none", border: "none", cursor: "pointer" }}
        onClick={() => setOpen((v) => !v)}
      >
        <NotificationBell />
      </button>

      {open && (
        <div className="card cart-popover fade-up">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Notifications</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11.5, fontWeight: 600, color: "var(--color-primary)", padding: 0 }}
                >
                  Tout marquer comme lu
                </button>
              )}
              <button
                type="button"
                aria-label="Fermer"
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-faint)", display: "flex", padding: 2 }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 20, fontSize: 12.5, color: "var(--color-text-muted)", textAlign: "center" }}>Chargement...</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: 24, fontSize: 12.5, color: "var(--color-text-muted)", textAlign: "center" }}>Aucune notification.</div>
          ) : (
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {notifications.map((n, idx) => {
                const accent = accentColor(n.title);
                const content = (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "12px 16px",
                      borderBottom: idx < notifications.length - 1 ? "1px solid var(--color-border)" : "none",
                      borderLeft: `3px solid ${accent}`,
                      background: n.readAt ? "transparent" : "rgba(56, 189, 248, 0.06)",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: n.readAt ? "transparent" : "var(--color-secondary)",
                        marginTop: 5,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 12.5 }}>{n.title}</div>
                      {n.body && (
                        <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {n.body}
                        </div>
                      )}
                      <div style={{ fontSize: 10.5, color: "var(--color-text-faint)", marginTop: 3 }}>
                        {new Date(n.createdAt).toLocaleString("fr-FR")}
                      </div>
                    </div>
                  </div>
                );
                return n.orderId ? (
                  <Link key={n.id} href={`/orders/${n.orderId}`} onClick={() => { markRead(n.id); setOpen(false); }} style={{ display: "block" }}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id} onClick={() => markRead(n.id)}>
                    {content}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ padding: 12, borderTop: "1px solid var(--color-border)" }}>
            <Link href="/notifications" className="btn-secondary" style={{ display: "block", textAlign: "center" }} onClick={() => setOpen(false)}>
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
