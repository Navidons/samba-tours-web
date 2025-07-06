"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import GalleryHero from "@/components/gallery/gallery-hero"
import GalleryFilters from "@/components/gallery/gallery-filters"
import GalleryGrid from "@/components/gallery/gallery-grid"
import GalleryStats from "@/components/gallery/gallery-stats"
import VideoGallery from "@/components/gallery/video-gallery"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Database, Wifi, RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { galleryService, type GalleryImage, type GalleryCategory, type GalleryLocation, DatabaseConnectionError, GalleryServiceError } from "@/lib/gallery-service"

interface GalleryPageProps {
  searchParams: {
    category?: string
    location?: string
    featured?: string
    search?: string
    page?: string
  }
}

function GalleryContent({ searchParams }: GalleryPageProps) {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [categories, setCategories] = useState<GalleryCategory[]>([])
  const [locations, setLocations] = useState<GalleryLocation[]>([])
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

  // Get search params
  const category = searchParams.category
  const location = searchParams.location
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
    loadFiltersData()
  }, [category, location, featured, search, page])

  const loadGalleryData = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters = {
        category,
        location,
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
    }
  }

  const loadFiltersData = async () => {
    try {
      // These are not critical - if they fail, we just won't show filters
      const [categoriesData, locationsData, videosResponse] = await Promise.all([
        galleryService.getCategories(),
        galleryService.getLocations(),
        galleryService.getGalleryVideos({ limit: 1 }) // Just get total count
      ])
      
      setCategories(categoriesData)
      setLocations(locationsData)
      setTotalVideos(videosResponse.pagination.total)
    } catch (err) {
      console.warn('Error loading filters data:', err)
      // Don't show error for filters - just log it
    }
  }

  const handleRetry = () => {
    loadGalleryData()
    loadFiltersData()
  }

  const clearAllFilters = () => {
    router.replace("/gallery", { scroll: false })
  }

  // Transform images for the existing gallery grid component
  const transformedImages = images.map(image => ({
    id: image.id,
    src: galleryService.getImageUrl(image),
    alt: image.alt || image.title || 'Gallery Image',
    category: image.category?.name || 'uncategorized',
    location: image.location?.name || 'Unknown',
    title: image.title || '',
    description: image.description || '',
    photographer: image.photographer || '',
    date: galleryService.formatDate(image.date),
    likes: image.likes,
    views: image.views,
    aspectRatio: "4:3", // Default aspect ratio
    featured: image.featured
  }))

  // Show loading state
  if (loading && images.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-earth-600">Loading gallery images...</p>
        </div>
      </div>
    )
  }

  // Show connection error state
  if (error?.type === 'CONNECTION_ERROR') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Database className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-earth-900 mb-4">Database Connection Error</h2>
          <p className="text-earth-600 mb-6">{error.message}</p>
          <Button onClick={handleRetry} className="bg-orange-600 hover:bg-orange-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <p className="text-sm text-earth-500 mt-4">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <GalleryHero />

      <section className="py-16">
        <div className="container-max px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-earth-900 mb-6">
              Captured
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                Moments
              </span>
            </h2>
            <p className="text-xl text-earth-600 max-w-3xl mx-auto leading-relaxed">
              Experience the beauty of Uganda through our lens. Every photo tells a story of adventure, wildlife
              encounters, and unforgettable moments from our safari expeditions.
            </p>
          </div>

          {/* Show stats if we have data */}
          {pagination.total > 0 && (
            <GalleryStats
              totalImages={pagination.total}
              totalVideos={totalVideos}
              categories={categories.length}
              locations={locations.length}
            />
          )}

          {/* Filters */}
          <GalleryFilters
            categories={categories}
            locations={locations}
            selectedCategory={category}
            selectedLocation={location}
            selectedFeatured={searchParams.featured}
            searchQuery={search}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Error Display */}
          {error && error.type !== 'CONNECTION_ERROR' && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Gallery Grid */}
          {images.length > 0 && (
            <GalleryGrid
              images={transformedImages}
              viewMode={viewMode}
              pagination={pagination}
              onPageChange={navigateToPage}
            />
          )}

          {/* No Results */}
          {!loading && images.length === 0 && !error && (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-orange-100 rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-earth-900 mb-4">No Images Found</h3>
              <p className="text-earth-600 mb-6 max-w-md mx-auto">
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <Button onClick={clearAllFilters} variant="outline" className="border-orange-200 hover:bg-orange-50">
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Video Gallery Section */}
          {totalVideos > 0 && (
            <div className="mt-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-playfair font-bold text-earth-900 mb-4">
                  Video Gallery
                </h2>
                <p className="text-lg text-earth-600 max-w-2xl mx-auto">
                  Watch our videos to experience the sights and sounds of Uganda's wildlife and landscapes.
                </p>
              </div>
              <VideoGallery />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default function GalleryPage(props: GalleryPageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-earth-600">Loading gallery...</p>
        </div>
      </div>
    }>
      <GalleryContent {...props} />
    </Suspense>
  )
}
