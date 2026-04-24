"use client"

import dynamic from 'next/dynamic'
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load heavy components that are below the fold
export const LazyRegionsSection = dynamic(
  () => import('./regions-section'),
  {
    loading: () => (
      <div className="py-24 bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-12 w-96 mx-auto mb-4" />
            <Skeleton className="h-6 w-[600px] mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[600px] rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const LazyWildlifeGallery = dynamic(
  () => import('./wildlife-gallery'),
  {
    loading: () => (
      <div className="py-20 bg-gradient-to-b from-emerald-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-40 mx-auto mb-4" />
            <Skeleton className="h-12 w-80 mx-auto mb-4" />
            <Skeleton className="h-6 w-[500px] mx-auto" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)

export const LazyFeaturedTours = dynamic(
  () => import('./featured-tours'),
  {
    loading: () => (
      <div className="py-20 bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-40 mx-auto mb-4" />
            <Skeleton className="h-12 w-80 mx-auto mb-4" />
            <Skeleton className="h-6 w-[500px] mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[500px] rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    ),
    ssr: false
  }
)
