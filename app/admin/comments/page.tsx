import { Suspense } from "react"
import CommentsManagementClient from "./CommentsManagementClient"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function CommentsManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-earth-900 mb-2">Comments Management</h1>
        <p className="text-earth-600">
          Manage and moderate blog comments from across the site.
        </p>
      </div>
      
      <Suspense fallback={<LoadingSpinner />}>
        <CommentsManagementClient />
      </Suspense>
    </div>
  )
} 
