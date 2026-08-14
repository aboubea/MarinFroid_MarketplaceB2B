import { AppShellSkeleton } from "@/components/ShellSkeleton";
import { DashboardSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <AppShellSkeleton>
      <DashboardSkeleton />
    </AppShellSkeleton>
  );
}
