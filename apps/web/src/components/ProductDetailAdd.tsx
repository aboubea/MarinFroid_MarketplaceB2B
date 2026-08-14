"use client";

import { useState } from "react";

export function ProductDetailAdd({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    if (res.ok) {
      setAdded(true);
      window.dispatchEvent(new CustomEvent("cart:updated"));
      setTimeout(() => setAdded(false), 1500);
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div className="stepper">
        <button className="stepper-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
        <span style={{ minWidth: 24, textAlign: "center", fontSize: 14 }}>{quantity}</span>
        <button className="stepper-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
      </div>
      <button className="btn-primary" onClick={handleAdd}>
        {added ? "Ajouté au panier ✓" : "Ajouter au panier"}
      </button>
    </div>
  );
}
