"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReorderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleReorder() {
    setLoading(true);
    const res = await fetch(`/api/orders/${orderId}/reorder`, { method: "POST" });
    setLoading(false);
    if (res.ok) {
      window.dispatchEvent(new CustomEvent("cart:updated"));
      router.push("/cart");
    }
  }

  return (
    <button className="btn-primary" onClick={handleReorder} disabled={loading}>
      {loading ? "Ajout au panier..." : "Recommander à l'identique"}
    </button>
  );
}
