"use client";

import { useEffect, useMemo, useState } from "react";
import { IconDownload, IconSearch } from "./icons";
import { EmptyState } from "./EmptyState";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";
import { ListSkeleton } from "./Skeleton";

interface OrderRow {
  id: string;
  reference: string;
  status: string;
  createdAt: string;
  organizationName: string;
}

interface OrderDetail {
  order: { id: string; reference: string; status: string; createdAt: string };
  organizationName: string;
  items: { id: string; productNameSnapshot: string; skuSnapshot: string; unitSnapshot: string; quantity: number }[];
  address: { label: string; line1: string; line2: string | null; city: string; postalCode: string; country: string } | null;
  history: { id: string; status: string; createdAt: string }[];
}

const TABS = [
  { key: "all", label: "Toutes" },
  { key: "submitted", label: "Nouvelles" },
  { key: "processing", label: "En préparation" },
  { key: "shipped", label: "Expédiées" },
  { key: "completed", label: "Terminées" },
  { key: "cancelled", label: "Annulées" },
];

const STATUSES = ["submitted", "acknowledged", "processing", "shipped", "completed", "cancelled"];

export function AdminOrdersBoard() {
  const toast = useToast();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    safeFetch<{ orders: OrderRow[] }>("/api/admin/orders").then((result) => {
      setLoading(false);
      if (result.ok && result.data) {
        setOrders(result.data.orders);
      } else {
        toast.show(result.error ?? "Impossible de charger les commandes.", "error");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    safeFetch<OrderDetail>(`/api/admin/orders/${selectedId}`).then((result) => {
      if (result.ok && result.data) {
        setDetail(result.data);
      } else {
        toast.show(result.error ?? "Impossible de charger la commande.", "error");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesTab = tab === "all" || o.status === tab;
      const matchesQuery = !q || o.reference.toLowerCase().includes(q) || o.organizationName.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [orders, tab, query]);

  async function handleStatusChange(status: string) {
    if (!detail) return;
    setSavingStatus(true);
    const result = await safeFetch(`/api/admin/orders/${detail.order.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSavingStatus(false);
    if (!result.ok) {
      toast.show(result.error ?? "Impossible de mettre à jour le statut.", "error");
      return;
    }
    setDetail({ ...detail, order: { ...detail.order, status } });
    setOrders((prev) => prev.map((o) => (o.id === detail.order.id ? { ...o, status } : o)));
    toast.show("Statut mis à jour.", "success");
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 220 }}>
          <IconSearch />
          <input className="input" placeholder="Rechercher une commande, un client..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <a href="/api/admin/orders/export" className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <IconDownload /> Exporter
        </a>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t.key} className={`pill-filter ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: detail ? "1fr 380px" : "1fr", gap: 16, alignItems: "start" }}>
        <div className={filtered.length === 0 ? "" : "card"} style={filtered.length === 0 ? {} : { overflow: "hidden" }}>
          {loading ? (
            <ListSkeleton rows={5} />
          ) : filtered.length === 0 ? (
            <EmptyState illustration="inbox" title="Aucune commande" description="Aucune commande ne correspond à ces filtres pour le moment." />
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
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{o.reference} — {o.organizationName}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{new Date(o.createdAt).toLocaleString("fr-FR")}</div>
                </div>
                <span className={`badge badge-${o.status}`}>{o.status}</span>
              </button>
            ))
          )}
        </div>

        {detail && (
          <div className="card fade-up" style={{ padding: 20, position: "sticky", top: 84 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{detail.order.reference}</div>
                <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{detail.organizationName}</div>
              </div>
              <select className="input" style={{ width: "auto" }} value={detail.order.status} disabled={savingStatus} onChange={(e) => handleStatusChange(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {detail.address && (
              <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid var(--color-border)" }}>
                {detail.address.label} · {detail.address.line1}, {detail.address.postalCode} {detail.address.city}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {detail.items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span>{item.productNameSnapshot}</span>
                  <span style={{ fontWeight: 600 }}>× {item.quantity}</span>
                </div>
              ))}
            </div>

            {detail.history.length > 0 && (
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>
                  Historique
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {detail.history.map((h) => (
                    <div key={h.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span className={`badge badge-${h.status}`}>{h.status}</span>
                      <span style={{ color: "var(--color-text-muted)" }}>{new Date(h.createdAt).toLocaleString("fr-FR")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <a href={`/admin/orders/${detail.order.id}`} style={{ display: "block", marginTop: 16, fontSize: 12.5, fontWeight: 600 }}>
              Ouvrir la commande en plein écran →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
