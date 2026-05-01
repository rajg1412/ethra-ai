import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-full sm:w-32 rounded-md" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-9 w-16" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <Skeleton className="h-5 w-32" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
                >
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <Skeleton className="h-5 w-32" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
