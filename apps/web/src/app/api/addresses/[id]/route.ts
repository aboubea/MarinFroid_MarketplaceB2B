import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { deliveryAddresses } from "@marin-froid/db";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || !session.organizationId) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const db = getDb();
  await db
    .delete(deliveryAddresses)
    .where(and(eq(deliveryAddresses.id, id), eq(deliveryAddresses.organizationId, session.organizationId)));
  return NextResponse.json({ ok: true });
}
