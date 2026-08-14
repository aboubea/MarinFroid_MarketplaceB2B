import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@marin-froid/db";
import { verifyPassword, createSession, dashboardPathForRole } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: "Email et mot de passe requis." }, { status: 400 });
  }

  const db = getDb();
  const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase().trim()) });

  if (!user || !user.active || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Identifiants invalides." }, { status: 401 });
  }

  await createSession({
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
    fullName: user.fullName,
  });

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  const redirectTo = dashboardPathForRole(user.role);
  return NextResponse.json({ redirectTo });
}
