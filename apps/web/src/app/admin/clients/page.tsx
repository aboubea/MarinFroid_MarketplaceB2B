import Link from "next/link";
import { desc } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations } from "@marin-froid/db";
import { AdminShell } from "@/components/AdminShell";
import { InviteClientForm } from "@/components/InviteClientForm";

export default async function AdminClientsPage() {
  const session = await requireMarinFroidSession();
  const db = getDb();
  const list = await db.query.organizations.findMany({ orderBy: [desc(organizations.createdAt)] });

  return (
    <AdminShell fullName={session.fullName}>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>Clients</h1>

      <div className="card" style={{ padding: 20, marginBottom: 32 }}>
        <h2 style={{ fontSize: 15, marginBottom: 12 }}>Inviter une nouvelle société</h2>
        <InviteClientForm />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((o) => (
          <Link key={o.id} href={`/admin/clients/${o.id}`} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{o.name}</div>
            <span className={`badge ${o.status === "active" ? "badge-completed" : o.status === "suspended" ? "badge-cancelled" : "badge-submitted"}`}>
              {o.status}
            </span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
