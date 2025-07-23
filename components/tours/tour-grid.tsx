"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Users, Heart, Calendar, ArrowRight, Scale, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getAllTours, type Tour } from "@/lib/data"
import { useTourComparisonContext } from "./tour-comparison-provider"
import TourComparison from "./tour-comparison"

interface TourGridProps {
  filters: {
    search: string
    categories: string[]
    durations: string[]
    difficulties: string[]
    destinations: string[]
    minPrice: number
    maxPrice: number
  }
  sortBy: string
}

export default function TourGrid({ filters, sortBy }: TourGridProps) {
  const router = useRouter()
  const [filteredTours, setFilteredTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)

  const { comparisonTours, addToComparison, removeFromComparison, clearComparison, isInComparison, canAddMore } =
    useTourComparisonContext()

  useEffect(() => {
    const filterTours = () => {
      setLoading(true)
      let tours = getAllTours()

      // Apply search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        tours = tours.filter(
          (tour) =>
            tour.title.toLowerCase().includes(searchTerm) ||
            tour.description.toLowerCase().includes(searchTerm) ||
            tour.shortDescription.toLowerCase().includes(searchTerm) ||
            tour.location.region.toLowerCase().includes(searchTerm) ||
            tour.location.country.toLowerCase().includes(searchTerm) ||
            tour.category.toLowerCase().includes(searchTerm) ||
            tour.highlights.some((highlight) => highlight.toLowerCase().includes(searchTerm)) ||
            tour.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
        )
      }

      // Apply category filter
      if (filters.categories.length > 0) {
        tours = tours.filter((tour) => {
          const tourCategorySlug = tour.category.toLowerCase().replace(/\s+/g, "-")
          return filters.categories.includes(tourCategorySlug)
        })
      }

      // Apply duration filter
      if (filters.durations.length > 0) {
        tours = tours.filter((tour) => {
          const duration = tour.duration.toLowerCase()
          return filters.durations.some((filterDuration) => {
            switch (filterDuration) {
              case "1-3":
                return duration.includes("1 day") || duration.includes("2 day") || duration.includes("3 day")
              case "4-7":
                return (
                  duration.includes("4 day") ||
                  duration.includes("5 day") ||
                  duration.includes("6 day") ||
                  duration.includes("7 day")
                )
              case "8-14":
                return ["8", "9", "10", "11", "12", "13", "14"].some((num) => duration.includes(`${num} day`))
              case "15+":
                return (
                  ["15", "16", "17", "18", "19", "20"].some((num) => duration.includes(`${num} day`)) ||
                  duration.includes("week")
                )
              default:
                return false
            }
          })
        })
      }

      // Apply difficulty filter
      if (filters.difficulties.length > 0) {
        tours = tours.filter((tour) => {
          const tourDifficulty = tour.difficulty.toLowerCase()
          return filters.difficulties.includes(tourDifficulty)
        })
      }

      // Apply destination filter
      if (filters.destinations.length > 0) {
        tours = tours.filter((tour) => {
          const tourRegionSlug = tour.location.region.toLowerCase().replace(/\s+/g, "-")
          return filters.destinations.includes(tourRegionSlug)
        })
      }

      // Apply price filter
      tours = tours.filter((tour) => tour.price >= filters.minPrice && tour.price <= filters.maxPrice)

      // Apply sorting
      switch (sortBy) {
        case "price-low":
          tours.sort((a, b) => a.price - b.price)
          break
        case "price-high":
          tours.sort((a, b) => b.price - a.price)
          break
        case "duration":
          tours.sort((a, b) => {
            const getDurationDays = (duration: string) => {
              const match = duration.match(/(\d+)/)
              return match ? Number.parseInt(match[1]) : 0
            }
            return getDurationDays(a.duration) - getDurationDays(b.duration)
          })
          break
        case "rating":
          tours.sort((a, b) => b.rating - a.rating)
          break
        case "popular":
        default:
          tours.sort((a, b) => {
            if (a.featured && !b.featured) return -1
            if (!a.featured && b.featured) return 1
            if (a.popular && !b.popular) return -1
            if (!a.popular && b.popular) return 1
            return b.rating - a.rating
          })
          break
      }

      setFilteredTours(tours)
      setLoading(false)
    }

    filterTours()
  }, [filters, sortBy])

  const handleComparisonToggle = (tour: Tour) => {
    if (isInComparison(tour.id)) {
      removeFromComparison(tour.id)
    } else if (canAddMore) {
      addToComparison(tour)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredTours.length === 0 ? "No Tours Found" : "Available Tours"}
            </h2>
            <p className="text-gray-600">
              {filteredTours.length === 0
                ? "Try adjusting your filters to find more tours"
                : `Showing ${filteredTours.length} amazing adventure${filteredTours.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          {comparisonTours.length > 0 && (
            <div className="text-sm text-gray-600">
              {comparisonTours.length} tour{comparisonTours.length !== 1 ? "s" : ""} selected for comparison
            </div>
          )}
        </div>

        {/* No Results */}
        {filteredTours.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-emerald-100 rounded-full flex items-center justify-center">
                <MapPin className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tours match your criteria</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or search terms to discover more amazing adventures in Uganda.
              </p>
              <Button
                variant="outline"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                onClick={() => router.push('/tours')}
              >
                Reset All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Tours Grid */}
        {filteredTours.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredTours.map((tour) => (
              <Card key={tour.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border border-emerald-100">
                <div className="relative">
                  <Image
                    src={tour.images[0]}
                    alt={tour.title}
                    width={400}
                    height={250}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                  {/* Category Badge */}
                  <Badge className="absolute top-4 left-4 bg-emerald-600 text-white border-0">{tour.category}</Badge>

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className={`${
                        isInComparison(tour.id)
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-white/90 hover:bg-white"
                      } ${!canAddMore && !isInComparison(tour.id) ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => handleComparisonToggle(tour)}
                      disabled={!canAddMore && !isInComparison(tour.id)}
                      title={
                        isInComparison(tour.id)
                          ? "Remove from comparison"
                          : canAddMore
                            ? "Add to comparison"
                            : "Maximum 3 tours can be compared"
                      }
                    >
                      <Scale className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Price Badge */}
                  <div className="absolute bottom-4 right-4">
                    <Badge className="bg-emerald-600 text-white border-0 text-lg px-3 py-1">
                      ${tour.price.toLocaleString()}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Title and Rating */}
                    <div>
                      <Link href={`/tours/${tour.slug}`} className="hover:text-emerald-600 transition-colors">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{tour.title}</h3>
                      </Link>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(tour.rating) ? "text-yellow-500 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">({tour.reviewCount} reviews)</span>
                      </div>
                    </div>

                    {/* Tour Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm">
                          {tour.location.region}, {tour.location.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm">{tour.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm">Max {tour.groupSize} people</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm">Available year-round</span>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="space-y-2">
                      {tour.highlights.slice(0, 3).map((highlight, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-600">
                          <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span className="text-sm">{highlight}</span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <Link href={`/tours/${tour.slug}`}>
                      <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Tour Comparison */}
      {comparisonTours.length > 0 && (
        <TourComparison 
          tours={comparisonTours}
          onRemoveTour={removeFromComparison}
          onClearAll={clearComparison}
        />
      )}
    </>
  )
}
