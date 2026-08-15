import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { AdminShell } from "@/components/AdminShell";
import { BrandingForm } from "@/components/BrandingForm";

export default async function AdminBrandingPage() {
  const session = await requireMarinFroidAdminSession();
  const db = getDb();
  const branding = await db.query.brandingSettings.findFirst();

  return (
    <AdminShell fullName={session.fullName} role={session.role}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Personnalisation</h1>
      <div className="card" style={{ padding: 24, maxWidth: 480 }}>
        <BrandingForm
          initialLogoUrl={branding?.logoUrl ?? ""}
          initialPrimaryColor={branding?.primaryColor ?? "#0F172A"}
          initialSecondaryColor={branding?.secondaryColor ?? "#38BDF8"}
        />
      </div>
    </AdminShell>
  );
}
