import { Suspense } from "react"
import type { Metadata } from "next"
import LoadingSpinner from "@/components/ui/loading-spinner"
import BlogClient from "./BlogClient"

export const metadata: Metadata = {
  title: "Travel Blog - Uganda Safari Stories & Tips",
  description: "Expert guides, wildlife encounters, and travel tips from Uganda's top safari company. Discover the best of African adventure travel."
}

export default function BlogPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="h-12 w-12" />
          <p className="mt-4 text-gray-600">Loading blog...</p>
        </div>
      </div>
    }>
      <BlogClient />
    </Suspense>
  )
}
