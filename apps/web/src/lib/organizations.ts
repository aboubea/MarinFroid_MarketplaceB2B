import { getDb } from "./db";

/** Marin Froid's own staff (mf_admin/mf_ops) belong to an "organization"
 * row too, same schema as any client org — nothing marks it as different.
 * Anywhere organizations are listed/counted as clients, exclude the ones
 * that are actually just Marin Froid's own staff org. */
export async function getInternalOrganizationIds(): Promise<Set<string>> {
  const db = getDb();
  const staff = await db.query.users.findMany({
    where: (u, { inArray }) => inArray(u.role, ["mf_admin", "mf_ops"]),
    columns: { organizationId: true },
  });
  return new Set(staff.map((u) => u.organizationId).filter((id): id is string => !!id));
}
