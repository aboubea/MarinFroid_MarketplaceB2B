import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { requireMarinFroidSession } from "@/lib/session-guard";
import { getDb } from "@/lib/db";
import { organizations } from "@marin-froid/db";
import { getInternalOrganizationIds } from "@/lib/organizations";

export async function GET() {
  await requireMarinFroidSession();
  const db = getDb();
  const [list, internalOrgIds] = await Promise.all([
    db.query.organizations.findMany({ orderBy: [desc(organizations.createdAt)] }),
    getInternalOrganizationIds(),
  ]);
  return NextResponse.json({
    organizations: list.filter((o) => !internalOrgIds.has(o.id)).map((o) => ({ id: o.id, name: o.name, status: o.status, createdAt: o.createdAt })),
  });
}
