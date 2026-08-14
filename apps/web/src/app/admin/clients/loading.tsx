import { AppShellSkeleton } from "@/components/ShellSkeleton";
import { SkeletonBlock, ListSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <AppShellSkeleton>
      <SkeletonBlock width={100} height={26} style={{ marginBottom: 24 }} />
      <SkeletonBlock height={90} style={{ borderRadius: "var(--radius-lg)", marginBottom: 32 }} />
      <ListSkeleton rows={4} />
    </AppShellSkeleton>
  );
}
