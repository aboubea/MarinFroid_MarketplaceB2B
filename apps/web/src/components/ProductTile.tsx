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
      <Link href={`/catalog/${productId}`} style={{ display: "block" }}>
        <div className="product-thumb">{sku}</div>
        <div className="product-tile-body">
          <div className="product-tile-name">{name}</div>
          <div className="product-tile-meta">
            {origin ? `${origin} · ` : ""}{packaging ?? unit}
          </div>
          {price && (
            <div className="product-tile-price">
              {Number(price).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
              <span className="unit"> / {unit}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="product-tile-actions">
        <div className="stepper">
          <button className="stepper-btn" aria-label="Diminuer la quantité" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
          <span style={{ minWidth: 22, textAlign: "center", fontSize: 13.5, fontWeight: 650 }}>{quantity}</span>
          <button className="stepper-btn" aria-label="Augmenter la quantité" onClick={() => setQuantity((q) => q + 1)}>+</button>
        </div>
        <button
          className="btn-primary"
          style={added ? { background: "var(--color-success)", boxShadow: "none" } : undefined}
          onClick={handleAdd}
        >
          {added ? "Ajouté ✓" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}
