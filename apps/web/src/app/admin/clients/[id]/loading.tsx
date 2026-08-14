import { AppShellSkeleton } from "@/components/ShellSkeleton";
import { SkeletonBlock, ListSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <AppShellSkeleton>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <SkeletonBlock width={200} height={26} />
        <SkeletonBlock width={140} height={36} style={{ borderRadius: "var(--radius-md)" }} />
      </div>
      <SkeletonBlock width={100} height={16} style={{ marginBottom: 12 }} />
      <ListSkeleton rows={3} />
    </AppShellSkeleton>
  );
}
