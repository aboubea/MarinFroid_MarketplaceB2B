import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations } from "@marin-froid/db";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireMarinFroidSession();
  const { status } = await request.json();
  if (status !== "active" && status !== "suspended") {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }
  const db = getDb();
  await db.update(organizations).set({ status }).where(eq(organizations.id, id));
  return NextResponse.json({ ok: true });
}
