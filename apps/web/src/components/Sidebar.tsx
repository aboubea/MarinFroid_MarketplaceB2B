"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useBranding } from "./BrandingContext";

const SWIPE_CLOSE_THRESHOLD = 60;

export interface SidebarLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export function Sidebar({
  links,
  footerLabel,
  homeHref,
  mobileOpen,
  onCloseMobile,
}: {
  links: SidebarLink[];
  footerLabel: string;
  homeHref: string;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();

  const matches = links.filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`));
  const bestMatch = matches.sort((a, b) => b.href.length - a.href.length)[0];

  const { logoUrl } = useBranding();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { onCloseMobile?.(); }, [pathname]);

  const asideRef = useRef<HTMLElement>(null);
  // `dragging` only flips to true once real horizontal movement is seen —
  // until then nothing touches the DOM, so a plain tap on a link is never
  // mistaken for the start of a swipe (that mistaken classList/style write
  // on touchstart was making links need a second tap to register).
  const touch = useRef<{ startX: number; startY: number; dx: number; dragging: boolean }>({
    startX: 0,
    startY: 0,
    dx: 0,
    dragging: false,
  });
  const DRAG_ACTIVATE_THRESHOLD = 10;

  function onTouchStart(e: React.TouchEvent) {
    touch.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, dx: 0, dragging: false };
  }
  function onTouchMove(e: React.TouchEvent) {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    const rawDx = x - touch.current.startX;
    const rawDy = y - touch.current.startY;
    if (!touch.current.dragging) {
      // Only commit to a horizontal drag once movement is both leftward
      // and clearly more horizontal than vertical (so vertical scrolling
      // inside the drawer isn't hijacked either).
      if (rawDx < -DRAG_ACTIVATE_THRESHOLD && Math.abs(rawDx) > Math.abs(rawDy)) {
        touch.current.dragging = true;
        asideRef.current?.classList.add("sidebar-dragging");
      } else {
        return;
      }
    }
    const dx = Math.min(0, rawDx);
    touch.current.dx = dx;
    if (asideRef.current) asideRef.current.style.transform = `translateX(${dx}px)`;
  }
  function onTouchEnd() {
    if (!touch.current.dragging) return;
    touch.current.dragging = false;
    asideRef.current?.classList.remove("sidebar-dragging");
    if (asideRef.current) asideRef.current.style.transform = "";
    if (touch.current.dx < -SWIPE_CLOSE_THRESHOLD) onCloseMobile?.();
  }

  return (
    <>
      {mobileOpen ? <div className="sidebar-backdrop" onClick={onCloseMobile} /> : null}
      <aside
        ref={asideRef}
        className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <button
          type="button"
          aria-label="Fermer le menu"
          className="sidebar-close"
          onClick={onCloseMobile}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
        <Link href={homeHref} className={`sidebar-logo ${logoUrl ? "sidebar-logo-image-mode" : ""}`} onClick={onCloseMobile}>
          {logoUrl ? (
            <div className="sidebar-logo-img-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Marin Froid" className="sidebar-logo-img" />
            </div>
          ) : (
            <>
              <span className="sidebar-logo-full">Marin Froid</span>
              <span className="sidebar-logo-short">MF</span>
            </>
          )}
        </Link>
        <div className="sidebar-body">
          <nav className="sidebar-nav">
            {links.map((link) => {
              const isActive = link.href === bestMatch?.href;
              return (
                <Link key={link.href} href={link.href} className={`sidebar-link ${isActive ? "active" : ""}`} title={link.label} onClick={onCloseMobile}>
                  {link.icon}
                  <span className="sidebar-link-label">{link.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="sidebar-footer">
            <button
              className="sidebar-link"
              style={{ width: "100%", background: "transparent", border: "none", textAlign: "left" }}
              title="Déconnexion"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = "/login";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              <span className="sidebar-link-label">Déconnexion</span>
            </button>
            <div className="sidebar-link-label" style={{ fontSize: 12, color: "#8A93A6", padding: "10px 13px 0" }}>{footerLabel}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
