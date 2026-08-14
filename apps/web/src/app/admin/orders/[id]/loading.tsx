import { AppShellSkeleton } from "@/components/ShellSkeleton";
import { SkeletonBlock } from "@/components/Skeleton";

export default function Loading() {
  return (
    <AppShellSkeleton>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <SkeletonBlock width={160} height={24} style={{ marginBottom: 8 }} />
          <SkeletonBlock width={220} height={13} />
        </div>
        <SkeletonBlock width={140} height={38} style={{ borderRadius: "var(--radius-md)" }} />
      </div>
      <SkeletonBlock height={160} style={{ borderRadius: "var(--radius-lg)", marginBottom: 20 }} />
      <SkeletonBlock height={140} style={{ borderRadius: "var(--radius-lg)" }} />
    </AppShellSkeleton>
  );
}
