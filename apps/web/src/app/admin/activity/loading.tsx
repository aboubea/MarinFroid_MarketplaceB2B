import { SkeletonBlock, ListSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <SkeletonBlock width={220} height={26} style={{ marginBottom: 8 }} />
      <SkeletonBlock width={320} height={14} style={{ marginBottom: 24 }} />
      <ListSkeleton rows={6} />
    </>
  );
}
