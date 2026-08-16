"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { safeFetch } from "@/lib/safe-fetch";

const BENEFITS = [
  "Catalogue professionnel dédié",
  "Disponibilité en temps réel",
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
  const [authImageUrl, setAuthImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/branding")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authImageUrl) setAuthImageUrl(data.authImageUrl);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await safeFetch<{ redirectTo?: string }>("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!result.ok || !result.data) {
      setError(result.error ?? "Identifiants invalides.");
      return;
    }
    router.push(result.data.redirectTo ?? "/dashboard");
    router.refresh();
  }

  return (
    <main className="login-split">
      <div
        className="login-split-brand"
        style={{
          background: "linear-gradient(160deg, #0D1620 0%, #101720 55%, #12222A 100%)",
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
            background: "radial-gradient(circle at 78% 18%, rgba(20,190,180,0.22), transparent 55%), radial-gradient(circle at 8% 88%, rgba(255,90,78,0.14), transparent 48%)",
          }}
        />
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.01em" }}>Marin Froid</div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>Plateforme privée B2B</div>
        </div>

        <div style={{ position: "relative" }}>
          <h1 style={{ fontSize: 38, fontWeight: 750, letterSpacing: "-0.035em", lineHeight: 1.12, marginBottom: 28, maxWidth: 420 }}>
            Vos commandes professionnelles Marin Froid, en moins d'une minute.
          </h1>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 13 }}>
            {BENEFITS.map((b) => (
              <li key={b} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14.5, color: "#C7CDD6" }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "rgba(20,190,180,0.18)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3FD8CB" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
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
          <h2 style={{ fontSize: 28, fontWeight: 750, letterSpacing: "-0.03em", marginBottom: 6 }}>Bienvenue</h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: 14.5, marginBottom: 30 }}>
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
            {error && (
              <p style={{ color: "var(--color-danger)", fontSize: 13, background: "var(--color-danger-soft)", padding: "10px 14px", borderRadius: "var(--radius-md)", margin: 0 }}>
                {error}
              </p>
            )}
            <button className="btn-primary" type="submit" disabled={loading} style={{ padding: "14px 22px", fontSize: 15, marginTop: 4 }}>
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
