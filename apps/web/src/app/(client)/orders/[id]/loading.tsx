import { SkeletonBlock } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <SkeletonBlock width={160} height={24} style={{ marginBottom: 8 }} />
      <SkeletonBlock width={120} height={13} style={{ marginBottom: 20 }} />
      <SkeletonBlock height={90} style={{ borderRadius: "var(--radius-lg)", marginBottom: 20 }} />
      <SkeletonBlock height={140} style={{ borderRadius: "var(--radius-lg)" }} />
    </>
  );
}
