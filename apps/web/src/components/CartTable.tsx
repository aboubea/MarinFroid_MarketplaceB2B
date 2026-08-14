"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Item {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
}

export function CartTable({ initialItems }: { initialItems: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateQuantity(productId: string, quantity: number) {
    setItems((prev) => (quantity <= 0 ? prev.filter((i) => i.productId !== productId) : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))));
    await fetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    window.dispatchEvent(new CustomEvent("cart:updated"));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/orders/create", { method: "POST" });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Impossible de valider la commande.");
      return;
    }
    const { orderId } = await res.json();
    window.dispatchEvent(new CustomEvent("cart:updated"));
    router.push(`/orders/${orderId}?confirmed=1`);
  }

  if (items.length === 0) {
    return <div className="card" style={{ padding: 24, color: "var(--color-text-muted)" }}>Votre panier est vide.</div>;
  }

  return (
    <div>
      <div className="card" style={{ overflow: "hidden" }}>
        {items.map((item, idx) => (
          <div
            key={item.productId}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 16,
              borderBottom: idx < items.length - 1 ? "1px solid var(--color-border)" : "none",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{item.sku} · {item.unit}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="btn-secondary" style={{ padding: "4px 10px" }} onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
              <span style={{ minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
              <button className="btn-secondary" style={{ padding: "4px 10px" }} onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
            </div>
          </div>
        ))}
      </div>
      {error && <p style={{ color: "var(--color-danger)", marginTop: 12, fontSize: 13 }}>{error}</p>}
      <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
        <button className="btn-primary" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Validation..." : "Valider la commande"}
        </button>
      </div>
    </div>
  );
}
