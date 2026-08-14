import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { invitations, organizations } from "@marin-froid/db";
import { createEmailClient, invitationEmail } from "@marin-froid/email";
import { isNotificationEnabled } from "@/lib/notification-settings";
import { logActivity } from "@/lib/activity";
import { sendTrackedEmail } from "@/lib/email-log";

const ALLOWED_ROLES = ["org_buyer", "org_viewer"] as const;

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "org_admin" || !session.organizationId) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const { email, fullNameHint, role } = await request.json();
  if (!email || !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: "Champs invalides." }, { status: 400 });
  }

  const db = getDb();
  const organization = await db.query.organizations.findFirst({ where: eq(organizations.id, session.organizationId) });
  if (!organization) return NextResponse.json({ error: "Société introuvable." }, { status: 404 });

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  await db.insert(invitations).values({
    email: email.toLowerCase().trim(),
    organizationId: session.organizationId,
    role,
    token,
    expiresAt,
    invitedByUserId: session.userId,
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && (await isNotificationEnabled("invitation_sent", "customer"))) {
    const emailClient = createEmailClient(apiKey);
    const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
    const template = invitationEmail({
      organizationName: organization.name,
      activationUrl: `${baseUrl}/activate?token=${token}`,
    });
    await sendTrackedEmail(emailClient, "invitation_sent", { to: email, ...template });
  }

  await logActivity({
    actorUserId: session.userId,
    actorLabel: session.fullName,
    organizationId: session.organizationId,
    action: "invitation_sent",
    entityType: "user",
    summary: `Collaborateur invité (${email}) par ${organization.name}`,
  });

  return NextResponse.json({ ok: true });
}
