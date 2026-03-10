export default function ProductSkeleton() {
  return (
    <div className="card flex flex-col animate-pulse">
      <div className="w-full h-40 bg-gray-200 rounded-lg mb-3" />
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-full mb-1" />
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
      <div className="flex justify-between items-center mt-auto">
        <div>
          <div className="h-5 bg-gray-200 rounded w-24 mb-1" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-8 bg-gray-200 rounded-lg w-28" />
      </div>
    </div>
  )
}