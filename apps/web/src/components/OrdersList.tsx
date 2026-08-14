"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { EmptyState } from "./EmptyState";
import { useToast } from "./Toast";
import { safeFetch } from "@/lib/safe-fetch";

interface Order {
  id: string;
  reference: string;
  status: string;
  createdAt: string;
}

export function OrdersList({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const toast = useToast();
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  async function handleReorder(e: React.MouseEvent, orderId: string) {
    e.preventDefault();
    e.stopPropagation();
    setReorderingId(orderId);
    const result = await safeFetch(`/api/orders/${orderId}/reorder`, { method: "POST" });
    setReorderingId(null);
    if (result.ok) {
      window.dispatchEvent(new CustomEvent("cart:updated"));
      toast.show("Articles ajoutés au panier.", "success");
      router.push("/cart");
    } else {
      toast.show(result.error ?? "Impossible de recommander cette commande.", "error");
    }
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        illustration="inbox"
        title="Aucune commande pour le moment"
        description="Vos commandes apparaîtront ici dès que vous en aurez passé une."
        action={<a href="/catalog" className="btn-primary" style={{ display: "inline-block" }}>Parcourir le catalogue</a>}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {orders.map((o) => (
        <Link key={o.id} href={`/orders/${o.id}`} className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{o.reference}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{new Date(o.createdAt).toLocaleDateString("fr-FR")}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className={`badge badge-${o.status}`}>{o.status}</span>
            <button className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={(e) => handleReorder(e, o.id)} disabled={reorderingId === o.id}>
              {reorderingId === o.id ? "..." : "Recommander"}
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
}
