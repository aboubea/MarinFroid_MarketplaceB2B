"use client";

import { useState } from "react";
import { safeFetch } from "@/lib/safe-fetch";
import { AuthSplitShell } from "@/components/AuthSplitShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await safeFetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <AuthSplitShell
      headline="On vous aide à retrouver l'accès à votre compte."
      description="Un lien de réinitialisation sécurisé vous sera envoyé par e-mail, valable une heure."
    >
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Mot de passe oublié</h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 24 }}>
        Recevez un lien de réinitialisation par e-mail.
      </p>
      {sent ? (
        <div className="card success-pop" style={{ padding: 16, background: "#F0FDF4", borderColor: "var(--color-success)", fontSize: 13.5, display: "flex", alignItems: "center", gap: 10 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Si un compte existe pour cette adresse, un e-mail a été envoyé.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="input" type="email" autoComplete="email" placeholder="Adresse e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Envoi..." : "Envoyer le lien"}</button>
        </form>
      )}
      <p style={{ marginTop: 20, fontSize: 13, color: "var(--color-text-muted)" }}>
        <a href="/login" style={{ fontWeight: 600, color: "var(--color-text)" }}>← Retour à la connexion</a>
      </p>
    </AuthSplitShell>
  );
}
