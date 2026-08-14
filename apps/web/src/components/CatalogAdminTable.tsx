"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState } from "./EmptyState";
import { ListSkeleton } from "./Skeleton";
import { IconSearch } from "./icons";
import { safeFetch } from "@/lib/safe-fetch";
import { useToast } from "./Toast";

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  unit: string;
  indicativePrice: string | null;
  active: boolean;
  categoryId: string | null;
  categoryName: string | null;
}

export function CatalogAdminTable() {
  const toast = useToast();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    safeFetch<{ products: ProductRow[] }>("/api/admin/catalog/products").then((result) => {
      setLoading(false);
      if (result.ok && result.data) {
        setProducts(result.data.products);
      } else {
        toast.show(result.error ?? "Impossible de charger le catalogue.", "error");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? p.active : !p.active);
      return matchesQuery && matchesStatus;
    });
  }, [products, query, statusFilter]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <h1 style={{ fontSize: 24 }}>Catalogue</h1>
        <Link href="/admin/catalog/new" className="btn-primary">+ Ajouter un produit</Link>
      </div>
      <p style={{ color: "var(--color-text-muted)", fontSize: 13.5, marginBottom: 24 }}>
        {products.length} référence{products.length > 1 ? "s" : ""}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16, alignItems: "center" }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: 220 }}>
          <IconSearch />
          <input className="input" placeholder="Rechercher une référence, un nom..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`pill-filter ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>Toutes</button>
          <button className={`pill-filter ${statusFilter === "active" ? "active" : ""}`} onClick={() => setStatusFilter("active")}>Actives</button>
          <button className={`pill-filter ${statusFilter === "inactive" ? "active" : ""}`} onClick={() => setStatusFilter("inactive")}>Désactivées</button>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 20 }}><ListSkeleton rows={5} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState illustration="box" title="Aucun produit" description="Ajoutez une première référence au catalogue." />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Référence</th>
                  <th>Catégorie</th>
                  <th>Prix indicatif</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <Link href={`/admin/catalog/${p.id}`} style={{ fontWeight: 600 }}>{p.name}</Link>
                    </td>
                    <td style={{ color: "var(--color-text-muted)" }}>{p.sku}</td>
                    <td style={{ color: "var(--color-text-muted)" }}>{p.categoryName ?? "—"}</td>
                    <td>{p.indicativePrice ? `${Number(p.indicativePrice).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} / ${p.unit}` : "—"}</td>
                    <td><span className={`status-dot ${p.active ? "on" : "off"}`}>{p.active ? "Active" : "Désactivée"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
