"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

export function DeleteOrgButton({ organizationId, organizationName }: { organizationId: string; organizationName: string }) {
  const router = useRouter();
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Supprimer définitivement la société ${organizationName} et tous ses utilisateurs ?`)) return;
    setDeleting(true);
    const result = await safeFetch(`/api/admin/clients/${organizationId}`, { method: "DELETE" });
    setDeleting(false);
    if (!result.ok) {
      toast.show(result.error ?? "Impossible de supprimer cette société.", "error");
      return;
    }
    toast.show("Société supprimée.", "success");
    router.push("/admin/clients");
  }

  return (
    <button className="btn-secondary danger" onClick={handleDelete} disabled={deleting}>
      Supprimer
    </button>
  );
}
