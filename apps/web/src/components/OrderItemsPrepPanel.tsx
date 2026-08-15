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
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{item.skuSnapshot} · {item.unitSnapshot}</div>
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
              <div style={{ fontWeight: 600 }}>
                × {item.preparedQuantity ?? item.quantity}
                {item.preparedQuantity !== null && item.preparedQuantity !== item.quantity && (
                  <span style={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 400, marginLeft: 6 }}>
                    (commandé × {item.quantity})
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}

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
