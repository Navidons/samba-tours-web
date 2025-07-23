import type { Metadata } from "next"
import ToursClient from "./ToursClient"
import TourHero from "@/components/tours/tour-hero"
import { getTours, getCategories } from "@/lib/tours-service"

export const metadata: Metadata = {
  title: "Uganda Safari Tours & Experiences | Samba Tours",
  description: "Explore handpicked Uganda safari tours, from gorilla trekking to wildlife adventures. Plan your perfect journey with our expert guides and custom packages.",
}

export const dynamic = 'force-dynamic'

export default async function ToursPage() {
  // Fetch initial data server-side
  const initialData = await getTours({ page: 1, limit: 12, sortBy: "popular" })
  const categories = await getCategories()

  // Mock tour data for the hero section
  const heroTour = {
    id: "tours-page",
    title: "Discover Uganda's Hidden Treasures",
    shortDescription: "From gorilla encounters to savannah adventures, explore our curated collection of unforgettable journeys through the Pearl of Africa.",
    price: 0, // Not shown in tours listing page
    duration: "",
    locationCountry: "Uganda",
    rating: 4.9,
    reviewCount: 500,
    category: {
      id: 1,
      name: "All Tours",
      slug: "all-tours"
    },
    images: [{
      id: "hero",
      data: "/photos/giraffe-uganda-savana-hero.jpg",
      name: "Uganda Safari",
      type: "image/jpeg",
      size: 0,
      altText: "Giraffe in Uganda's beautiful savanna landscape",
      isFeatured: true,
      displayOrder: 1
    }]
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-emerald-50 to-green-50 min-h-screen">
      <TourHero tour={heroTour} isListingPage={true} />
      <ToursClient 
        initialTours={initialData.tours} 
        initialTotalTours={initialData.pagination.total}
        initialTotalPages={initialData.pagination.totalPages}
        initialCategories={categories}
      />
    </div>
  )
}
