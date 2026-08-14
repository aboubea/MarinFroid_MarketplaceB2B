import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations } from "@marin-froid/db";

export async function GET() {
  await requireMarinFroidSession();
  const db = getDb();
  const list = await db.query.organizations.findMany({ orderBy: [desc(organizations.createdAt)] });
  return NextResponse.json({
    organizations: list.map((o) => ({ id: o.id, name: o.name, status: o.status, createdAt: o.createdAt })),
  });
}
