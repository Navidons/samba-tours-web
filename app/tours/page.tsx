import type { Metadata } from "next"
import ToursClient from "./ToursClient"
import { getTours, getCategories } from "@/lib/tours-service"
import ScrollGuard from "@/components/ui/scroll-guard"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Users, Calendar, ArrowRight, Play } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Uganda Safari Tours - Gorilla Trekking & Wildlife Adventures",
  description: "Discover Uganda's best safari tours: gorilla trekking, wildlife safaris, cultural experiences, and adventure activities. Expert guides and unforgettable experiences."
}

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'

// Add revalidation for better performance
export const revalidate = 300 // 5 minutes

// Separate component for the hero section that loads immediately
function ToursHero() {
  return (
    <section className="relative text-white min-h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 bg-black/40">
        <Image
          src="/photos/giraffe-uganda-savana-hero.jpg"
          alt="Uganda Safari Tours - Giraffe in beautiful savanna landscape"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAREBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge className="mb-6 bg-emerald-600 text-white border-0 hover:bg-emerald-700 text-sm px-4 py-2">
            <Star className="w-4 h-4 mr-2" />
            Trusted by 10,000+ Travelers
          </Badge>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-playfair text-shadow-lg mb-6 leading-tight">
            Discover Uganda's
            <span className="block text-emerald-400">Hidden Treasures</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-emerald-50 max-w-3xl mx-auto mb-8 text-shadow leading-relaxed">
            From intimate gorilla encounters to epic savannah adventures, explore our curated collection of unforgettable journeys through the Pearl of Africa.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center items-center gap-8 mb-10 text-emerald-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold">15+ Destinations</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold">Expert Guides</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold">Year-Round Tours</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="font-semibold">4.9/5 Rating</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              asChild
            >
              <Link href="#tours">
                Explore Tours
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}

// Separate component for the tours section that can load independently
async function ToursSection() {
  // Fetch data for tours section
  const [initialData, categories] = await Promise.all([
    getTours({ page: 1, limit: 8, sortBy: "popular" }),
    getCategories(),
  ])

  return (
    <div id="tours">
      <ToursClient 
        initialTours={initialData.tours} 
        initialTotalTours={initialData.pagination.total}
        initialTotalPages={initialData.pagination.totalPages}
        initialCategories={categories}
      />
    </div>
  )
}

export default function ToursPage() {
  return (
    <div className="bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50 min-h-screen">
      {/* Hero Section - Loads immediately (server-rendered) */}
      <ToursHero />

      {/* Tours Section - Wrap only this part in client ScrollGuard to avoid blocking hero */}
      <ScrollGuard>
        <Suspense
          fallback={
            <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="group overflow-hidden rounded-lg border border-emerald-100 bg-white shadow-sm">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <div className="animate-pulse absolute inset-0 bg-emerald-100" />
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="animate-pulse h-5 w-2/3 bg-emerald-100 rounded" />
                      <div className="animate-pulse h-4 w-full bg-emerald-50 rounded" />
                      <div className="animate-pulse h-4 w-5/6 bg-emerald-50 rounded" />
                      <div className="flex items-center justify-between pt-2">
                        <div className="animate-pulse h-4 w-24 bg-emerald-50 rounded" />
                        <div className="animate-pulse h-4 w-20 bg-emerald-50 rounded" />
                      </div>
                      <div className="animate-pulse h-10 w-full bg-emerald-100 rounded mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <ToursSection />
        </Suspense>
      </ScrollGuard>
    </div>
  )
}
