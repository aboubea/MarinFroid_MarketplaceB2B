"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeFetch } from "@/lib/safe-fetch";
import { AuthSplitShell } from "@/components/AuthSplitShell";

function ResetForm() {
  const router = useRouter();
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await safeFetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Erreur.");
      return;
    }
    router.push("/login");
  }

  return (
    <AuthSplitShell
      headline="Choisissez un nouveau mot de passe."
      description="Il vous permettra de vous reconnecter immédiatement à votre espace professionnel."
    >
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 24 }}>Nouveau mot de passe</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input className="input" type="password" placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        <input className="input" type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
        {error && <p style={{ color: "var(--color-danger)", fontSize: 13 }}>{error}</p>}
        <button className="btn-primary" type="submit" disabled={loading || !token}>
          {loading ? "Enregistrement..." : "Réinitialiser"}
        </button>
      </form>
    </AuthSplitShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
