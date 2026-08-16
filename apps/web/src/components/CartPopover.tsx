"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CartIcon } from "./CartIcon";
import { safeFetch } from "@/lib/safe-fetch";

interface CartSummaryItem {
  productId: string;
  quantity: number;
  name: string;
  sku: string;
  unit: string;
  indicativePrice: string | null;
}

export function CartPopover() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<CartSummaryItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  async function refresh() {
    setLoading(true);
    const result = await safeFetch<{ items: CartSummaryItem[]; subtotal: number }>("/api/cart/summary");
    setLoading(false);
    if (result.ok && result.data) {
      setItems(result.data.items);
      setSubtotal(result.data.subtotal);
    }
  }

  useEffect(() => {
    if (open) refresh();
  }, [open]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    function onUpdate() {
      if (open) refresh();
    }
    window.addEventListener("cart:updated", onUpdate);
    return () => window.removeEventListener("cart:updated", onUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function removeItem(productId: string) {
    setRemovingId(productId);
    const result = await safeFetch("/api/cart/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 0 }),
    });
    setRemovingId(null);
    if (result.ok) {
      window.dispatchEvent(new Event("cart:updated"));
      refresh();
    }
  }

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        type="button"
        aria-label="Panier"
        className="topbar-action"
        style={{ background: "none", border: "none", cursor: "pointer" }}
        onClick={() => setOpen((v) => !v)}
      >
        <CartIcon />
      </button>

      {open && (
        <div className="card cart-popover fade-up">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>Panier</span>
            <button
              type="button"
              aria-label="Fermer"
              onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-faint)", display: "flex", padding: 2 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 20, fontSize: 12.5, color: "var(--color-text-muted)", textAlign: "center" }}>Chargement...</div>
          ) : items.length === 0 ? (
            <div style={{ padding: 24, fontSize: 12.5, color: "var(--color-text-muted)", textAlign: "center" }}>Votre panier est vide.</div>
          ) : (
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {items.map((item, idx) => (
                <div
                  key={item.productId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: "10px 16px",
                    borderBottom: idx < items.length - 1 ? "1px solid var(--color-border)" : "none",
                    opacity: removingId === item.productId ? 0.5 : 1,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>
                      Qté {item.quantity} {item.unit}
                      {item.indicativePrice ? ` · ${(Number(item.indicativePrice) * item.quantity).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Retirer"
                    onClick={() => removeItem(item.productId)}
                    disabled={removingId === item.productId}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-text-faint)", flexShrink: 0, display: "flex", padding: 4 }}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div style={{ padding: 16, borderTop: "1px solid var(--color-border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>Sous-total indicatif</span>
              <span style={{ fontSize: 15, fontWeight: 700 }}>{subtotal.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
            </div>
            <Link href="/cart" className="btn-primary" style={{ display: "block", textAlign: "center" }} onClick={() => setOpen(false)}>
              Voir le panier
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
