import { Suspense } from "react"
import type { Metadata } from "next"
import GalleryClient from "./GalleryClient"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ScrollGuard from "@/components/ui/scroll-guard"

export const metadata: Metadata = {
  title: "Safari Gallery - Wildlife & Adventure Photos",
  description: "Discover Uganda's beauty through our curated collection of wildlife encounters, landscapes, and cultural moments captured during safari adventures."
}

interface GalleryPageProps {
  searchParams: {
    category?: string
    location?: string
    featured?: string
    search?: string
    page?: string
  }
}

export const dynamic = 'force-dynamic'

export default function GalleryPage({ searchParams }: GalleryPageProps) {
  return (
    <ScrollGuard>
      <h1 className="sr-only">Uganda Safari Gallery - Wildlife & Adventure Photos</h1>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading gallery...</p>
          </div>
        </div>
      }>
        <GalleryClient searchParams={searchParams} hideMainHeading={true} />
      </Suspense>
    </ScrollGuard>
  )
}
