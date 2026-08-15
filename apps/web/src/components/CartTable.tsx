"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Address } from "./AddressManager";
import { EmptyState } from "./EmptyState";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

interface Item {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  quantity: number;
  indicativePrice: string | null;
}

export function CartTable({
  initialItems,
  addresses,
  canSubmit,
  isOrgAdmin,
}: {
  initialItems: Item[];
  addresses: Address[];
  canSubmit: boolean;
  isOrgAdmin: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState(initialItems);
  const [submitting, setSubmitting] = useState(false);
  const [addressId, setAddressId] = useState<string>(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? "");
  const [notes, setNotes] = useState("");

  async function updateQuantity(productId: string, quantity: number) {
    const previous = items;
    setItems((prev) => (quantity <= 0 ? prev.filter((i) => i.productId !== productId) : prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))));
    const result = await safeFetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    if (!result.ok) {
      setItems(previous);
      toast.show(result.error ?? "Impossible de mettre à jour le panier.", "error");
      return;
    }
    window.dispatchEvent(new CustomEvent("cart:updated"));
  }

  async function handleSubmit() {
    setSubmitting(true);
    const result = await safeFetch<{ orderId: string }>("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryAddressId: addressId || null, notes: notes.trim() || null }),
    });
    setSubmitting(false);
    if (!result.ok || !result.data) {
      toast.show(result.error ?? "Impossible de valider la commande.", "error");
      return;
    }
    window.dispatchEvent(new CustomEvent("cart:updated"));
    toast.show("Commande transmise à l'équipe Marin Froid.", "success");
    router.push(`/orders/${result.data.orderId}?confirmed=1`);
  }

  if (items.length === 0) {
    return (
      <EmptyState
        illustration="cart"
        title="Votre panier est vide"
        description="Ajoutez des produits depuis le catalogue ou reprenez une commande précédente."
        action={<a href="/catalog" className="btn-primary" style={{ display: "inline-block" }}>Parcourir le catalogue</a>}
      />
    );
  }

  const subtotal = items.reduce((sum, i) => sum + (i.indicativePrice ? Number(i.indicativePrice) * i.quantity : 0), 0);
  const hasPricing = items.some((i) => i.indicativePrice);

  return (
    <div className="grid-sidebar-320" style={{ gap: 20, alignItems: "start" }}>
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

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>
            Adresse de livraison
          </label>
          {addresses.length > 0 ? (
            <select className="input" value={addressId} onChange={(e) => setAddressId(e.target.value)}>
              {addresses.map((a) => (
                <option key={a.id} value={a.id}>{a.label} — {a.city}</option>
              ))}
            </select>
          ) : (
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", background: "var(--color-bg)", padding: "8px 10px", borderRadius: "var(--radius-md)" }}>
              {isOrgAdmin
                ? <>Aucune adresse enregistrée. Ajoutez-en une depuis <a href="/account" style={{ fontWeight: 600, color: "var(--color-text)" }}>Mon compte</a>.</>
                : "Aucune adresse enregistrée. Seul l'administrateur de votre société peut en ajouter, depuis son compte."}
            </p>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", display: "block", marginBottom: 6 }}>
            Notes au préparateur (optionnel)
          </label>
          <textarea
            className="input"
            rows={3}
            placeholder="Ex. livraison quai arrière, contact sur place..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ resize: "vertical", minHeight: 60 }}
          />
        </div>

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

        {canSubmit ? (
          <button className="btn-primary" style={{ width: "100%" }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Validation..." : "Valider la commande"}
          </button>
        ) : (
          <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", background: "var(--color-bg)", padding: "10px 12px", borderRadius: "var(--radius-md)" }}>
            Votre profil ne permet pas de valider une commande. Contactez l'administrateur de votre société.
          </p>
        )}
      </div>
    </div>
  );
}
