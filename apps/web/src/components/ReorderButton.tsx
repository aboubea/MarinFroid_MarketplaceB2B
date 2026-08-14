"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

export function ReorderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function handleReorder() {
    setLoading(true);
    const result = await safeFetch(`/api/orders/${orderId}/reorder`, { method: "POST" });
    setLoading(false);
    if (result.ok) {
      window.dispatchEvent(new CustomEvent("cart:updated"));
      toast.show("Articles ajoutés au panier.", "success");
      router.push("/cart");
    } else {
      toast.show(result.error ?? "Impossible de recommander cette commande.", "error");
    }
  }

  return (
    <button className="btn-primary" onClick={handleReorder} disabled={loading}>
      {loading ? "Ajout au panier..." : "Recommander à l'identique"}
    </button>
  );
}
