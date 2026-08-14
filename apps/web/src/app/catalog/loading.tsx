import { AppShellSkeleton } from "@/components/ShellSkeleton";
import { CatalogSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <AppShellSkeleton>
      <CatalogSkeleton />
    </AppShellSkeleton>
  );
}
