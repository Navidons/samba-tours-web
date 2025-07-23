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

  const pageSize = 12

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
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy
      })

      if (filters.search) params.append('search', filters.search)
      if (filters.categories.length > 0) {
        filters.categories.forEach(cat => params.append('categories', cat))
      }
      if (filters.difficulties.length > 0) {
        filters.difficulties.forEach(diff => params.append('difficulties', diff))
      }
      if (filters.destinations.length > 0) {
        filters.destinations.forEach(dest => params.append('destinations', dest))
      }
      if (filters.durations.length > 0) {
        filters.durations.forEach(dur => params.append('durations', dur))
      }
      if (filters.minPrice > 100) params.append('minPrice', filters.minPrice.toString())
      if (filters.maxPrice < 5000) params.append('maxPrice', filters.maxPrice.toString())

      const response = await fetch(`/api/tours?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setTours(data.tours)
        setTotalTours(data.pagination.total)
        setTotalPages(data.pagination.totalPages)
      } else {
        console.error('Failed to load tours:', data.error)
        setTours([])
      }
    } catch (error) {
      console.error('Error loading tours:', error)
      setTours([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (filters.search.trim()) {
      setCurrentPage(1) // Reset to first page when searching
      loadTours()
    }
  }

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
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
      case 'Moderate': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'Challenging': return 'bg-teal-100 text-teal-800 border-teal-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <TourComparisonProvider>
      <div>
        {/* Search and Filters */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search tours..."
                className="pl-10 bg-white text-gray-900 border-0 focus:ring-2 focus:ring-emerald-300"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
              <Button 
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 h-8"
              >
                Search
              </Button>
            </form>
            <Button 
              variant="outline" 
              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <section className="py-16 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="group">
                <div className="text-4xl font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">{totalTours}+</div>
                <div className="text-gray-600 font-medium">Tour Packages</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">{categories.length}+</div>
                <div className="text-gray-600 font-medium">Categories</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">500+</div>
                <div className="text-gray-600 font-medium">Happy Travelers</div>
              </div>
              <div className="group">
                <div className="text-4xl font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">10+</div>
                <div className="text-gray-600 font-medium">Years Experience</div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Filters */}
          {showFilters && (
            <Card className="mb-8 border-emerald-200 shadow-lg">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select 
                    value={filters.categories[0] || 'all'} 
                    onValueChange={(value) => {
                      const newFilters = {
                        ...filters,
                        categories: value && value !== 'all' ? [value] : []
                      }
                      handleFiltersChange(newFilters)
                    }}
                  >
                    <SelectTrigger className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name} ({category.tourCount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select 
                    value={filters.difficulties[0] || 'all'} 
                    onValueChange={(value) => {
                      const newFilters = {
                        ...filters,
                        difficulties: value && value !== 'all' ? [value] : []
                      }
                      handleFiltersChange(newFilters)
                    }}
                  >
                    <SelectTrigger className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Challenging">Challenging</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select 
                    value={sortBy} 
                    onValueChange={(value) => {
                      setSortBy(value)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="newest">Newest Tours</SelectItem>
                      <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2">
                    <div className="text-sm text-gray-600 flex items-center justify-center bg-gray-50 rounded-lg px-3 py-2 flex-1">
                      <Globe className="h-4 w-4 mr-2 text-emerald-600" />
                      {tours.length} of {totalTours}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={clearFilters}
                      className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tours Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-emerald-200 shadow-lg">
                  <Skeleton className="h-64 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tours.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tours.map((tour) => (
                  <Card key={tour.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-emerald-200">
                    {/* Tour Image */}
                    <div className="relative h-64 overflow-hidden">
                      {tour.featuredImage && tour.featuredImage.data ? (
                        <Image
                          src={tour.featuredImage.data.startsWith('/') ? tour.featuredImage.data : tour.featuredImage.data}
                          alt={tour.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
