import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { users } from "@marin-froid/db";
import { getEffectivePermissions } from "./permissions";

/**
 * Users within an organization who should be kept in the loop on order
 * activity, based on their (role default or overridden) receivesOrderEmails
 * permission. Excludes a given user (typically the order's placer, who is
 * emailed/notified separately as the primary recipient).
 */
export async function getOrgBroadcastUsers(organizationId: string, excludeUserId?: string) {
  const db = getDb();
  const rows = await db.query.users.findMany({
    where: and(eq(users.organizationId, organizationId), eq(users.active, true)),
  });
  return rows.filter((u) => u.id !== excludeUserId && getEffectivePermissions(u).receivesOrderEmails);
}
