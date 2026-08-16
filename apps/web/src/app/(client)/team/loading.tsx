import { SkeletonBlock, ListSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <SkeletonBlock width={100} height={26} style={{ marginBottom: 8 }} />
      <SkeletonBlock width={260} height={14} style={{ marginBottom: 24 }} />
      <ListSkeleton rows={4} />
    </>
  );
}
