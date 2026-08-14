import { AppShellSkeleton } from "@/components/ShellSkeleton";
import { SkeletonBlock, ListSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <AppShellSkeleton>
      <SkeletonBlock width={260} height={26} style={{ marginBottom: 8 }} />
      <SkeletonBlock width={340} height={14} style={{ marginBottom: 24 }} />
      <ListSkeleton rows={5} />
    </AppShellSkeleton>
  );
}
