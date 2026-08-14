import { desc, eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, organizations } from "@marin-froid/db";

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  await requireMarinFroidSession();
  const db = getDb();
  const list = await db
    .select({
      reference: orders.reference,
      status: orders.status,
      createdAt: orders.createdAt,
      organizationName: organizations.name,
    })
    .from(orders)
    .innerJoin(organizations, eq(organizations.id, orders.organizationId))
    .orderBy(desc(orders.createdAt));

  const header = ["Référence", "Société", "Statut", "Date"].join(",");
  const rows = list.map((o) =>
    [o.reference, csvEscape(o.organizationName), o.status, new Date(o.createdAt).toLocaleString("fr-FR")].join(",")
  );
  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="commandes-marin-froid-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
