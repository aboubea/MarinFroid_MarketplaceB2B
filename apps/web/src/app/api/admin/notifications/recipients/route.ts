import { NextResponse } from "next/server";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { notificationRecipients } from "@marin-froid/db";

export async function GET() {
  await requireMarinFroidSession();
  const db = getDb();
  const recipients = await db.query.notificationRecipients.findMany();
  return NextResponse.json({ recipients });
}

export async function POST(request: Request) {
  await requireMarinFroidSession();
  const { email, label } = await request.json();
  if (!email) return NextResponse.json({ error: "Email requis." }, { status: 400 });

  const db = getDb();
  const [recipient] = await db.insert(notificationRecipients).values({ email, label: label || null }).returning();
  return NextResponse.json({ recipient });
}
