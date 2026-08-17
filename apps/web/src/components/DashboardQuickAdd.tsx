"use client";

import { useState } from "react";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

export function DashboardQuickAdd({ productId }: { productId: string }) {
  const toast = useToast();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (loading) return;
    setLoading(true);
    const result = await safeFetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    setLoading(false);
    if (result.ok) {
      setAdded(true);
      window.dispatchEvent(new CustomEvent("cart:updated"));
      setTimeout(() => setAdded(false), 1000);
    } else {
      toast.show(result.error ?? "Impossible d'ajouter au panier.", "error");
    }
  }

  return (
    <button className="stepper-btn" style={{ width: 26, height: 26 }} onClick={handleAdd} aria-label="Ajouter au panier" disabled={loading}>
      {added ? "✓" : loading ? "…" : "+"}
    </button>
  );
}
