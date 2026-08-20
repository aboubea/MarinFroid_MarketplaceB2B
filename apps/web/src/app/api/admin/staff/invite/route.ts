import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { invitations, organizations, users } from "@marin-froid/db";
import { createEmailClient, invitationEmail, opsRecipientAddedEmail } from "@marin-froid/email";
import { logActivity } from "@/lib/activity";
import { sendTrackedEmail } from "@/lib/email-log";
import { getBaseUrl } from "@/lib/base-url";

const ALLOWED_ROLES = ["mf_admin", "mf_ops"] as const;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "mf_admin" || !session.organizationId) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const { email, role, fullName } = await request.json();
  if (!email || !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  }

  const db = getDb();
  const organization = await db.query.organizations.findFirst({ where: eq(organizations.id, session.organizationId) });
  if (!organization) return NextResponse.json({ error: "Société introuvable." }, { status: 404 });

  const normalizedEmail = email.toLowerCase().trim();

  // mf_ops has no interface to activate into — create the account directly
  // (no password, never logs in) so it shows up as an order-recap
  // recipient, instead of sending an "activate your account" link that
  // would lead nowhere.
  if (role === "mf_ops") {
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json({ error: "Le nom est requis pour ce rôle." }, { status: 400 });
    }
    const existing = await db.query.users.findFirst({ where: eq(users.email, normalizedEmail) });
    if (existing) return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 400 });

    await db.insert(users).values({
      email: normalizedEmail,
      fullName: fullName.trim(),
      role: "mf_ops",
      organizationId: null,
      active: true,
    });

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const emailClient = createEmailClient(apiKey);
      const template = opsRecipientAddedEmail({ fullName: fullName.trim() });
      await sendTrackedEmail(emailClient, "invitation_sent", { to: normalizedEmail, ...template });
    }

    await logActivity({
      actorUserId: session.userId,
      actorLabel: session.fullName,
      organizationId: session.organizationId,
      action: "invitation_sent",
      entityType: "user",
      summary: `${fullName.trim()} ajouté(e) comme destinataire des récapitulatifs de commande (${normalizedEmail})`,
    });

    return NextResponse.json({ ok: true });
  }

  const existingUser = await db.query.users.findFirst({ where: eq(users.email, normalizedEmail) });
  if (existingUser) return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 400 });

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await db.insert(invitations).values({
    email: normalizedEmail,
    organizationId: session.organizationId,
    role,
    token,
    expiresAt,
    invitedByUserId: session.userId,
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const emailClient = createEmailClient(apiKey);
    const baseUrl = getBaseUrl(request);
    const template = invitationEmail({
      organizationName: organization.name,
      activationUrl: `${baseUrl}/activate?token=${token}`,
    });
    await sendTrackedEmail(emailClient, "invitation_sent", { to: normalizedEmail, ...template });
  }

  await logActivity({
    actorUserId: session.userId,
    actorLabel: session.fullName,
    organizationId: session.organizationId,
    action: "invitation_sent",
    entityType: "user",
    summary: `Collaborateur Marin Froid invité (${normalizedEmail}, administrateur)`,
  });

  return NextResponse.json({ ok: true });
}
