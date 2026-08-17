"use client";

import { useState } from "react";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

export function ProductDetailAdd({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleAdd() {
    if (loading) return;
    setLoading(true);
    const result = await safeFetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    setLoading(false);
    if (result.ok) {
      setAdded(true);
      window.dispatchEvent(new CustomEvent("cart:updated"));
      toast.show("Ajouté au panier.", "success");
      setTimeout(() => setAdded(false), 1500);
    } else {
      toast.show(result.error ?? "Impossible d'ajouter au panier.", "error");
    }
  }

  return (
    <div className="buy-bar">
      <div className="stepper" style={{ padding: 4 }}>
        <button className="stepper-btn" aria-label="Diminuer la quantité" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
        <span style={{ minWidth: 30, textAlign: "center", fontSize: 15, fontWeight: 700 }}>{quantity}</span>
        <button className="stepper-btn" aria-label="Augmenter la quantité" onClick={() => setQuantity((q) => q + 1)}>+</button>
      </div>
      <button
        className={`btn-primary buy-bar-cta ${added ? "success-pop" : ""}`}
        onClick={handleAdd}
        disabled={loading}
        style={added ? { background: "var(--color-success)" } : undefined}
      >
        {added ? "Ajouté au panier ✓" : loading ? "Ajout..." : "Ajouter au panier"}
      </button>
    </div>
  );
}
