"use client";

import { useState } from "react";
import Link from "next/link";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

export function ProductTile({
  productId,
  name,
  sku,
  unit,
  origin,
  packaging,
  price,
}: {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  origin?: string | null;
  packaging?: string | null;
  price?: string | null;
}) {
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
      setTimeout(() => setAdded(false), 1200);
    } else {
      toast.show(result.error ?? "Impossible d'ajouter au panier.", "error");
    }
  }

  return (
    <div className="product-tile">
      <Link href={`/catalog/${productId}`}>
        <div className="product-thumb">{sku}</div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
      </Link>
      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
        {origin ? `${origin} · ` : ""}{packaging ?? unit}
      </div>
      {price && (
        <div style={{ fontSize: 15, fontWeight: 700 }}>
          {Number(price).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          <span style={{ fontSize: 11, fontWeight: 400, color: "var(--color-text-muted)" }}> / {unit}</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <div className="stepper">
          <button className="stepper-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
          <span style={{ minWidth: 20, textAlign: "center", fontSize: 13 }}>{quantity}</span>
          <button className="stepper-btn" onClick={() => setQuantity((q) => q + 1)}>+</button>
        </div>
        <button className="btn-primary" style={{ fontSize: 13, padding: "8px 14px" }} onClick={handleAdd}>
          {added ? "Ajouté ✓" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}
