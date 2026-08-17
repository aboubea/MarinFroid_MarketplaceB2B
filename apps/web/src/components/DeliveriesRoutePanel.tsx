"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";
import { orderStatusLabel } from "@/lib/order-status";

export interface DeliveryStop {
  orderId: string;
  reference: string;
  status: string;
  organizationName: string;
  address: { label: string; line1: string; line2: string | null; city: string; postalCode: string } | null;
  itemCount: number;
}

export function DeliveriesRoutePanel({ initialStops }: { initialStops: DeliveryStop[] }) {
  const toast = useToast();
  const [stops, setStops] = useState(initialStops);
  const [optimizing, setOptimizing] = useState(false);
  const [optimized, setOptimized] = useState(false);

  // A pull-to-refresh (router.refresh()) re-runs the server component and
  // passes a new initialStops array — sync it in, since useState only
  // reads its initial value once and this component otherwise never
  // remounts on that kind of refresh.
  useEffect(() => {
    setStops(initialStops);
    setOptimized(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStops]);

  async function handleOptimize() {
    setOptimizing(true);
    const result = await safeFetch<{ sequence: string[]; unlocatedCount: number }>("/api/admin/deliveries/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderIds: stops.map((s) => s.orderId) }),
    });
    setOptimizing(false);
    if (!result.ok || !result.data) {
      toast.show(result.error ?? "Impossible d'optimiser la tournée.", "error");
      return;
    }
    const byId = new Map(stops.map((s) => [s.orderId, s]));
    const reordered = result.data.sequence.map((id) => byId.get(id)).filter((s): s is DeliveryStop => !!s);
    setStops(reordered);
    setOptimized(true);
    toast.show(
      result.data.unlocatedCount > 0
        ? `Tournée optimisée (${result.data.unlocatedCount} adresse(s) non localisable(s), laissée(s) en fin de liste).`
        : "Tournée optimisée depuis Marin Froid (Toulouse).",
      "success",
    );
  }

  if (stops.length === 0) {
    return (
      <div className="card" style={{ padding: 24, color: "var(--color-text-muted)", fontSize: 13 }}>
        Aucune livraison prévue pour ce jeudi.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button className="btn-primary" onClick={handleOptimize} disabled={optimizing}>
          {optimizing ? "Optimisation..." : "Optimiser ma tournée →"}
        </button>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {stops.map((s, idx) => (
          <div
            key={s.orderId}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "14px 20px",
              borderBottom: idx < stops.length - 1 ? "1px solid var(--color-border)" : "none",
            }}
          >
            {optimized && (
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{s.organizationName} — {s.reference}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {s.address ? `${s.address.line1}, ${s.address.postalCode} ${s.address.city}` : "Adresse non renseignée"}
              </div>
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>{s.itemCount} article(s)</div>
            <span className={`badge badge-${s.status}`}>{orderStatusLabel(s.status)}</span>
            <Link href={`/admin/orders/${s.orderId}`} style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>
              Voir →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
