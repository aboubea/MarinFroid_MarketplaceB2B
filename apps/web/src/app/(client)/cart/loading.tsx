import { SkeletonBlock } from "@/components/Skeleton";

export default function Loading() {
  return (
    <>
      <SkeletonBlock width={100} height={26} style={{ marginBottom: 24 }} />
      <div className="grid-sidebar-320" style={{ gap: 20 }}>
        <SkeletonBlock height={220} style={{ borderRadius: "var(--radius-lg)" }} />
        <SkeletonBlock height={220} style={{ borderRadius: "var(--radius-lg)" }} />
      </div>
    </>
  );
}
