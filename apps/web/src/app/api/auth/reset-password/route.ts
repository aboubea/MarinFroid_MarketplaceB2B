import { NextResponse } from "next/server";
import { eq, and, gt } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { users } from "@marin-froid/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const { token, password } = await request.json();
  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: and(eq(users.resetToken, token), gt(users.resetTokenExpiresAt, new Date())),
  });
  if (!user) {
    return NextResponse.json({ error: "Lien invalide ou expiré." }, { status: 400 });
  }

  await db
    .update(users)
    .set({ passwordHash: hashPassword(password), resetToken: null, resetTokenExpiresAt: null })
    .where(eq(users.id, user.id));

  return NextResponse.json({ ok: true });
}
