"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setSent(true);
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: 380, padding: 32 }}>
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>Mot de passe oublié</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 24 }}>
          Recevez un lien de réinitialisation par e-mail.
        </p>
        {sent ? (
          <p style={{ fontSize: 14 }}>Si un compte existe pour cette adresse, un e-mail a été envoyé.</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input className="input" type="email" placeholder="Adresse e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button className="btn-primary" type="submit">Envoyer le lien</button>
          </form>
        )}
      </div>
    </main>
  );
}
