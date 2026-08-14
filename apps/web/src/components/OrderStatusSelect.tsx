"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = ["submitted", "acknowledged", "processing", "shipped", "completed", "cancelled"];

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: string) {
    setStatus(next);
    setSaving(true);
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setSaving(false);
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
