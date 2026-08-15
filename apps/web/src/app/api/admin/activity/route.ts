import { NextResponse } from "next/server";
import { desc, lt } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { activityLogs } from "@marin-froid/db";

export async function GET(request: Request) {
  await requireMarinFroidSession();
  const db = getDb();

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 200 ? limitParam : 200;
  const before = searchParams.get("before");

  const list = await db.query.activityLogs.findMany({
    where: before ? lt(activityLogs.createdAt, new Date(before)) : undefined,
    orderBy: [desc(activityLogs.createdAt)],
    limit,
  });

  return NextResponse.json({ activity: list, hasMore: list.length === limit });
}
