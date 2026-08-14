"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrgStatusToggle({ organizationId, currentStatus }: { organizationId: string; currentStatus: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isSuspended = currentStatus === "suspended";

  async function toggle() {
    setSaving(true);
    await fetch(`/api/admin/clients/${organizationId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: isSuspended ? "active" : "suspended" }),
    });
    setSaving(false);
    router.refresh();
  }

  return (
    <button className="btn-secondary" onClick={toggle} disabled={saving}>
      {isSuspended ? "Réactiver la société" : "Suspendre la société"}
    </button>
  );
}
