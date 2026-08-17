import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "./auth";
import { getDb } from "./db";
import { organizations } from "@marin-froid/db";

export async function requireClientSession() {
  const session = await getSession();
  if (!session || !session.organizationId) {
    redirect("/login");
  }
  const db = getDb();
  const org = await db.query.organizations.findFirst({ where: eq(organizations.id, session.organizationId!) });
  if (!org || org.status !== "active") {
    redirect("/login");
  }
  return { session: session!, organization: org! };
}

// The mf_ops (preparer) role no longer has any interface — those staff
// just receive order emails via the notification recipients list. Both
// guards below are equivalent now, but kept separate since call sites
// still name the one that matches their intent.
export async function requireMarinFroidSession() {
  const session = await getSession();
  if (!session || session.role !== "mf_admin") {
    redirect("/login");
  }
  return session!;
}

export async function requireMarinFroidAdminSession() {
  const session = await getSession();
  if (!session || session.role !== "mf_admin") {
    redirect("/login");
  }
  return session!;
}
