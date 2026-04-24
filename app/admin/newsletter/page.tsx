import { Suspense } from "react"
import NewsletterSubscribersClient from "./NewsletterSubscribersClient"
import { Skeleton } from "@/components/ui/skeleton"

export default function NewsletterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
        <p className="text-muted-foreground">
          Manage your newsletter subscribers and view subscription analytics.
        </p>
      </div>

      <Suspense fallback={<NewsletterSkeleton />}>
        <NewsletterSubscribersClient />
      </Suspense>
    </div>
  )
}

function NewsletterSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 
