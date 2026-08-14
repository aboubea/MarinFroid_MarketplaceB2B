"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

const STEPS = ["submitted", "acknowledged", "processing", "shipped", "completed"];

const STATUS_LABELS: Record<string, string> = {
  submitted: "Reçue",
  acknowledged: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  completed: "Livrée",
  cancelled: "Annulée",
};

const NEXT_ACTION_LABEL: Record<string, string> = {
  submitted: "Confirmer la commande",
  acknowledged: "Démarrer la préparation",
  processing: "Marquer comme expédiée",
  shipped: "Marquer comme livrée",
};

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function updateStatus(next: string) {
    const previous = status;
    setStatus(next);
    setSaving(true);
    const result = await safeFetch(`/api/admin/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
    if (!result.ok) {
      setStatus(previous);
      toast.show(result.error ?? "Impossible de mettre à jour le statut.", "error");
      return;
    }
    toast.show("Statut mis à jour.", "success");
    router.refresh();
  }

  if (status === "cancelled") {
    return <span className="badge badge-cancelled">Annulée</span>;
  }

  const currentIndex = STEPS.indexOf(status);
  const nextStatus = currentIndex >= 0 && currentIndex < STEPS.length - 1 ? STEPS[currentIndex + 1] : null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span className={`badge badge-${status}`}>{STATUS_LABELS[status] ?? status}</span>
      {nextStatus && (
        <button
          type="button"
          className="btn-primary"
          disabled={saving}
          onClick={() => updateStatus(nextStatus)}
          style={{ fontSize: 12.5 }}
        >
          {saving ? "Mise à jour..." : `${NEXT_ACTION_LABEL[status] ?? "Étape suivante"} →`}
        </button>
      )}
      {status !== "completed" && (
        <button
          type="button"
          className="btn-secondary"
          disabled={saving}
          onClick={() => updateStatus("cancelled")}
          style={{ fontSize: 12.5 }}
        >
          Annuler
        </button>
      )}
    </div>
  );
}
