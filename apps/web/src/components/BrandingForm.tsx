"use client";

import { useState } from "react";

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
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(initialSecondaryColor);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const contrast = contrastRatio(primaryColor, "#FFFFFF");
  const lowContrast = contrast < 3;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    const res = await fetch("/api/admin/branding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logoUrl, primaryColor, secondaryColor }),
    });
    setStatus(res.ok ? "saved" : "error");
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>URL du logo</label>
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
      <div className="card" style={{ padding: 16, background: primaryColor }}>
        <span style={{ color: "#fff", fontWeight: 700 }}>Aperçu — Marin Froid</span>
      </div>
      <button className="btn-primary" type="submit" disabled={status === "saving"}>
        {status === "saving" ? "Enregistrement..." : "Enregistrer"}
      </button>
      {status === "saved" && <p style={{ color: "var(--color-success)", fontSize: 13 }}>Personnalisation appliquée globalement.</p>}
      {status === "error" && <p style={{ color: "var(--color-danger)", fontSize: 13 }}>Erreur lors de l'enregistrement.</p>}
    </form>
  );
}
