"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const THRESHOLD = 68;
const MAX_PULL = 96;

/** Mobile pull-to-refresh: dragging down from the top of the page re-runs
 * the server component's data fetch via router.refresh(). No-ops on
 * desktop (pointer devices don't fire the touch events this relies on),
 * and only engages when the page is already scrolled to the top so it
 * never fights normal scrolling. */
export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  function onTouchStart(e: React.TouchEvent) {
    if (window.scrollY > 0 || refreshing) return;
    startY.current = e.touches[0].clientY;
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy <= 0 || window.scrollY > 0) {
      setPull(0);
      return;
    }
    setPull(Math.min(dy * 0.5, MAX_PULL));
  }

  function onTouchEnd() {
    if (startY.current === null) return;
    startY.current = null;
    if (pull >= THRESHOLD) {
      setRefreshing(true);
      router.refresh();
      // Also let self-fetching client components (e.g. boards that load
      // their own data via useEffect instead of server props) refresh —
      // router.refresh() only re-runs server components.
      window.dispatchEvent(new CustomEvent("ptr:refresh"));
      setTimeout(() => {
        setRefreshing(false);
        setPull(0);
      }, 700);
    } else {
      setPull(0);
    }
  }

  const active = pull > 0 || refreshing;

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className={`ptr-indicator ${active ? "" : "ptr-indicator-idle"}`}
        style={{ height: refreshing ? THRESHOLD : pull }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={refreshing ? "ptr-spin" : ""}
          style={!refreshing ? { transform: `rotate(${Math.min(pull / THRESHOLD, 1) * 180}deg)` } : undefined}
        >
          <path d="M21 12a9 9 0 1 1-3-6.7" />
          <path d="M21 3v6h-6" />
        </svg>
      </div>
      {children}
    </div>
  );
}
