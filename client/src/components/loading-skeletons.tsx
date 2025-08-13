import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CustomerListSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-20">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-16 rounded" />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-md p-3">
              <div className="text-center space-y-1">
                <Skeleton className="w-4 h-4 mx-auto rounded-full" />
                <Skeleton className="h-3 w-12 mx-auto" />
                <Skeleton className="h-4 w-8 mx-auto" />
              </div>
            </Card>
          ))}
        </div>

        {/* Search Skeleton */}
        <Skeleton className="h-9 w-full rounded" />

        {/* Customer List Skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CustomerDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-20">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div>
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Customer Info Skeleton */}
        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="w-16 h-16 rounded-full bg-white/20" />
              <div>
                <Skeleton className="h-5 w-32 mb-2 bg-white/20" />
                <Skeleton className="h-3 w-24 mb-1 bg-white/20" />
                <Skeleton className="h-3 w-20 bg-white/20" />
              </div>
            </div>
            <Skeleton className="h-6 w-16 rounded-full bg-white/20" />
          </div>
        </Card>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-md p-3">
              <div className="text-center space-y-2">
                <Skeleton className="w-6 h-6 mx-auto rounded-full" />
                <Skeleton className="h-3 w-16 mx-auto" />
                <Skeleton className="h-5 w-20 mx-auto" />
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <Card className="border-0 shadow-md p-4">
          <Skeleton className="h-4 w-16 mb-3" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="border border-slate-200 rounded p-3">
                <div className="flex flex-col items-center space-y-1">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Transactions Skeleton */}
        <Card className="border-0 shadow-md p-4">
          <Skeleton className="h-4 w-24 mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-3 w-12 mb-1" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 pb-20">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="w-10 h-10 rounded-full" />
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-md p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-3 w-16 mb-2" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
            </Card>
          ))}
        </div>

        {/* Business News Skeleton */}
        <Card className="border-0 shadow-md p-4">
          <Skeleton className="h-4 w-24 mb-3" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-6 h-6 rounded-full" />
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
                <Skeleton className="h-3 w-12" />
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity Skeleton */}
        <Card className="border-0 shadow-md p-4">
          <Skeleton className="h-4 w-28 mb-3" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3 w-32 mb-1" />
                  <Skeleton className="h-2 w-24" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}