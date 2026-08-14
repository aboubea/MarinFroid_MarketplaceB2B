"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Order {
  id: string;
  reference: string;
  status: string;
  createdAt: string;
}

export function OrdersList({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  async function handleReorder(e: React.MouseEvent, orderId: string) {
    e.preventDefault();
    e.stopPropagation();
    setReorderingId(orderId);
    const res = await fetch(`/api/orders/${orderId}/reorder`, { method: "POST" });
    setReorderingId(null);
    if (res.ok) {
      window.dispatchEvent(new CustomEvent("cart:updated"));
      router.push("/cart");
    }
  }

  if (orders.length === 0) {
    return <div className="card" style={{ padding: 24, color: "var(--color-text-muted)" }}>Aucune commande.</div>;
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
