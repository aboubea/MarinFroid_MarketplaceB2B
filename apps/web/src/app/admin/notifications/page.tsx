import { desc, eq } from "drizzle-orm";
import { requireMarinFroidAdminSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { emailLogs, orders } from "@marin-froid/db";
import { AdminShell } from "@/components/AdminShell";
import { NotificationSettings } from "@/components/NotificationSettings";
import { PageHeader } from "@/components/PageHeader";

const TEMPLATE_LABELS: Record<string, string> = {
  order_created: "Commande créée",
  order_status_updated: "Changement de statut",
  invitation_sent: "Invitation envoyée",
  account_activated: "Compte activé",
  password_reset: "Réinitialisation mot de passe",
};

export default async function AdminNotificationsPage() {
  const session = await requireMarinFroidAdminSession();
  const db = getDb();

  const logs = await db.query.emailLogs.findMany({
    orderBy: [desc(emailLogs.createdAt)],
    limit: 50,
  });

  const orderIds = [...new Set(logs.map((l) => l.relatedOrderId).filter((id): id is string => !!id))];
  const relatedOrders = orderIds.length
    ? await db.query.orders.findMany({ where: (o, { inArray }) => inArray(o.id, orderIds) })
    : [];
  const orderById = new Map(relatedOrders.map((o) => [o.id, o]));

  const sentCount = logs.filter((l) => l.status === "sent").length;
  const failedCount = logs.filter((l) => l.status === "failed").length;
  const apiKeyConfigured = !!process.env.RESEND_API_KEY;

  return (
    <AdminShell fullName={session.fullName} role={session.role}>
      <PageHeader title="Emails & notifications" subtitle="Choisissez qui reçoit un email pour chaque événement métier." />
      <NotificationSettings />

      <h2 className="section-title" style={{ marginTop: 32 }}>Statut d&apos;envoi</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: apiKeyConfigured ? "var(--color-success)" : "var(--color-danger, #DC2626)" }}>
            {apiKeyConfigured ? "Actif" : "Non configuré"}
          </div>
          <div className="stat-label">Resend (RESEND_API_KEY)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{sentCount}</div>
          <div className="stat-label">Envoyés (50 derniers)</div>
        </div>
        <div className="stat-card" style={failedCount > 0 ? { borderColor: "var(--color-danger, #DC2626)" } : undefined}>
          <div className="stat-value" style={failedCount > 0 ? { color: "var(--color-danger, #DC2626)" } : undefined}>{failedCount}</div>
          <div className="stat-label">Échecs (50 derniers)</div>
        </div>
      </div>

      <h2 className="section-title">Historique des envois</h2>
      <div className="card" style={{ overflow: "hidden" }}>
        {logs.length === 0 ? (
          <div style={{ padding: 16, fontSize: 12.5, color: "var(--color-text-muted)" }}>Aucun email envoyé pour l'instant.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Destinataire</th>
                <th>Type</th>
                <th>Commande</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.toEmail}</td>
                  <td style={{ color: "var(--color-text-muted)" }}>{TEMPLATE_LABELS[log.template] ?? log.template}</td>
                  <td style={{ color: "var(--color-text-muted)" }}>
                    {log.relatedOrderId ? orderById.get(log.relatedOrderId)?.reference ?? "—" : "—"}
                  </td>
                  <td>
                    <span className={`badge ${log.status === "sent" ? "badge-completed" : "badge-cancelled"}`}>
                      {log.status === "sent" ? "Envoyé" : "Échec"}
                    </span>
                  </td>
                  <td style={{ color: "var(--color-text-muted)" }}>{new Date(log.createdAt).toLocaleString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  );
}
