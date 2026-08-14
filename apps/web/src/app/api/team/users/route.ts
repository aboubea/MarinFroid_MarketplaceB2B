import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@marin-froid/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "org_admin" || !session.organizationId) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  const db = getDb();
  const orgUsers = await db.query.users.findMany({ where: eq(users.organizationId, session.organizationId) });
  return NextResponse.json({
    users: orgUsers.map((u) => ({ id: u.id, fullName: u.fullName, email: u.email, role: u.role, active: u.active })),
  });
}
