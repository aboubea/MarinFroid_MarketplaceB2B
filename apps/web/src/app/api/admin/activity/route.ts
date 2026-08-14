import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { activityLogs } from "@marin-froid/db";

export async function GET() {
  await requireMarinFroidSession();
  const db = getDb();
  const list = await db.query.activityLogs.findMany({ orderBy: [desc(activityLogs.createdAt)], limit: 200 });
  return NextResponse.json({ activity: list });
}
