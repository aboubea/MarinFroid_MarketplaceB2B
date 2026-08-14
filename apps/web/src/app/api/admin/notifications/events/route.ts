import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { notificationEventSettings } from "@marin-froid/db";

const DEFAULT_EVENTS: { eventKey: string; label: string }[] = [
  { eventKey: "order_created", label: "Commande créée" },
  { eventKey: "order_status_updated", label: "Changement de statut" },
  { eventKey: "invitation_sent", label: "Invitation envoyée" },
  { eventKey: "account_activated", label: "Compte activé" },
  { eventKey: "password_reset", label: "Réinitialisation mot de passe" },
];

export async function GET() {
  await requireMarinFroidSession();
  const db = getDb();
  const existing = await db.query.notificationEventSettings.findMany();
  const existingKeys = new Set(existing.map((e) => e.eventKey));
  const missing = DEFAULT_EVENTS.filter((e) => !existingKeys.has(e.eventKey));
  if (missing.length > 0) {
    await db.insert(notificationEventSettings).values(missing);
  }
  const all = missing.length > 0 ? await db.query.notificationEventSettings.findMany() : existing;
  return NextResponse.json({ events: all });
}

export async function POST(request: Request) {
  await requireMarinFroidSession();
  const { id, customerEmailEnabled, opsEmailEnabled } = await request.json();
  if (!id) return NextResponse.json({ error: "id requis." }, { status: 400 });

  const db = getDb();
  await db
    .update(notificationEventSettings)
    .set({ customerEmailEnabled, opsEmailEnabled, updatedAt: new Date() })
    .where(eq(notificationEventSettings.id, id));

  return NextResponse.json({ ok: true });
}
