import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/AdminShell";
import { BrandingForm } from "@/components/BrandingForm";
import { PageHeader } from "@/components/PageHeader";

export default async function AdminBrandingPage() {
  const session = await requireMarinFroidAdminSession();
  const db = getDb();
  const branding = await db.query.brandingSettings.findFirst();

  return (
    <AdminShell fullName={session.fullName} role={session.role}>
      <PageHeader title="Personnalisation" subtitle="Logo et couleurs appliqués à l'ensemble de la plateforme." />
      <div className="grid-aside-360">
        <div className="card" style={{ padding: 24 }}>
          <BrandingForm
            initialLogoUrl={branding?.logoUrl ?? ""}
            initialPrimaryColor={branding?.primaryColor ?? "#0E7C7B"}
            initialSecondaryColor={branding?.secondaryColor ?? "#FF5A4E"}
          />
        </div>
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 14 }}>
            Où ces couleurs s&apos;appliquent
          </div>
          <ul style={{ fontSize: 13.5, color: "var(--color-text-muted)", lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
            <li>La couleur d&apos;action habille les boutons principaux, les liens et les champs actifs sur tout le portail.</li>
            <li>La couleur d&apos;accent marque la validation de commande et le repère de navigation active dans la sidebar.</li>
            <li>Le logo apparaît dans l&apos;en-tête de connexion et les emails envoyés aux clients.</li>
          </ul>
        </div>
      </div>
    </AdminShell>
  );
}
