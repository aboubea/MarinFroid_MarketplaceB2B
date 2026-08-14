"use client";

import { useMemo, useState } from "react";
import { ProductTile } from "./ProductTile";
import { IconSearch } from "./icons";

interface Product {
  id: string;
  categoryId: string | null;
  name: string;
  sku: string;
  unit: string;
  origin: string | null;
  packaging: string | null;
  indicativePrice: string | null;
}

interface Category {
  id: string;
  name: string;
}

export function CatalogBrowser({ categories, products }: { categories: Category[]; products: Product[] }) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = !activeCategory || p.categoryId === activeCategory;
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.origin ?? "").toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [products, query, activeCategory]);

  const grouped = useMemo(() => {
    return categories
      .map((c) => ({ ...c, items: filtered.filter((p) => p.categoryId === c.id) }))
      .filter((c) => c.items.length > 0);
  }, [categories, filtered]);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginBottom: 20 }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 220 }}>
          <IconSearch />
          <input
            className="input"
            placeholder="Rechercher un produit, une référence..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
          <button className={`pill-filter ${activeCategory === null ? "active" : ""}`} onClick={() => setActiveCategory(null)}>
            Toutes
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={`pill-filter ${activeCategory === c.id ? "active" : ""}`}
              onClick={() => setActiveCategory(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 24, color: "var(--color-text-muted)" }}>
          Aucun produit ne correspond à votre recherche.
        </div>
      ) : (
        grouped.map((cat) => (
          <section key={cat.id} className="fade-up" style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 16, marginBottom: 12 }}>{cat.name}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
              {cat.items.map((p) => (
                <ProductTile
                  key={p.id}
                  productId={p.id}
                  name={p.name}
                  sku={p.sku}
                  unit={p.unit}
                  origin={p.origin}
                  packaging={p.packaging}
                  price={p.indicativePrice}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
