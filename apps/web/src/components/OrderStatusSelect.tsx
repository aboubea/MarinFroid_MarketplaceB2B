"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

const STATUSES = ["submitted", "acknowledged", "processing", "shipped", "completed", "cancelled"];

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: string) {
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

  return (
    <select
      className="input"
      style={{ width: "auto" }}
      value={status}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value)}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
