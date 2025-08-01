"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import GalleryHero from "@/components/gallery/gallery-hero"
import GalleryFilters from "@/components/gallery/gallery-filters"
import GalleryGrid from "@/components/gallery/gallery-grid"
import GalleryStats from "@/components/gallery/gallery-stats"
import VideoGallery from "@/components/gallery/video-gallery"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Database, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { galleryService, type GalleryImage, DatabaseConnectionError, GalleryServiceError } from "@/lib/gallery-service"
import { useScrollManagement } from "@/hooks/use-scroll-management"

interface GalleryClientProps {
  searchParams: {
    featured?: string
    search?: string
    page?: string
  }
  hideMainHeading?: boolean
}

export default function GalleryClient({ searchParams, hideMainHeading }: GalleryClientProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [totalVideos, setTotalVideos] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ message: string; type: string } | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 1
  })
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("masonry")

  // Scroll management hook
  const { startLoading, endLoading } = useScrollManagement({
    preserveScroll: true,
    preventAutoScroll: true
  })

  // Get search params
  const featured = searchParams.featured === 'true'
  const search = searchParams.search
  const page = parseInt(searchParams.page || '1')

  // Pagination navigation function
  const navigateToPage = (newPage: number) => {
    const current = new URLSearchParams(Array.from(urlSearchParams.entries()))
    current.set('page', newPage.toString())
    const query = current.toString()
    router.replace(`/gallery?${query}`, { scroll: false })
  }

  useEffect(() => {
    loadGalleryData()
  }, [featured, search, page])

  const loadGalleryData = async () => {
    try {
      startLoading() // Signal data loading start
      setLoading(true)
      setError(null)

      const filters = {
        featured: searchParams.featured === 'true' ? true : searchParams.featured === 'false' ? false : undefined,
        search,
        page,
        limit: 20
      }

      const response = await galleryService.getGalleryImages(filters)
      
      if (response.images) {
        setImages(response.images)
        setPagination(response.pagination)
      }
    } catch (err) {
      console.error('Error loading gallery data:', err)
      
      if (err instanceof DatabaseConnectionError) {
        setError({
          message: 'Unable to connect to the database. The database server may be offline. Please try again later.',
          type: 'CONNECTION_ERROR'
        })
      } else if (err instanceof GalleryServiceError) {
        setError({
          message: err.message,
          type: err.type
        })
      } else {
        setError({
          message: 'An unexpected error occurred while loading gallery images.',
          type: 'UNKNOWN_ERROR'
        })
      }
    } finally {
      setLoading(false)
      endLoading() // Signal data loading end
    }
  }

  const handleRetry = () => {
    loadGalleryData()
  }

  // Transform images for the existing gallery grid component
  const transformedImages = images.map(image => ({
    id: image.id,
    src: galleryService.getImageUrl(image),
    alt: image.alt || image.title || 'Gallery Image',
    title: image.title || '',
    description: image.description || '',
    views: image.views,
    aspectRatio: "4:3", // Default aspect ratio
    featured: image.featured
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Always show hero section first */}
      <GalleryHero hideHeading={hideMainHeading} />

      <section className="py-16">
        <div className="container-max px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-6">
              Captured
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                Moments
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Experience the beauty of Uganda through our lens. Every photo tells a story of adventure, wildlife
              encounters, and unforgettable moments from our safari expeditions.
            </p>
          </div>

          {/* Show connection error state */}
          {error?.type === 'CONNECTION_ERROR' && (
            <Alert className="mb-8 border-red-200 bg-red-50">
              <Database className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error.message}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRetry}
                  className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Show other types of errors */}
          {error && error.type !== 'CONNECTION_ERROR' && (
            <Alert className="mb-8 border-emerald-200 bg-emerald-50">
              <AlertCircle className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-800">
                {error.message}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRetry}
                  className="ml-4 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Show stats if we have data */}
          {(images.length > 0) && (
            <GalleryStats 
              totalImages={pagination.total}
              totalVideos={totalVideos}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-12">
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <GalleryFilters 
                  selectedFeatured={searchParams.featured}
                  searchQuery={search}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-2 text-gray-600">Loading images...</p>
                  </div>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 00-2-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No images found</h3>
                  <p className="text-gray-600 mb-4">
                    {search ? 
                      "No images match your current filters. Try adjusting your search criteria." :
                      "No images are available in the gallery yet."
                    }
                  </p>
                  {search && (
                    <Button 
                      variant="outline"
                      onClick={() => router.replace('/gallery', { scroll: false })}
                      className="border-emerald-200 hover:bg-emerald-50"
                    >
                      View All Images
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <GalleryGrid 
                    images={transformedImages}
                    viewMode={viewMode}
                  />
                  
                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-4 mt-12">
                      <button
                        onClick={() => navigateToPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 border border-emerald-200 rounded-md text-gray-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      
                      <span className="text-gray-600">
                        Page {pagination.page} of {pagination.totalPages}
                      </span>
                      
                      <button
                        onClick={() => navigateToPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 border border-emerald-200 rounded-md text-gray-700 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <VideoGallery />
    </div>
  )
} 
