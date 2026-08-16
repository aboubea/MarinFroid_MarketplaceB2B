import { SkeletonBlock, ListSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <SkeletonBlock width={160} height={26} style={{ marginBottom: 20 }} />
      <SkeletonBlock width={360} height={40} style={{ borderRadius: "var(--radius-md)", marginBottom: 16 }} />
      <ListSkeleton rows={5} />
    </>
  );
}
