import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { invitations, organizations } from "@marin-froid/db";

export async function GET() {
  await requireMarinFroidSession();
  const db = getDb();
  const list = await db
    .select({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      status: invitations.status,
      expiresAt: invitations.expiresAt,
      createdAt: invitations.createdAt,
      organizationName: organizations.name,
    })
    .from(invitations)
    .innerJoin(organizations, eq(organizations.id, invitations.organizationId))
    .orderBy(desc(invitations.createdAt));

  return NextResponse.json({ invitations: list });
}
