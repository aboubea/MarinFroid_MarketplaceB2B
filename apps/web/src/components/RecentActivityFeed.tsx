"use client";

import { useRef, useState } from "react";
import { safeFetch } from "@/lib/safe-fetch";

export interface ActivityEntry {
  id: string;
  summary: string;
  actorLabel: string | null;
  createdAt: string;
}

const PAGE_SIZE = 5;
const VISIBLE_ROWS = 5;
const ROW_HEIGHT = 62;

export function RecentActivityFeed({ initialActivity, initialHasMore }: { initialActivity: ActivityEntry[]; initialHasMore: boolean }) {
  const [activity, setActivity] = useState(initialActivity);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function loadMore() {
    if (loading || !hasMore || activity.length === 0) return;
    setLoading(true);
    const cursor = activity[activity.length - 1].createdAt;
    const result = await safeFetch<{ activity: ActivityEntry[]; hasMore: boolean }>(
      `/api/admin/activity?limit=${PAGE_SIZE}&before=${encodeURIComponent(cursor)}`,
    );
    setLoading(false);
    if (result.ok && result.data) {
      setActivity((prev) => [...prev, ...result.data!.activity]);
      setHasMore(result.data.hasMore);
    }
  }

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) {
      loadMore();
    }
  }

  if (activity.length === 0) {
    return <div style={{ padding: 16, fontSize: 12.5, color: "var(--color-text-muted)" }}>Aucune activité récente.</div>;
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      style={{ maxHeight: ROW_HEIGHT * VISIBLE_ROWS, overflowY: "auto" }}
    >
      {activity.map((a, idx) => (
        <div key={a.id} style={{ padding: "12px 16px", borderBottom: idx < activity.length - 1 ? "1px solid var(--color-border)" : "none" }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{a.summary}</div>
          <div style={{ fontSize: 11.5, color: "var(--color-text-faint)", marginTop: 2 }}>
            {a.actorLabel ?? "Système"} · {new Date(a.createdAt).toLocaleString("fr-FR")}
          </div>
        </div>
      ))}
      {loading && (
        <div style={{ padding: "10px 16px", fontSize: 11.5, color: "var(--color-text-faint)", textAlign: "center" }}>Chargement...</div>
      )}
    </div>
  );
}
