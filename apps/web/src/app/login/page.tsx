"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const BENEFITS = [
  "Produits surgelés & frais",
  "Stocks en temps réel",
  "Commandes express",
  "Livraison planifiée",
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Identifiants invalides.");
      return;
    }
    const { redirectTo } = await res.json();
    router.push(redirectTo ?? "/dashboard");
    router.refresh();
  }

  return (
    <main className="login-split">
      <div
        className="login-split-brand"
        style={{
          background: "linear-gradient(160deg, #0B1220 0%, #0F172A 55%, #14213A 100%)",
          color: "#fff",
          padding: "64px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 80% 20%, rgba(56,189,248,0.16), transparent 55%), radial-gradient(circle at 10% 90%, rgba(56,189,248,0.10), transparent 45%)",
          }}
        />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>Marin Froid</div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>Plateforme privée B2B</div>
        </div>

        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 24, maxWidth: 380 }}>
            Le réassort de vos produits de la mer, en moins d'une minute.
          </h1>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {BENEFITS.map((b) => (
              <li key={b} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#CBD5E1" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-secondary)" }} />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ position: "relative", fontSize: 12, color: "#64748B" }}>
          Accès réservé aux sociétés autorisées.
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Bienvenue</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 28 }}>
            Connectez-vous à votre espace professionnel.
          </p>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input
              className="input"
              type="email"
              placeholder="Adresse e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "2px 0 4px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-text-muted)" }}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                Se souvenir de moi
              </label>
              <a href="/forgot-password" style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Mot de passe oublié ?</a>
            </div>
            {error && <p style={{ color: "var(--color-danger)", fontSize: 13 }}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
          <p style={{ marginTop: 20, fontSize: 13, color: "var(--color-text-muted)" }}>
            Reçu une invitation ?{" "}
            <a href="/activate" style={{ fontWeight: 600, color: "var(--color-text)" }}>Activer mon compte</a>
          </p>
        </div>
      </div>
    </main>
  );
}
