"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { safeFetch } from "@/lib/safe-fetch";
import { useToast } from "./Toast";

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  url: string;
}

interface ProductDocument {
  id: string;
  label: string;
  url: string;
}

interface ProductData {
  id: string;
  sku: string;
  name: string;
  categoryId: string | null;
  unit: string;
  origin: string | null;
  packaging: string | null;
  indicativePrice: string | null;
  storageInfo: string | null;
  validityInfo: string | null;
  specifications: string | null;
  description: string | null;
  active: boolean;
}

export function ProductForm({ existing, images: initialImages, documents: initialDocuments }: {
  existing?: ProductData;
  images?: ProductImage[];
  documents?: ProductDocument[];
}) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = !!existing;

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  const [sku, setSku] = useState(existing?.sku ?? "");
  const [name, setName] = useState(existing?.name ?? "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? "");
  const [unit, setUnit] = useState(existing?.unit ?? "unité");
  const [origin, setOrigin] = useState(existing?.origin ?? "");
  const [packaging, setPackaging] = useState(existing?.packaging ?? "");
  const [indicativePrice, setIndicativePrice] = useState(existing?.indicativePrice ?? "");
  const [storageInfo, setStorageInfo] = useState(existing?.storageInfo ?? "");
  const [validityInfo, setValidityInfo] = useState(existing?.validityInfo ?? "");
  const [specifications, setSpecifications] = useState(existing?.specifications ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [active, setActive] = useState(existing?.active ?? true);
  const [saving, setSaving] = useState(false);

  const [images, setImages] = useState<ProductImage[]>(initialImages ?? []);
  const [documents, setDocuments] = useState<ProductDocument[]>(initialDocuments ?? []);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newDocLabel, setNewDocLabel] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");

  useEffect(() => {
    safeFetch<{ categories: Category[] }>("/api/admin/catalog/categories").then((result) => {
      if (result.ok && result.data) setCategories(result.data.categories);
    });
  }, []);

  async function handleAddCategory() {
    if (!newCategoryName.trim()) return;
    const result = await safeFetch<{ category: Category }>("/api/admin/catalog/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCategoryName.trim() }),
    });
    if (result.ok && result.data) {
      setCategories((prev) => [...prev, result.data!.category]);
      setCategoryId(result.data.category.id);
      setNewCategoryName("");
      toast.show("Catégorie créée.", "success");
    } else {
      toast.show(result.error ?? "Impossible de créer la catégorie.", "error");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = { sku, name, categoryId: categoryId || null, unit, origin, packaging, indicativePrice: indicativePrice || null, storageInfo, validityInfo, specifications, description, active };

    const result = await safeFetch<{ product: { id: string } }>(
      isEdit ? `/api/admin/catalog/products/${existing!.id}` : "/api/admin/catalog/products",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    setSaving(false);
    if (!result.ok) {
      toast.show(result.error ?? "Erreur lors de l'enregistrement.", "error");
      return;
    }
    toast.show(isEdit ? "Produit mis à jour." : "Produit créé.", "success");
    if (!isEdit && result.data?.product) {
      router.push(`/admin/catalog/${result.data.product.id}`);
    } else {
      router.refresh();
    }
  }

  async function handleAddImage() {
    if (!isEdit || !newImageUrl.trim()) return;
    const result = await safeFetch<{ image: ProductImage }>(`/api/admin/catalog/products/${existing!.id}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newImageUrl.trim() }),
    });
    if (result.ok && result.data) {
      setImages((prev) => [...prev, result.data!.image]);
      setNewImageUrl("");
    } else {
      toast.show(result.error ?? "Impossible d'ajouter l'image.", "error");
    }
  }

  async function handleRemoveImage(id: string) {
    setImages((prev) => prev.filter((i) => i.id !== id));
    await safeFetch(`/api/admin/catalog/images/${id}`, { method: "DELETE" });
  }

  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !isEdit) return;
    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "products");
    const uploadResult = await safeFetch<{ url: string }>("/api/admin/upload", { method: "POST", body: formData });
    if (!uploadResult.ok || !uploadResult.data) {
      setUploadingImage(false);
      toast.show(uploadResult.error ?? "Impossible de téléverser l'image.", "error");
      return;
    }
    const result = await safeFetch<{ image: ProductImage }>(`/api/admin/catalog/products/${existing!.id}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: uploadResult.data.url }),
    });
    setUploadingImage(false);
    if (result.ok && result.data) {
      setImages((prev) => [...prev, result.data!.image]);
      toast.show("Image ajoutée.", "success");
    } else {
      toast.show(result.error ?? "Impossible d'ajouter l'image.", "error");
    }
  }

  async function handleAddDocument() {
    if (!isEdit || !newDocLabel.trim() || !newDocUrl.trim()) return;
    const result = await safeFetch<{ document: ProductDocument }>(`/api/admin/catalog/products/${existing!.id}/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newDocLabel.trim(), url: newDocUrl.trim() }),
    });
    if (result.ok && result.data) {
      setDocuments((prev) => [...prev, result.data!.document]);
      setNewDocLabel("");
      setNewDocUrl("");
    } else {
      toast.show(result.error ?? "Impossible d'ajouter le document.", "error");
    }
  }

  async function handleRemoveDocument(id: string) {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    await safeFetch(`/api/admin/catalog/documents/${id}`, { method: "DELETE" });
  }

  return (
    <div className={isEdit ? "grid-sidebar-340" : undefined} style={{ display: isEdit ? undefined : "grid", gridTemplateColumns: isEdit ? undefined : "1fr", gap: 24, alignItems: "start", maxWidth: 900 }}>
      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Informations générales</h2>
          <div className="grid-split-2" style={{ gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Référence (SKU)</label>
              <input className="input" value={sku} onChange={(e) => setSku(e.target.value)} required />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Nom</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Catégorie</label>
            <div style={{ display: "flex", gap: 8 }}>
              <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Aucune</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <input className="input" placeholder="Nouvelle catégorie" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} style={{ fontSize: 12.5 }} />
              <button type="button" className="btn-secondary" style={{ fontSize: 12.5, padding: "8px 12px" }} onClick={handleAddCategory}>Créer</button>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Description</label>
            <textarea className="input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} style={{ resize: "vertical" }} />
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Conditionnement & prix</h2>
          <div className="grid-split-3" style={{ gap: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Unité</label>
              <input className="input" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Conditionnement</label>
              <input className="input" value={packaging} onChange={(e) => setPackaging(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Prix indicatif (€)</label>
              <input className="input" type="number" step="0.01" value={indicativePrice} onChange={(e) => setIndicativePrice(e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Détails complémentaires</h2>
          <div className="grid-split-2" style={{ gap: 10, marginBottom: 10 }}>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Provenance</label>
              <input className="input" value={origin} onChange={(e) => setOrigin(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Stockage</label>
              <input className="input" value={storageInfo} onChange={(e) => setStorageInfo(e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Validité</label>
            <input className="input" value={validityInfo} onChange={(e) => setValidityInfo(e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--color-text-muted)", display: "block", marginBottom: 4 }}>Caractéristiques techniques</label>
            <textarea className="input" rows={2} value={specifications} onChange={(e) => setSpecifications(e.target.value)} style={{ resize: "vertical" }} />
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          Produit actif (visible dans le catalogue client)
        </label>

        <div>
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : isEdit ? "Enregistrer les modifications" : "Créer le produit"}
          </button>
        </div>
      </form>

      {isEdit && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Images</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))", gap: 8, marginBottom: 10 }}>
              {images.map((img) => (
                <div key={img.id} style={{ position: "relative" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }} />
                  <button
                    type="button"
                    className="icon-btn danger"
                    style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, background: "rgba(255,255,255,0.9)" }}
                    onClick={() => handleRemoveImage(img.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {images.length === 0 && <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 10 }}>Aucune image.</p>}

            <label className="btn-secondary" style={{ fontSize: 12.5, cursor: "pointer", display: "inline-block", marginBottom: 10 }}>
              {uploadingImage ? "Envoi..." : "Téléverser une photo"}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleUploadImage} disabled={uploadingImage} style={{ display: "none" }} />
            </label>

            <div style={{ display: "flex", gap: 6 }}>
              <input className="input" placeholder="ou coller une URL https://..." value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} style={{ fontSize: 12 }} />
              <button type="button" className="btn-secondary" style={{ fontSize: 12, padding: "8px 12px" }} onClick={handleAddImage}>+</button>
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Documents</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
              {documents.map((doc) => (
                <div key={doc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{doc.label}</span>
                  <button type="button" className="icon-btn danger" style={{ width: 24, height: 24, marginLeft: 8 }} onClick={() => handleRemoveDocument(doc.id)}>×</button>
                </div>
              ))}
              {documents.length === 0 && <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Aucun document.</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <input className="input" placeholder="Libellé" value={newDocLabel} onChange={(e) => setNewDocLabel(e.target.value)} style={{ fontSize: 12 }} />
              <input className="input" placeholder="https://..." value={newDocUrl} onChange={(e) => setNewDocUrl(e.target.value)} style={{ fontSize: 12 }} />
              <button type="button" className="btn-secondary" style={{ fontSize: 12, padding: "8px 12px" }} onClick={handleAddDocument}>Ajouter le document</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
