"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import TourFilters from "@/components/tours/tour-filters"
import TourGrid from "@/components/tours/tour-grid"
import { TourComparisonProvider } from "@/components/tours/tour-comparison-provider"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Users, Calendar, Filter, Search, Globe, Award, TrendingUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { useScrollManagement } from "@/hooks/use-scroll-management"

interface Tour {
  id: number
  title: string
  slug: string
  description: string
  shortDescription: string
  category: {
    id: number
    name: string
    slug: string
  } | null
  duration: string
  groupSize: string
  maxGroupSize: number
  price: number
  originalPrice: number | null
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  location: {
    country: string
    region: string | null
    coordinates: {
      lat: number
      lng: number
    } | null
  }
  featuredImage: {
    data: string
    name: string | null
    type: string | null
  } | null
  featured: boolean
  popular: boolean
  isNew: boolean
  rating: number
  reviewCount: number
  viewCount: number
  bookingCount: number
  highlights: Array<{
    id: number
    highlight: string
    icon: string | null
    displayOrder: number
  }>
  inclusions: Array<{
    id: number
    item: string
    category: string
  }>
  stats: {
    totalReviews: number
    totalBookings: number
  }
}

interface TourCategory {
  id: number
  name: string
  slug: string
  tourCount: number
}

interface ToursClientProps {
  initialTours: Tour[]
  initialTotalTours: number
  initialTotalPages: number
  initialCategories: TourCategory[]
}

