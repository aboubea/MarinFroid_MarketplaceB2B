"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";
import { EmptyState } from "./EmptyState";

interface Item {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  origin: string | null;
  packaging: string | null;
  indicativePrice: string | null;
  orderCount: number;
  lastOrderedAt: string;
  usualQuantity: number;
}

type SortMode = "frequent" | "recent";

function ItemCard({ item }: { item: Item }) {
  const toast = useToast();
  const [quantity, setQuantity] = useState(item.usualQuantity || 1);
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    const result = await safeFetch("/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: item.productId, quantity }),
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Link href={`/catalog/${item.productId}`} style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
        </Link>
        <span className="badge badge-completed" style={{ flexShrink: 0, marginLeft: 8 }}>
          Commandé {item.orderCount}×
        </span>
      </div>
      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
        {item.origin ? `${item.origin} · ` : ""}{item.packaging ?? item.unit}
      </div>
      <div style={{ fontSize: 11.5, color: "var(--color-text-faint)" }}>
        Dernière commande : {new Date(item.lastOrderedAt).toLocaleDateString("fr-FR")}
      </div>
      {item.indicativePrice && (
        <div style={{ fontSize: 15, fontWeight: 700 }}>
          {Number(item.indicativePrice).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          <span style={{ fontSize: 11, fontWeight: 400, color: "var(--color-text-muted)" }}> / {item.unit}</span>
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

export function ReachatBrowser({ items }: { items: Item[] }) {
  const [sort, setSort] = useState<SortMode>("frequent");

  const sorted = useMemo(() => {
    const copy = [...items];
    if (sort === "frequent") copy.sort((a, b) => b.orderCount - a.orderCount);
    else copy.sort((a, b) => new Date(b.lastOrderedAt).getTime() - new Date(a.lastOrderedAt).getTime());
    return copy;
  }, [items, sort]);

  if (items.length === 0) {
    return (
      <EmptyState
        illustration="box"
        title="Pas encore d'historique"
        description="Vos produits habituels apparaîtront ici après votre première commande."
        action={<a href="/catalog" className="btn-primary" style={{ display: "inline-block" }}>Parcourir le catalogue</a>}
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button className={`pill-filter ${sort === "frequent" ? "active" : ""}`} onClick={() => setSort("frequent")}>
          Les plus commandés
        </button>
        <button className={`pill-filter ${sort === "recent" ? "active" : ""}`} onClick={() => setSort("recent")}>
          Récents
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {sorted.map((item) => (
          <ItemCard key={item.productId} item={item} />
        ))}
      </div>
    </div>
  );
}
