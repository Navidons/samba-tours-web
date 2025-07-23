import { Suspense } from "react"
import { generateSEOMetadata } from "@/lib/seo"
import type { Metadata } from "next"
import LoadingSpinner from "@/components/ui/loading-spinner"
import BlogClient from "./BlogClient"

export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: "Travel Blog - Uganda Safari Stories & Tips",
    description: "Expert guides, wildlife encounters, and travel tips from Uganda's top safari company. Discover the best of African adventure travel.",
    keywords: [
      'Uganda travel blog', 'safari stories', 'wildlife encounters',
      'travel tips Uganda', 'gorilla trekking guide', 'African safari blog',
      'Uganda travel guide', 'safari planning tips', 'Uganda wildlife blog'
    ],
    images: ['/photos/rwenzori-mountain-hero.jpg'],
    canonical: '/blog',
    type: 'article'
  })
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
