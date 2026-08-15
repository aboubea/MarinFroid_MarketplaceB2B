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
  initialPrimaryColor,
  initialSecondaryColor,
}: {
  initialLogoUrl: string;
  initialPrimaryColor: string;
  initialSecondaryColor: string;
}) {
  const toast = useToast();
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const contrast = contrastRatio(primaryColor, "#FFFFFF");
  const lowContrast = contrast < 3;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await safeFetch("/api/admin/branding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl, primaryColor, secondaryColor }),
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
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Couleur principale</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
          <input className="input" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
        </div>
      </div>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Couleur secondaire</label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
          <input className="input" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
        </div>
      </div>
      {lowContrast && (
        <p style={{ fontSize: 12, color: "var(--color-warning)" }}>
          Attention : le contraste de la couleur principale sur fond clair est faible, cela peut nuire à la lisibilité.
        </p>
      )}
      <div className="card" style={{ padding: 16, background: primaryColor, display: "flex", alignItems: "center", gap: 10 }}>
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo" style={{ height: 24, maxWidth: 80, objectFit: "contain" }} />
        )}
        <span style={{ color: "#fff", fontWeight: 700 }}>Aperçu — Marin Froid</span>
      </div>
      <button className="btn-primary" type="submit" disabled={saving}>
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
