"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

export function OrgStatusToggle({ organizationId, currentStatus }: { organizationId: string; currentStatus: string }) {
  const router = useRouter();
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const isSuspended = currentStatus === "suspended";

  async function toggle() {
    setSaving(true);
    const result = await safeFetch(`/api/admin/clients/${organizationId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: isSuspended ? "active" : "suspended" }),
    });
    setSaving(false);
    if (!result.ok) {
      toast.show(result.error ?? "Impossible de mettre à jour la société.", "error");
      return;
    }
    toast.show(isSuspended ? "Société réactivée." : "Société suspendue.", "success");
    router.refresh();
  }

  return (
    <button className="btn-secondary" onClick={toggle} disabled={saving}>
      {isSuspended ? "Réactiver la société" : "Suspendre la société"}
    </button>
  );
}
