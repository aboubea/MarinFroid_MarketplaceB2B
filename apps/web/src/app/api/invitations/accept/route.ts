import { NextResponse } from "next/server";
import { eq, gt, and } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { invitations, users, organizations } from "@marin-froid/db";
import { hashPassword, createSession } from "@/lib/auth";
import { createEmailClient, accountActivatedEmail } from "@marin-froid/email";

export async function POST(request: Request) {
  const { token, fullName, password } = await request.json();
  if (!token || !fullName || !password) {
    return NextResponse.json({ error: "Champs requis manquants." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
  }

  const db = getDb();
  const invitation = await db.query.invitations.findFirst({
    where: and(eq(invitations.token, token), eq(invitations.status, "pending"), gt(invitations.expiresAt, new Date())),
  });
  if (!invitation) {
    return NextResponse.json({ error: "Invitation invalide ou expirée." }, { status: 400 });
  }

  const [user] = await db
    .insert(users)
    .values({
      email: invitation.email,
      passwordHash: hashPassword(password),
      fullName,
      role: invitation.role,
      organizationId: invitation.organizationId,
    })
    .returning();

  await db.update(invitations).set({ status: "accepted" }).where(eq(invitations.id, invitation.id));
  await db.update(organizations).set({ status: "active" }).where(eq(organizations.id, invitation.organizationId));

  await createSession({
    userId: user.id,
    organizationId: user.organizationId,
    role: user.role,
    fullName: user.fullName,
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const emailClient = createEmailClient(apiKey);
    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
    const template = accountActivatedEmail({ fullName, loginUrl: `${baseUrl}/login` });
    await emailClient.send({ to: user.email, ...template }).catch((err) => console.error("email error", err));
  }

  return NextResponse.json({ ok: true });
}
