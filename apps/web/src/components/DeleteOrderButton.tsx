"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";
import { IconTrash } from "./icons";

export function DeleteOrderButton({ orderId, reference }: { orderId: string; reference: string }) {
  const router = useRouter();
  const toast = useToast();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Supprimer définitivement la commande ${reference} ?`)) return;
    setDeleting(true);
    const result = await safeFetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
    setDeleting(false);
    if (!result.ok) {
      toast.show(result.error ?? "Impossible de supprimer cette commande.", "error");
      return;
    }
    toast.show("Commande supprimée.", "success");
    router.push("/admin/orders");
  }

  return (
    <button className="icon-btn danger" title="Supprimer" onClick={handleDelete} disabled={deleting}>
      <IconTrash />
    </button>
  );
}
