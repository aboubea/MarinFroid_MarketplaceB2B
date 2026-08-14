"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Address } from "./AddressManager";

interface Item {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  indicativePrice: string | null;
}

export function CartTable({ initialItems, addresses }: { initialItems: Item[]; addresses: Address[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string>(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "");

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
    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryAddressId: addressId || null }),
    });
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

  const subtotal = items.reduce((sum, i) => sum + (i.indicativePrice ? Number(i.indicativePrice) * i.quantity : 0), 0);
  const hasPricing = items.some((i) => i.indicativePrice);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
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
              <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
                {item.sku} · {item.unit}
                {item.indicativePrice && ` · ${Number(item.indicativePrice).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div className="stepper">
                <button className="stepper-btn" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>−</button>
                <span style={{ minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                <button className="stepper-btn" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
              </div>
              {item.indicativePrice && (
                <div style={{ fontWeight: 700, fontSize: 14, minWidth: 70, textAlign: "right" }}>
                  {(Number(item.indicativePrice) * item.quantity).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 20, position: "sticky", top: 84 }}>
        <h2 style={{ fontSize: 15, marginBottom: 16 }}>Résumé</h2>

        {addresses.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>
              Adresse de livraison
            </label>
            <select className="input" value={addressId} onChange={(e) => setAddressId(e.target.value)}>
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>{a.label} — {a.city}</option>
              ))}
            </select>
          </div>
        )}

        {hasPricing && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
              <span style={{ color: "var(--color-text-muted)" }}>Sous-total indicatif</span>
              <span>{subtotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
            </div>
            <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginBottom: 16 }}>
              Montant indicatif — le prix définitif est confirmé par l'équipe Marin Froid, hors TVA et livraison.
            </p>
          </>
        )}

        {error && <p style={{ color: "var(--color-danger)", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button className="btn-primary" style={{ width: "100%" }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Validation..." : "Valider la commande"}
        </button>
      </div>
    </div>
  );
}
