import { SkeletonBlock } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <SkeletonBlock width={200} height={26} style={{ marginBottom: 24 }} />
      <SkeletonBlock height={340} style={{ maxWidth: 480, borderRadius: "var(--radius-lg)" }} />
    </>
  );
}
