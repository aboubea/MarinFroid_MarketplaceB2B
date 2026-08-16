import { SkeletonBlock, SkeletonStatCard, ListSkeleton } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <SkeletonBlock width={200} height={26} style={{ marginBottom: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 32 }}>
        <SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard />
      </div>
      <ListSkeleton rows={4} />
    </>
  );
}
