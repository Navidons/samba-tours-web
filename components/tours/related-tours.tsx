import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Star, ArrowRight } from "lucide-react"

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
  images: Array<{
    id: number
    data: string
    name: string | null
    type: string | null
    size: number | null
    altText: string | null
    title: string | null
    description: string | null
    isFeatured: boolean
    displayOrder: number
  }> | null
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
  createdAt: string
  updatedAt: string
}

interface RelatedToursProps {
  currentTour?: Tour
  relatedTours?: Tour[]
}

export default function RelatedTours({ currentTour, relatedTours }: RelatedToursProps) {
  if (!relatedTours || relatedTours.length === 0) {
    return null
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-playfair font-bold text-gray-900 mb-4">Similar Adventures</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover more incredible experiences in the same category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {relatedTours.map((tour) => (
            <Card key={tour.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border border-emerald-100">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={tour.featuredImage?.data || tour.images?.[0]?.data}
                  alt={tour.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <Badge className="bg-emerald-600 text-white">{tour.category?.name || "Uncategorized"}</Badge>
                  {tour.featured && <Badge className="bg-emerald-500 text-white">Featured</Badge>}
                  {tour.isNew && <Badge className="bg-green-600 text-white">New</Badge>}
                </div>
                <div className="absolute top-4 right-4">
                  <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs font-semibold">{tour.rating}</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {tour.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{tour.shortDescription}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4 text-emerald-600" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4 text-emerald-600" />
                    <span>Max {tour.groupSize}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-emerald-600">${tour.price}</span>
                    {tour.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">${tour.originalPrice}</span>
                    )}
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                  >
                    <Link href={`/tours/${tour.slug}`} className="flex items-center space-x-1">
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white bg-transparent"
          >
            <Link href="/tours">View All Tours</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
