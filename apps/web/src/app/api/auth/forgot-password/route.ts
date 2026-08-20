import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { getDb } from "@/lib/db";
import { users } from "@marin-froid/db";
import { createEmailClient, passwordResetEmail } from "@marin-froid/email";
import { sendTrackedEmail } from "@/lib/email-log";
import { getBaseUrl } from "@/lib/base-url";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email) return NextResponse.json({ ok: true });

  const db = getDb();
  const user = await db.query.users.findFirst({ where: eq(users.email, email.toLowerCase().trim()) });

  if (user && user.active) {
    const token = randomBytes(24).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60);
    await db.update(users).set({ resetToken: token, resetTokenExpiresAt }).where(eq(users.id, user.id));

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      const emailClient = createEmailClient(apiKey);
      const baseUrl = getBaseUrl(request);
      const template = passwordResetEmail({ resetUrl: `${baseUrl}/reset-password?token=${token}` });
      await sendTrackedEmail(emailClient, "password_reset", { to: user.email, ...template });
    }
  }

  return NextResponse.json({ ok: true });
}
