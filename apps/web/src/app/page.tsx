import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isMarinFroidRole } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  redirect(isMarinFroidRole(session.role) ? "/admin" : "/dashboard");
}