export default function ToursClient({ 
  initialTours,
  initialTotalTours,
  initialTotalPages,
  initialCategories
}: ToursClientProps) {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [tours, setTours] = useState<Tour[]>(initialTours)
  const [categories, setCategories] = useState<TourCategory[]>(initialCategories)
  const [totalTours, setTotalTours] = useState(initialTotalTours)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(initialTotalPages)

  // Optimized blur data URL for better loading experience
  const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAREBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  
  // Scroll management hook
  const { startLoading, endLoading } = useScrollManagement({
    preserveScroll: true,
    preventAutoScroll: true
  })
  
  const [filters, setFilters] = useState({
    search: "",
    categories: [] as string[],
    durations: [] as string[],
    difficulties: [] as string[],
    destinations: [] as string[],
    minPrice: 100,
    maxPrice: 5000,
  })
  const [sortBy, setSortBy] = useState("popular")
  const [showFilters, setShowFilters] = useState(false)

  // Reduced page size for better performance
  const pageSize = 8 // Reduced from 12 to 8

  // Handle URL parameters on mount
  useEffect(() => {
    const category = searchParams.get("category")
    if (category) {
      setFilters(prev => ({
        ...prev,
        categories: [category]
      }))
    }
  }, [searchParams])

  useEffect(() => {
    if (currentPage === 1 && !filters.search && !filters.categories.length) return
    loadTours()
  }, [currentPage, filters, sortBy])

  const loadTours = async () => {
    startLoading() // Signal data loading start
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy
      })

      if (filters.search) params.append('search', filters.search)
      if (filters.categories.length > 0) params.append('categories', filters.categories.join(','))
      if (filters.durations.length > 0) params.append('durations', filters.durations.join(','))
      if (filters.difficulties.length > 0) params.append('difficulties', filters.difficulties.join(','))
      if (filters.destinations.length > 0) params.append('destinations', filters.destinations.join(','))
      if (filters.minPrice > 100) params.append('minPrice', filters.minPrice.toString())
      if (filters.maxPrice < 5000) params.append('maxPrice', filters.maxPrice.toString())

      const response = await fetch(`/api/tours?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch tours')
      
      const data = await response.json()
      
      if (currentPage === 1) {
        setTours(data.tours)
      } else {
        setTours(prev => [...prev, ...data.tours])
      }
      
      setTotalTours(data.pagination.total)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error loading tours:', error)
    } finally {
      setLoading(false)
      endLoading() // Signal data loading end
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      categories: [],
      durations: [],
      difficulties: [],
      destinations: [],
      minPrice: 100,
      maxPrice: 5000,
    })
    setCurrentPage(1)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200'
      case 'Moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Challenging': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <TourComparisonProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50">
        {/* Header Section */}
        <div className="bg-white shadow-sm border-b border-emerald-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Search and Filters Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search tours..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10 bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
                  />
                </div>
              </form>

              {/* Sort */}
              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-white border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.search || filters.categories.length > 0 || filters.difficulties.length > 0 || filters.durations.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                    Search: {filters.search}
                  </Badge>
                )}
                {filters.categories.map(cat => (
                  <Badge key={cat} variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {cat}
                  </Badge>
                ))}
                {filters.difficulties.map(diff => (
                  <Badge key={diff} variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {diff}
                  </Badge>
                ))}
                {filters.durations.map(dur => (
                  <Badge key={dur} variant="secondary" className="bg-emerald-100 text-emerald-800">
                    {dur}
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-emerald-600 hover:text-emerald-700"
                >
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border-b border-emerald-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <TourFilters
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {totalTours} {totalTours === 1 ? 'Tour' : 'Tours'} Found
              </h2>
              <p className="text-gray-600 mt-1">
                Discover amazing adventures in Uganda
              </p>
            </div>
          </div>

          {/* Tours Grid */}
          {tours.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tours.map((tour, index) => (
                  <Card key={tour.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-emerald-100 hover:border-emerald-200">
                    {/* Tour Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      {tour.featuredImage && tour.featuredImage.data ? (
                        <Image
                          src={tour.featuredImage.data.startsWith('/') ? tour.featuredImage.data : tour.featuredImage.data}
                          alt={tour.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          priority={index < 4} // Reduced from 6 to 4 for better performance
                          quality={75} // Reduced from 85 to 75
                          placeholder="blur"
                          blurDataURL={blurDataURL}
                          loading={index < 4 ? "eager" : "lazy"} // Only first 4 images eager load
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw" // Optimized sizes
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                          <MapPin className="h-16 w-16 text-emerald-400" />
                        </div>
                      )}
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {tour.featured && (
                          <Badge className="bg-gradient-to-r from-yellow-500 to-emerald-500 text-white border-0 shadow-lg">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {tour.popular && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {tour.isNew && (
                          <Badge className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white border-0 shadow-lg">
                            <Award className="h-3 w-3 mr-1" />
                            New
                          </Badge>
                        )}
                      </div>

                      {/* Price */}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                        <div className="text-lg font-bold text-emerald-600">
                          {formatPrice(tour.price)}
                        </div>
                        {tour.originalPrice && tour.originalPrice > tour.price && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatPrice(tour.originalPrice)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tour Info */}
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Header */}
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                            {tour.title}
                          </h3>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {tour.shortDescription}
                          </p>
                        </div>

                        {/* Tour Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-emerald-500" />
                            <span className="text-gray-600">{tour.duration}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-emerald-500" />
                            <span className="text-gray-600">{tour.groupSize}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-emerald-500" />
                            <span className="text-gray-600">{tour.location.region || tour.location.country}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-gray-600">{tour.rating.toFixed(1)} ({tour.reviewCount})</span>
                          </div>
                        </div>

                        {/* Category & Difficulty */}
                        <div className="flex gap-2">
                          {tour.category && (
                            <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                              {tour.category.name}
                            </Badge>
                          )}
                          <Badge className={`text-xs ${getDifficultyColor(tour.difficulty)}`}>
                            {tour.difficulty}
                          </Badge>
                        </div>

                        {/* Highlights Preview */}
                        {tour.highlights.length > 0 && (
                          <div className="text-xs text-gray-600 bg-emerald-50 p-2 rounded-lg">
                            <span className="font-medium text-emerald-700">Highlights: </span>
                            {tour.highlights.slice(0, 2).map(h => h.highlight).join(', ')}
                            {tour.highlights.length > 2 && '...'}
                          </div>
                        )}

                        {/* Action Button */}
                        <Button 
                          className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                          asChild
                        >
                          <a href={`/tours/${tour.slug}`}>
                            View Details
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                  >
                    Previous
                  </Button>
                  <span className="text-gray-600 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-12 w-12 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No tours found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {filters.search || filters.categories.length > 0 || filters.difficulties.length > 0
                  ? 'Try adjusting your filters to see more results.'
                  : 'Check back soon for new tour packages!'}
              </p>
              <Button 
                variant="outline"
                onClick={clearFilters}
                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </main>
      </div>
    </TourComparisonProvider>
  )
} 
