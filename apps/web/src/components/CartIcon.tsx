"use client";

import { useEffect, useState } from "react";

export function CartIcon() {
  const [count, setCount] = useState(0);
  const [bump, setBump] = useState(false);

  async function refresh() {
    const res = await fetch("/api/cart/count");
    if (res.ok) {
      const data = await res.json();
      setCount(data.count);
    }
  }

  useEffect(() => {
    refresh();
    function onUpdate() {
      refresh();
      setBump(true);
      setTimeout(() => setBump(false), 300);
    }
    window.addEventListener("cart:updated", onUpdate);
    return () => window.removeEventListener("cart:updated", onUpdate);
  }, []);

  return (
    <span
      className={bump ? "cart-bump" : ""}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: bump ? "var(--color-secondary)" : "var(--color-bg)",
        border: "1px solid var(--color-border)",
        transition: "background 0.2s ease",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: 999,
            fontSize: 10,
            fontWeight: 700,
            padding: "1px 5px",
            minWidth: 16,
            textAlign: "center",
          }}
        >
          {count}
        </span>
      )}
    </span>
  );
}
