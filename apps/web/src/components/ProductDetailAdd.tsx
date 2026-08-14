"use client";

import { useState } from "react";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

export function ProductDetailAdd({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const toast = useToast();

  async function handleAdd() {
    const result = await safeFetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
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
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div className="stepper">
        <button className="stepper-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
        <span style={{ minWidth: 24, textAlign: "center", fontSize: 14 }}>{quantity}</span>
        <button className="stepper-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
      </div>
      <button className={`btn-primary ${added ? "success-pop" : ""}`} onClick={handleAdd}>
        {added ? "Ajouté au panier ✓" : "Ajouter au panier"}
      </button>
    </div>
  );
}
