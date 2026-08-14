"use client";

import { useEffect, useState } from "react";
import { IconBell } from "./icons";
import { safeFetch } from "@/lib/safe-fetch";

export function NotificationBell() {
  const [count, setCount] = useState(0);

  async function refresh() {
    const result = await safeFetch<{ count: number }>("/api/notifications?countOnly=1");
    if (result.ok && result.data) setCount(result.data.count);
  }

  useEffect(() => {
    refresh();
    window.addEventListener("notifications:updated", refresh);
    return () => window.removeEventListener("notifications:updated", refresh);
  }, []);

  return (
    <span
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "var(--color-bg)",
        border: "1px solid var(--color-border)",
        color: "var(--color-text-muted)",
      }}
    >
      <IconBell />
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: -4,
            right: -4,
            background: "var(--color-danger)",
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
