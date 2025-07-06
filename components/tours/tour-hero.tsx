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
}

type TourHeroProps = {
  tour: Tour
}

export default function TourHero({ tour }: TourHeroProps) {
  const averageRating = tour.rating || 0
  const reviewCount = tour.reviewCount || 0

  return (
    <section className="relative text-white">
      <div className="absolute inset-0 bg-black">
        {tour.images && tour.images.length > 0 && tour.images[0].data ? (
          <img
            src={tour.images[0].data.startsWith('data:') ? tour.images[0].data : `data:${tour.images[0].type};base64,${tour.images[0].data}`}
            alt={tour.images[0].altText || tour.title}
            className="w-full h-full object-cover opacity-60"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
        )}
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="mb-6">
          <Link
            href="/tours"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white transition-colors bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to All Tours
          </Link>
        </div>
        <div className="md:flex justify-between items-end gap-8">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-3 bg-orange-500 text-white border-0">
              {tour.category?.name || "Adventure"}
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold font-playfair text-shadow-lg">{tour.title}</h1>
            <p className="mt-4 text-lg text-gray-200 max-w-2xl text-shadow">{tour.shortDescription || tour.title}</p>
          </div>
          <div className="mt-6 md:mt-0 flex-shrink-0">
            <div className="text-3xl font-bold text-right">
              ${tour.price}
              <span className="text-base font-normal text-gray-300"> / person</span>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/20 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="font-semibold">{averageRating.toFixed(1)}</span>
            <span className="text-gray-300 text-sm">({reviewCount} reviews)</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-orange-400" />
            <span className="font-medium">
              {tour.locationRegion && tour.locationCountry 
                ? `${tour.locationRegion}, ${tour.locationCountry}`
                : tour.locationCountry || 'Location to be confirmed'
              }
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <span className="font-medium">{tour.duration} days</span>
          </div>
        </div>
      </div>
    </section>
  )
}
