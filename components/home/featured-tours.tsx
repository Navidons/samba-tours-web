"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, Users, MapPin, ArrowRight, Heart, Camera, Award, Zap } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Tour {
  id: number
  title: string
  slug: string
  shortDescription: string
  price: number
  originalPrice: number | null
  duration: string
  groupSize: string
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  category: {
    id: number
    name: string
    slug: string
  } | null
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

export default function FeaturedTours() {
  const [featuredTours, setFeaturedTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFeaturedTours()
  }, [])

  const loadFeaturedTours = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/tours?featured=true&limit=6&sortBy=popular')
      const data = await response.json()

      if (data.success) {
        setFeaturedTours(data.tours)
      } else {
        console.error('Failed to load featured tours:', data.error)
        setError('Failed to load featured tours')
        setFeaturedTours([])
      }
    } catch (error) {
      console.error('Error loading featured tours:', error)
      setError('Error loading featured tours')
      setFeaturedTours([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-green-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container-max px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 text-green-700 px-6 py-3 rounded-full text-sm font-bold mb-6 border border-green-200 shadow-lg">
            <Award className="h-4 w-4 mr-2" />
            <Zap className="h-4 w-4 mr-2 text-emerald-600" />
            Most Popular Adventures
          </div>

          <h2 className="text-5xl md:text-6xl font-playfair font-bold text-gray-900 mb-6 leading-tight">
            Extraordinary
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
              Safari Experiences
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8">
            Handpicked adventures that showcase the very best of Uganda's wildlife, landscapes, and cultural heritage.
            Each tour is crafted to create unforgettable memories.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
              <span className="text-2xl font-bold text-green-600">50+</span>
              <span className="text-gray-600 ml-2">Unique Tours</span>
            </div>
            <div className="bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
              <span className="text-2xl font-bold text-emerald-600">98%</span>
              <span className="text-gray-600 ml-2">Satisfaction</span>
            </div>
            <div className="bg-white rounded-full px-6 py-3 shadow-lg border border-gray-200">
              <span className="text-2xl font-bold text-teal-600">24/7</span>
              <span className="text-gray-600 ml-2">Support</span>
            </div>
          </div>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {loading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="overflow-hidden border-0 shadow-xl bg-white rounded-3xl">
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-8">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-6" />
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                  <Skeleton className="h-12 w-full" />
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">{error}</p>
              <Button onClick={loadFeaturedTours} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : featuredTours.length > 0 ? (
            featuredTours.map((tour, index) => (
            <Card
              key={tour.id}
              className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-4 bg-white rounded-3xl relative"
            >
              {/* Image Container with Advanced Styling */}
              <div className="relative overflow-hidden rounded-t-3xl">
                <div className="aspect-[4/3] relative">
                  {tour.featuredImage && tour.featuredImage.data ? (
                    <img
                      src={tour.featuredImage.data}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter group-hover:brightness-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                      <MapPin className="h-16 w-16 text-green-400" />
                    </div>
                  )}

                  {/* Image Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {tour.featured && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-xl px-3 py-1 font-bold">
                      ⭐ Featured
                    </Badge>
                  )}
                  {tour.popular && (
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-xl px-3 py-1 font-bold animate-pulse">
                      🔥 Hot Deal
                    </Badge>
                  )}
                  {tour.isNew && (
                    <Badge className="bg-gradient-to-r from-teal-500 to-green-500 text-white border-0 shadow-xl px-3 py-1 font-bold">
                      ✨ New
                    </Badge>
                  )}
                </div>

                {/* Wishlist & Photo Count */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 group/heart shadow-lg">
                    <Heart className="h-5 w-5 text-gray-600 group-hover/heart:text-green-500 group-hover/heart:scale-110 transition-all duration-300" />
                  </button>
                  <div className="bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center">
                    <Camera className="h-4 w-4 text-white mr-1" />
                    <span className="text-white text-sm font-medium">{tour.highlights.length}</span>
                  </div>
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl border border-white/50">
                  <div className="text-right">
                    {tour.originalPrice && (
                      <div className="text-sm text-gray-500 line-through">${tour.originalPrice}</div>
                    )}
                    <div className="text-2xl font-bold text-green-600">${tour.price}</div>
                    <div className="text-xs text-gray-600">per person</div>
                  </div>
                </div>

                {/* Hover Overlay with Quick Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <Button
                      size="lg"
                      className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 py-3 rounded-full shadow-xl"
                      asChild
                    >
                      <Link href={`/tours/${tour.slug}`}>
                        View Details
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                {/* Tour Category & Location */}
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 font-medium">
                    {tour.category?.name || 'Uncategorized'}
                  </Badge>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{tour.location.region || tour.location.country}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-green-600 transition-colors duration-300 leading-tight">
                  {tour.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed line-clamp-3">{tour.shortDescription}</p>

                {/* Tour Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                    <Clock className="h-5 w-5 mr-2 text-green-600" />
                    <div>
                      <div className="font-semibold text-gray-900">{tour.duration}</div>
                      <div className="text-xs">Duration</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 bg-gray-50 rounded-lg p-3">
                    <Users className="h-5 w-5 mr-2 text-emerald-600" />
                    <div>
                      <div className="font-semibold text-gray-900">{tour.groupSize}</div>
                      <div className="text-xs">Group Size</div>
                    </div>
                  </div>
                </div>

                {/* Rating & Reviews */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="flex items-center mr-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(tour.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-900 text-lg">{tour.rating}</span>
                    <span className="text-gray-600 ml-2">({tour.reviewCount} reviews)</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`font-medium ${
                      tour.difficulty === "Easy"
                        ? "text-green-600 border-green-200 bg-green-50"
                        : tour.difficulty === "Moderate"
                          ? "text-yellow-600 border-yellow-200 bg-yellow-50"
                          : "text-red-600 border-red-200 bg-red-50"
                    }`}
                  >
                    {tour.difficulty}
                  </Badge>
                </div>

                {/* CTA Button */}
                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Link href={`/tours/${tour.slug}`}>
                    Book This Adventure
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600 text-lg">No featured tours available at the moment.</p>
            </div>
          )}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Ready for Your Dream Adventure?</h3>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied travelers who have experienced the magic of Uganda with us
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 text-lg font-bold rounded-full shadow-xl"
                asChild
              >
                <Link href="/tours">
                  View All Tours
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-emerald-900 px-8 py-4 text-lg font-bold rounded-full bg-transparent"
                asChild
              >
                <Link href="/contact">Plan Custom Trip</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
