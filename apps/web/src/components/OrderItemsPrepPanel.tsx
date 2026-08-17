"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

interface Item {
  id: string;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitSnapshot: string;
  quantity: number;
  preparedQuantity: number | null;
  indicativePrice?: string | null;
}

function formatEUR(value: number) {
  return value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function OrderItemsPrepPanel({ orderId, items, orderStatus }: { orderId: string; items: Item[]; orderStatus: string }) {
  const router = useRouter();
  const toast = useToast();
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(items.map((i) => [i.id, i.preparedQuantity ?? i.quantity])),
  );
  const [saving, setSaving] = useState(false);
  const editable = orderStatus === "processing";

  async function handleValidate() {
    setSaving(true);
    const result = await safeFetch<{ adjustedCount: number }>(`/api/admin/orders/${orderId}/finalize-prep`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ itemId: i.id, preparedQuantity: quantities[i.id] ?? i.quantity })),
      }),
    });
    setSaving(false);
    if (!result.ok) {
      toast.show(result.error ?? "Impossible de valider la préparation.", "error");
      return;
    }
    toast.show(
      result.data && result.data.adjustedCount > 0
        ? `Préparation validée, ${result.data.adjustedCount} volume(s) ajusté(s) — le client a été notifié.`
        : "Préparation validée, commande marquée comme expédiée.",
      "success",
    );
    router.refresh();
  }

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {items.map((item, idx) => {
        const qty = quantities[item.id] ?? item.quantity;
        const adjusted = qty !== item.quantity;
        return (
          <div
            key={item.id}
            style={{
              padding: 16,
              borderBottom: idx < items.length - 1 ? "1px solid var(--color-border)" : "none",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.productNameSnapshot}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {item.skuSnapshot} · {item.unitSnapshot}
                {item.indicativePrice && ` · ${formatEUR(Number(item.indicativePrice))} / ${item.unitSnapshot}`}
              </div>
            </div>

            {editable ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Commandé × {item.quantity}</span>
                <div className="stepper">
                  <button className="stepper-btn" onClick={() => setQuantities((prev) => ({ ...prev, [item.id]: Math.max(0, qty - 1) }))}>−</button>
                  <span style={{ minWidth: 24, textAlign: "center", fontWeight: 700, color: adjusted ? "var(--color-danger, #DC2626)" : undefined }}>{qty}</span>
                  <button className="stepper-btn" onClick={() => setQuantities((prev) => ({ ...prev, [item.id]: qty + 1 }))}>+</button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "right" }}>
                {item.indicativePrice && (
                  <div style={{ fontWeight: 700, fontSize: 14.5 }}>
                    {formatEUR(Number(item.indicativePrice) * (item.preparedQuantity ?? item.quantity))}
                  </div>
                )}
                <div style={{ fontWeight: item.indicativePrice ? 500 : 600, fontSize: item.indicativePrice ? 12 : 14, color: item.indicativePrice ? "var(--color-text-muted)" : undefined }}>
                  × {item.preparedQuantity ?? item.quantity}
                </div>
                {item.preparedQuantity !== null && item.preparedQuantity !== item.quantity && (
                  <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>(commandé × {item.quantity})</div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!editable && items.some((i) => i.indicativePrice) && (
        <div style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--color-bg)" }}>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--color-text-muted)" }}>Total indicatif</span>
          <span style={{ fontSize: 17, fontWeight: 750, letterSpacing: "-0.01em" }}>
            {formatEUR(
              items.reduce((sum, i) => sum + (i.indicativePrice ? Number(i.indicativePrice) * (i.preparedQuantity ?? i.quantity) : 0), 0),
            )}
          </span>
        </div>
      )}

      {editable && (
        <div style={{ padding: 16, display: "flex", justifyContent: "flex-end" }}>
          <button className="btn-primary" onClick={handleValidate} disabled={saving}>
            {saving ? "Validation..." : "Valider la préparation →"}
          </button>
        </div>
      )}
    </div>
  );
}
