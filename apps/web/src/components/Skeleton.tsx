export function SkeletonBlock({ width, height, style }: { width?: string | number; height?: string | number; style?: React.CSSProperties }) {
  return <div className="skeleton" style={{ width: width ?? "100%", height: height ?? 16, ...style }} />;
}

export function SkeletonProductTile() {
  return (
    <div className="product-tile" style={{ pointerEvents: "none" }}>
      <SkeletonBlock height={140} style={{ borderRadius: "var(--radius-md)", marginBottom: 4 }} />
      <SkeletonBlock width="70%" height={14} />
      <SkeletonBlock width="45%" height={11} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <SkeletonBlock width={70} height={28} style={{ borderRadius: "var(--radius-sm)" }} />
        <SkeletonBlock width={80} height={32} style={{ borderRadius: "var(--radius-md)" }} />
      </div>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <SkeletonBlock width="35%" height={14} />
        <SkeletonBlock width="20%" height={11} />
      </div>
      <SkeletonBlock width={70} height={22} style={{ borderRadius: 999 }} />
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="stat-card">
      <SkeletonBlock width={50} height={26} style={{ marginBottom: 6 }} />
      <SkeletonBlock width={90} height={11} />
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div>
      <SkeletonBlock width={360} height={40} style={{ borderRadius: "var(--radius-md)", marginBottom: 20 }} />
      <SkeletonBlock width="100%" height={16} style={{ maxWidth: 220, marginBottom: 12 }} />
      <div className="catalog-grid">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonProductTile key={i} />)}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div>
      <SkeletonBlock width={220} height={26} style={{ marginBottom: 8 }} />
      <SkeletonBlock width={280} height={14} style={{ marginBottom: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 40 }}>
        <SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard />
      </div>
      <SkeletonBlock width={180} height={16} style={{ marginBottom: 12 }} />
      <div className="catalog-grid">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonProductTile key={i} />)}
      </div>
    </div>
  );
}
