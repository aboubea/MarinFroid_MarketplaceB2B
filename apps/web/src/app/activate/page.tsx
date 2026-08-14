"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, fullName, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Impossible d'activer le compte.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="card" style={{ width: 380, padding: 32 }}>
        <h1 style={{ fontSize: 20, marginBottom: 4 }}>Activer votre compte</h1>
        <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 24 }}>
          Choisissez vos identifiants pour accéder au portail Marin Froid.
        </p>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="input" placeholder="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          <input className="input" type="password" placeholder="Choisir un mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          {error && <p style={{ color: "var(--color-danger)", fontSize: 13 }}>{error}</p>}
          <button className="btn-primary" type="submit" disabled={loading || !token}>
            {loading ? "Activation..." : "Activer mon compte"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={null}>
      <ActivateForm />
    </Suspense>
  );
}
