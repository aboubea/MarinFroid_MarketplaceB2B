import { NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { users } from "@marin-froid/db";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "mf_admin" || !session.organizationId) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }
  const db = getDb();
  const staff = await db.query.users.findMany({
    where: and(eq(users.organizationId, session.organizationId), inArray(users.role, ["mf_admin", "mf_ops"])),
  });
  return NextResponse.json({
    users: staff.map((u) => ({ id: u.id, fullName: u.fullName, email: u.email, role: u.role, active: u.active })),
  });
}
