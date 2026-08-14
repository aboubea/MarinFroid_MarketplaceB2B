"use client";

import { useState } from "react";

export function QuickAddButton({ productId }: { productId: string }) {
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    if (res.ok) {
      setAdded(true);
      window.dispatchEvent(new CustomEvent("cart:updated"));
      setTimeout(() => setAdded(false), 1200);
    }
  }

  return (
    <button className="btn-primary" onClick={handleAdd} style={{ fontSize: 13, padding: "8px 14px" }}>
      {added ? "Ajouté ✓" : "Ajouter au panier"}
    </button>
  );
}
