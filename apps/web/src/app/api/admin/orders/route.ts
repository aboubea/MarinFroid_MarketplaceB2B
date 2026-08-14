import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { orders, organizations } from "@marin-froid/db";

export async function GET() {
  await requireMarinFroidSession();
  const db = getDb();
  const list = await db
    .select({
      id: orders.id,
      reference: orders.reference,
      status: orders.status,
      createdAt: orders.createdAt,
      organizationName: organizations.name,
    })
    .from(orders)
    .innerJoin(organizations, eq(organizations.id, orders.organizationId))
    .orderBy(desc(orders.createdAt));

  return NextResponse.json({ orders: list });
}
