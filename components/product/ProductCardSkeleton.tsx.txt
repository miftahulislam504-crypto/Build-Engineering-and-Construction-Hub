export default function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="skeleton aspect-square w-full" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-5 w-24 rounded" />
        <div className="flex justify-between items-center">
          <div className="skeleton h-4 w-16 rounded" />
          <div className="skeleton h-7 w-16 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
