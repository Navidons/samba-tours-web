"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, Star, MapPin, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Tour {
  id: string
  title: string
  shortDescription?: string
  price: number
  duration: string
  locationCountry: string
  locationRegion?: string
  category?: {
    id: number
    name: string
    slug: string
  } | null
  rating: number
  reviewCount: number
  images?: Array<{
    id: string
    data: string
    name: string
    type: string
    size: number
    altText?: string
    title?: string
    description?: string
    isFeatured: boolean
    displayOrder: number
  }> | null
  featuredImage?: {
    data: string
    name: string
    type: string
  } | null
}

type TourHeroProps = {
  tour: Tour
  isListingPage?: boolean
}

export default function TourHero({ tour, isListingPage = false }: TourHeroProps) {
  const averageRating = tour.rating || 0
  const reviewCount = tour.reviewCount || 0

  // Optimized blur data URL for better loading experience
  const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAREBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

  // Get the featured or first image with improved fallback logic
  const heroImage = tour.featuredImage || 
                   tour.images?.find(img => img.isFeatured) || 
                   tour.images?.[0]

  // Optimized image source handling
  const imageSource = heroImage?.data ? (
    heroImage.data.startsWith('data:') ? heroImage.data : 
    heroImage.data.startsWith('/') ? heroImage.data : 
    `data:${heroImage.type || 'image/jpeg'};base64,${heroImage.data}`
  ) : ''

  // Get alt text for the image
  const altText = (heroImage && 'altText' in heroImage && heroImage.altText 
    ? heroImage.altText 
    : tour.title) as string

  return (
    <section className="relative text-white min-h-[60vh]">
      <div className="absolute inset-0 bg-black/40">
        {imageSource ? (
          <Image
            src={imageSource}
            alt={altText}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            quality={75} // Reduced from 85 to 75 for better performance
            placeholder="blur"
            blurDataURL={blurDataURL}
            loading="eager" // Force eager loading for hero
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-900 to-green-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {!isListingPage && (
          <div className="mb-6">
            <Link
              href="/tours"
              className="inline-flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white transition-colors bg-emerald-900/30 hover:bg-emerald-900/40 backdrop-blur-sm px-3 py-1 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to All Tours
            </Link>
          </div>
        )}
        <div className={`${isListingPage ? 'text-center' : 'md:flex justify-between items-end gap-8'}`}>
          <div className={`${isListingPage ? 'mx-auto' : 'max-w-3xl'}`}>
            {!isListingPage && (
              <Badge variant="secondary" className="mb-3 bg-emerald-600 text-white border-0 hover:bg-emerald-700">
                {tour.category?.name || "Adventure"}
              </Badge>
            )}
            <h1 className="text-4xl sm:text-5xl font-bold font-playfair text-shadow-lg">{tour.title}</h1>
            <p className="mt-4 text-lg text-emerald-50 max-w-2xl text-shadow mx-auto">{tour.shortDescription || tour.title}</p>
          </div>
          {!isListingPage && tour.price > 0 && (
            <div className="mt-6 md:mt-0 flex-shrink-0">
              <div className="text-3xl font-bold text-right">
                ${tour.price}
                <span className="text-base font-normal text-emerald-100"> / person</span>
              </div>
            </div>
          )}
        </div>
        {!isListingPage && (
          <div className="mt-8 pt-6 border-t border-emerald-100/20 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">{averageRating.toFixed(1)}</span>
              <span className="text-emerald-100 text-sm">({reviewCount} reviews)</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span className="font-medium">
                {tour.locationRegion && tour.locationCountry 
                  ? `${tour.locationRegion}, ${tour.locationCountry}`
                  : tour.locationCountry || 'Location to be confirmed'
                }
              </span>
            </div>
            {tour.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-400" />
                <span className="font-medium">{tour.duration} days</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
