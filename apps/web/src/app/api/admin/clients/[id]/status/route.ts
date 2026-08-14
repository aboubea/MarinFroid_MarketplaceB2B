import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations } from "@marin-froid/db";
import { logActivity } from "@/lib/activity";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireMarinFroidSession();
  const { status } = await request.json();
  if (status !== "active" && status !== "suspended") {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }
  const db = getDb();
  const org = await db.query.organizations.findFirst({ where: eq(organizations.id, id) });
  await db.update(organizations).set({ status }).where(eq(organizations.id, id));

  await logActivity({
    actorUserId: session.userId,
    actorLabel: session.fullName,
    organizationId: id,
    action: status === "suspended" ? "client_suspended" : "client_reactivated",
    entityType: "organization",
    entityId: id,
    summary: `Société « ${org?.name ?? id} » ${status === "suspended" ? "suspendue" : "réactivée"}`,
  });

  return NextResponse.json({ ok: true });
}
