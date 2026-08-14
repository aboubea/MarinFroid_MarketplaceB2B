import { NextResponse } from "next/server";
import { eq, desc, and, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { clientNotifications } from "@marin-froid/db";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

  const countOnly = new URL(request.url).searchParams.get("countOnly") === "1";
  const db = getDb();

  if (countOnly) {
    const unread = await db.query.clientNotifications.findMany({
      where: and(eq(clientNotifications.userId, session.userId), isNull(clientNotifications.readAt)),
    });
    return NextResponse.json({ count: unread.length });
  }

  const list = await db.query.clientNotifications.findMany({
    where: eq(clientNotifications.userId, session.userId),
    orderBy: [desc(clientNotifications.createdAt)],
    limit: 100,
  });

  return NextResponse.json({ notifications: list });
}
