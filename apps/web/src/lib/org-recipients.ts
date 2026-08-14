import { eq, and, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { users } from "@marin-froid/db";

/**
 * Users within an organization who should be kept in the loop on order
 * activity: the admin (oversight) and read-only/accounting users
 * ("comptabilité") who receive confirmations but never place orders
 * themselves. Excludes a given user (typically the order's placer, who
 * is emailed/notified separately as the primary recipient).
 */
export async function getOrgBroadcastUsers(organizationId: string, excludeUserId?: string) {
  const db = getDb();
  const rows = await db.query.users.findMany({
    where: and(
      eq(users.organizationId, organizationId),
      eq(users.active, true),
      inArray(users.role, ["org_admin", "org_viewer"])
    ),
  });
  return rows.filter((u) => u.id !== excludeUserId);
}
