import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users, organizations } from "@marin-froid/db";
import { verifyPassword } from "@/lib/auth";
import { signMobileToken } from "@/lib/mobile-auth";

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

  const organization = user.organizationId
    ? await db.query.organizations.findFirst({ where: eq(organizations.id, user.organizationId) })
    : null;

  if (organization && organization.status !== "active") {
    return NextResponse.json({ error: "Compte société inactif." }, { status: 403 });
  }

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

  const token = await signMobileToken({
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
    fullName: user.fullName,
  });

  return NextResponse.json({
    token,
    user: { fullName: user.fullName, role: user.role, organizationName: organization?.name ?? "Marin Froid" },
  });
}
