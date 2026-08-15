import { SkeletonBlock } from "./Skeleton";

function SidebarSkeleton() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Marin Froid</div>
      <nav className="sidebar-nav">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ padding: "10px 13px" }}>
            <div style={{ width: "60%", height: 12, borderRadius: 4, background: "rgba(255,255,255,0.08)" }} />
          </div>
        ))}
      </nav>
    </aside>
  );
}

export function AppShellSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <SidebarSkeleton />
      <div className="app-shell-content">
        <header className="topbar">
          <SkeletonBlock width={140} height={16} />
          <SkeletonBlock width={90} height={32} style={{ borderRadius: "50%" }} />
        </header>
        <main className="container app-shell-scroll" style={{ paddingTop: 32, paddingBottom: 64, maxWidth: "100%" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
