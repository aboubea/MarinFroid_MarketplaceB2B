import { requireClientSession } from "@/lib/session-guard";
import { AppShell } from "@/components/AppShell";

export default async function AccountPage() {
  const { session, organization } = await requireClientSession();

  return (
    <AppShell fullName={session.fullName} organizationName={organization.name}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Compte</h1>
      <div className="card" style={{ padding: 24, maxWidth: 480 }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Nom</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{session.fullName}</div>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Société</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{organization.name}</div>
        </div>
        <a href="/forgot-password" style={{ fontSize: 13, fontWeight: 600 }}>Changer mon mot de passe</a>
      </div>
    </AppShell>
  );
}
