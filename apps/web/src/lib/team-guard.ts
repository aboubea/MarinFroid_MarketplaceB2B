import { redirect } from "next/navigation";
import { requireClientSession } from "./session-guard";

export async function requireOrgAdminSession() {
  const result = await requireClientSession();
  if (result.session.role !== "org_admin") {
    redirect("/dashboard");
  }
  return result;
}
