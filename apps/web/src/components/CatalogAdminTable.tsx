"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { EmptyState } from "./EmptyState";
import { ListSkeleton } from "./Skeleton";
import { IconSearch, IconEdit, IconTrash } from "./icons";
import { safeFetch } from "@/lib/safe-fetch";
import { useToast } from "./Toast";
import { PageHeader } from "./PageHeader";

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  unit: string;
  origin: string | null;
  brand: string | null;
  indicativePrice: string | null;
  active: boolean;
  categoryId: string | null;
  categoryName: string | null;
  hasPhoto: boolean;
}

export function CatalogAdminTable() {
  const toast = useToast();
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [photoFilter, setPhotoFilter] = useState<"all" | "with" | "without">("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  async function handleDelete(p: ProductRow) {
    if (!window.confirm(`Supprimer définitivement « ${p.name} » ? Cette action est irréversible.`)) return;
    setDeletingId(p.id);
    const result = await safeFetch(`/api/admin/catalog/products/${p.id}`, { method: "DELETE" });
    setDeletingId(null);
    if (result.ok) {
      setProducts((prev) => prev.filter((item) => item.id !== p.id));
      toast.show("Produit supprimé.", "success");
    } else {
      toast.show(result.error ?? "Impossible de supprimer ce produit.", "error");
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" ? p.active : !p.active);
      const matchesPhoto = photoFilter === "all" || (photoFilter === "with" ? p.hasPhoto : !p.hasPhoto);
      return matchesQuery && matchesStatus && matchesPhoto;
    });
  }, [products, query, statusFilter, photoFilter]);

  return (
    <div>
      <PageHeader
        title="Catalogue"
        subtitle={`${products.length} référence${products.length > 1 ? "s" : ""}`}
        action={<Link href="/admin/catalog/new" className="btn-primary">+ Ajouter un produit</Link>}
      />

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
        <div style={{ display: "flex", gap: 8 }}>
          <button className={`pill-filter ${photoFilter === "all" ? "active" : ""}`} onClick={() => setPhotoFilter("all")}>Toutes photos</button>
          <button className={`pill-filter ${photoFilter === "with" ? "active" : ""}`} onClick={() => setPhotoFilter("with")}>Avec photo</button>
          <button className={`pill-filter ${photoFilter === "without" ? "active" : ""}`} onClick={() => setPhotoFilter("without")}>Sans photo</button>
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
                  <th>Marque</th>
                  <th>Provenance</th>
                  <th>Photo</th>
                  <th>Prix indicatif</th>
                  <th>Statut</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
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
                    <td style={{ color: "var(--color-text-muted)" }}>{p.brand ?? "—"}</td>
                    <td style={{ color: "var(--color-text-muted)" }}>{p.origin ?? "—"}</td>
                    <td>
                      <span className={`status-dot ${p.hasPhoto ? "on" : "off"}`}>{p.hasPhoto ? "Oui" : "Non"}</span>
                    </td>
                    <td>{p.indicativePrice ? `${Number(p.indicativePrice).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })} / ${p.unit}` : "—"}</td>
                    <td><span className={`status-dot ${p.active ? "on" : "off"}`}>{p.active ? "Active" : "Désactivée"}</span></td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <Link href={`/admin/catalog/${p.id}`} className="icon-btn" title="Modifier" aria-label="Modifier">
                          <IconEdit />
                        </Link>
                        <button
                          type="button"
                          className="icon-btn danger"
                          title="Supprimer"
                          aria-label="Supprimer"
                          disabled={deletingId === p.id}
                          onClick={() => handleDelete(p)}
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
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
