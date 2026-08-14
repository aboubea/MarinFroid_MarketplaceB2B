"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeFetch } from "@/lib/safe-fetch";
import { AuthSplitShell } from "@/components/AuthSplitShell";

function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [invite, setInvite] = useState<{ email: string; organizationName: string } | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setInviteError("Lien d'invitation manquant.");
      return;
    }
    safeFetch<{ email: string; organizationName: string }>(`/api/invitations/lookup?token=${token}`).then((result) => {
      if (result.ok && result.data) {
        setInvite(result.data);
      } else {
        setInviteError(result.error ?? "Invitation invalide ou expirée.");
      }
    });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    setError(null);
    const result = await safeFetch("/api/invitations/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, fullName, password }),
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Impossible d'activer le compte.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthSplitShell
      headline="Bienvenue dans votre espace professionnel."
      description="Activez votre compte pour accéder au catalogue, passer vos commandes et suivre leur préparation en temps réel."
    >
      <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>Activez votre compte</h2>
      <p style={{ color: "var(--color-text-muted)", fontSize: 14, marginBottom: 24 }}>
        Choisissez vos identifiants pour accéder au portail Marin Froid.
      </p>

      {inviteError ? (
        <p style={{ color: "var(--color-danger)", fontSize: 13.5 }}>{inviteError}</p>
      ) : (
        <>
          {invite && (
            <div className="card" style={{ padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
              <div style={{ color: "var(--color-text-muted)" }}>Invitation pour</div>
              <div style={{ fontWeight: 600 }}>{invite.email}</div>
              <div style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
                Société : <strong style={{ color: "var(--color-text)" }}>{invite.organizationName}</strong>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input className="input" placeholder="Prénom et nom" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            <input className="input" type="password" placeholder="Choisir un mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            <input className="input" type="password" placeholder="Confirmer le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} />
            {error && <p style={{ color: "var(--color-danger)", fontSize: 13 }}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading || !token || !invite}>
              {loading ? "Activation..." : "Activer mon compte"}
            </button>
          </form>
        </>
      )}
    </AuthSplitShell>
  );
}

export default function ActivatePage() {
  return (
    <Suspense fallback={null}>
      <ActivateForm />
    </Suspense>
  );
}
