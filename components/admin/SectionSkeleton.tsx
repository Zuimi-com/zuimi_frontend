function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

export default function SectionSkeleton() {
  return (
    <div className="max-w-6xl">
      <SkeletonLine className="h-8 w-64 mb-3" />
      <SkeletonLine className="h-4 w-96 mb-8" />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-6">
        <SkeletonLine className="h-10 w-full mb-4" />
        <SkeletonLine className="h-10 w-full mb-4" />
        <SkeletonLine className="h-10 w-full mb-4" />
        <SkeletonLine className="h-10 w-full mb-4" />
      </div>
    </div>
  );
}
