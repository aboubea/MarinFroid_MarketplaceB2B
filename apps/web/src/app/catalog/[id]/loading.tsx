import { AppShellSkeleton } from "@/components/ShellSkeleton";
import { SkeletonBlock } from "@/components/Skeleton";

export default function Loading() {
  return (
    <AppShellSkeleton>
      <SkeletonBlock width={140} height={13} style={{ marginBottom: 20 }} />
      <div className="grid-media-420" style={{ gap: 40, alignItems: "start" }}>
        <SkeletonBlock height={420} style={{ borderRadius: "var(--radius-lg)" }} />
        <div>
          <SkeletonBlock width={90} height={20} style={{ borderRadius: 999, marginBottom: 12 }} />
          <SkeletonBlock width="60%" height={28} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="40%" height={14} style={{ marginBottom: 20 }} />
          <SkeletonBlock width={140} height={32} style={{ marginBottom: 24 }} />
          <SkeletonBlock width={220} height={42} style={{ borderRadius: "var(--radius-md)" }} />
        </div>
      </div>
    </AppShellSkeleton>
  );
}
