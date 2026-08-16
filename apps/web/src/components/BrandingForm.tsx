"use client";

import { useState } from "react";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(a: string, b: string): number {
  const [l1, l2] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

export function BrandingForm({
  initialLogoUrl,
  initialAuthImageUrl,
  initialPrimaryColor,
  initialSecondaryColor,
}: {
  initialLogoUrl: string;
  initialAuthImageUrl: string;
  initialPrimaryColor: string;
  initialSecondaryColor: string;
}) {
  const toast = useToast();
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [authImageUrl, setAuthImageUrl] = useState(initialAuthImageUrl);
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingAuthImage, setUploadingAuthImage] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const result = await safeFetch<{ url: string }>("/api/admin/upload", { method: "POST", body: formData });
    setUploading(false);
    if (result.ok && result.data) {
      setLogoUrl(result.data.url);
      toast.show("Logo téléversé.", "success");
    } else {
      toast.show(result.error ?? "Impossible de téléverser le logo.", "error");
    }
  }

  async function handleAuthImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingAuthImage(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "auth");
    const result = await safeFetch<{ url: string }>("/api/admin/upload", { method: "POST", body: formData });
    setUploadingAuthImage(false);
    if (result.ok && result.data) {
      setAuthImageUrl(result.data.url);
      toast.show("Image téléversée.", "success");
    } else {
      toast.show(result.error ?? "Impossible de téléverser l'image.", "error");
    }
  }

  const contrast = contrastRatio(primaryColor, "#FFFFFF");
  const lowContrast = contrast < 3;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await safeFetch("/api/admin/branding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl, authImageUrl, primaryColor, secondaryColor }),
    });
    setSaving(false);
    if (result.ok) {
      toast.show("Personnalisation appliquée globalement.", "success");
    } else {
      toast.show(result.error ?? "Erreur lors de l'enregistrement.", "error");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Logo</label>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" style={{ height: 40, maxWidth: 120, objectFit: "contain", borderRadius: "var(--radius-sm)", background: "var(--color-bg)", padding: 4 }} />
          )}
          <label className="btn-secondary" style={{ fontSize: 12.5, cursor: "pointer" }}>
            {uploading ? "Envoi..." : "Téléverser un fichier"}
            <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={handleFileChange} disabled={uploading} style={{ display: "none" }} />
          </label>
        </div>
        <input className="input" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 2 }}>Image de connexion</label>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "0 0 8px" }}>
          Illustration affichée à gauche des pages de connexion et d&apos;activation de compte. Laissez vide pour garder le dégradé par défaut.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          {authImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={authImageUrl} alt="Image de connexion" style={{ height: 56, width: 90, objectFit: "cover", borderRadius: "var(--radius-sm)", background: "var(--color-bg)" }} />
          )}
          <label className="btn-secondary" style={{ fontSize: 12.5, cursor: "pointer" }}>
            {uploadingAuthImage ? "Envoi..." : "Téléverser une image"}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleAuthImageChange} disabled={uploadingAuthImage} style={{ display: "none" }} />
          </label>
          {authImageUrl && (
            <button type="button" className="btn-secondary" style={{ fontSize: 12.5 }} onClick={() => setAuthImageUrl("")}>
              Retirer
            </button>
          )}
        </div>
        <input className="input" value={authImageUrl} onChange={(e) => setAuthImageUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 2 }}>Couleur d&apos;action</label>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "0 0 6px" }}>
          Boutons « Ajouter au panier », liens et champs actifs.
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
          <input className="input" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
        </div>
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 2 }}>Couleur d&apos;accent</label>
        <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "0 0 6px" }}>
          Validation de commande et repère de navigation actif.
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
          <input className="input" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
        </div>
      </div>
      {lowContrast && (
        <p style={{ fontSize: 12, color: "var(--color-warning)", background: "var(--color-warning-soft)", padding: "10px 12px", borderRadius: "var(--radius-md)", margin: 0 }}>
          Attention : le contraste de la couleur d&apos;action sur fond clair est faible, le texte blanc des boutons risque d&apos;être peu lisible.
        </p>
      )}

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Aperçu</div>
        <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="Logo" style={{ height: 26, maxWidth: 90, objectFit: "contain" }} />
            )}
            <span style={{ fontWeight: 700, letterSpacing: "-0.02em" }}>Marin Froid</span>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="btn-primary" style={{ background: primaryColor, boxShadow: "none" }}>
              Ajouter au panier
            </button>
            <button type="button" className="btn-accent" style={{ background: secondaryColor, boxShadow: "none" }}>
              Valider la commande
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            setPrimaryColor("#0E7C7B");
            setSecondaryColor("#FF5A4E");
          }}
        >
          Couleurs recommandées
        </button>
      </div>
    </form>
  );
}
