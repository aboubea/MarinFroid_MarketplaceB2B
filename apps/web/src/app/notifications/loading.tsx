import { AppShellSkeleton } from "@/components/ShellSkeleton";
import { SkeletonBlock, ListSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <AppShellSkeleton>
      <SkeletonBlock width={180} height={26} style={{ marginBottom: 24 }} />
      <ListSkeleton rows={5} />
    </AppShellSkeleton>
  );
}
