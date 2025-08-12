import { Suspense } from "react"
import { notFound } from "next/navigation"
import TourHero from "@/components/tours/tour-hero"
import TourDetails from "@/components/tours/tour-details"
import TourItinerary from "@/components/tours/tour-itinerary"
import TourInclusions from "@/components/tours/tour-inclusions"
import TourGallery from "@/components/tours/tour-gallery"
import TourReviews from "@/components/tours/tour-reviews"
import TourBooking from "@/components/tours/tour-booking"
import RelatedTours from "@/components/tours/related-tours"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ScrollGuard from "@/components/ui/scroll-guard"

import { getTour, getTourReviews, getBaseUrl } from "@/lib/tours-service"

interface TourPageProps {
  params: {
    slug: string
  }
}

async function getRelatedTours(currentTour: any) {
  try {
    const categoryId = currentTour.category?.id
    
    if (!categoryId) {
      return []
    }

    // Use absolute URL for server-side fetch
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/tours?category=${categoryId}&limit=3&exclude=${currentTour.id}`, {
      next: { revalidate: 3600 }
    })
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    return data.success ? data.tours : []
  } catch (error) {
    console.error('Error fetching related tours:', error)
    return []
  }
}

export const dynamic = 'force-dynamic'

export default async function TourPage({ params }: TourPageProps) {
  const tour = await getTour(params.slug)

  if (!tour) {
    notFound()
  }

  // Parallelize secondary data fetches; do not block first render
  const [reviewsData, relatedTours] = await Promise.all([
    getTourReviews(params.slug).catch(() => ({ reviews: [], pagination: { total: 0 } })),
    getRelatedTours(tour).catch(() => [])
  ])

  return (
    <ScrollGuard>
      <main className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-green-50/30">

        {/* Hero Section */}
        <TourHero tour={tour} />

        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8 lg:space-y-12">
              <TourDetails tour={tour} />
              <TourItinerary itinerary={tour.itinerary} />
              <TourInclusions included={tour.inclusions} excluded={tour.exclusions} />
              <TourGallery images={tour.images} title={tour.title} />
              <Suspense fallback={<LoadingSpinner />}>
                <TourReviews
                  tourId={tour.id}
                  rating={tour.rating}
                  reviewCount={reviewsData.pagination.total}
                  reviews={reviewsData.reviews}
                />
              </Suspense>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <TourBooking tour={tour} />
            </div>
          </div>

          {/* Related Tours */}
          <section className="mt-12 lg:mt-16">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 lg:mb-8">Related Tours</h2>
            <RelatedTours currentTour={tour} relatedTours={relatedTours} />
          </section>
        </div>
      </main>
      
      {/* Bottom spacing for mobile floating action button */}
      <div className="h-20 lg:hidden"></div>
    </ScrollGuard>
  )
}

export async function generateMetadata({ params }: TourPageProps) {
  const tour = await getTour(params.slug)

  if (!tour) {
    return {
      title: "Tour Not Found",
      description: "The requested tour could not be found."
    }
  }

  const title = `${tour.title} - Uganda Safari Tour`
  const description = tour.shortDescription || 
    `Experience ${tour.title} with Samba Tours. ${tour.duration}-day adventure through Uganda's stunning landscapes. Starting from $${tour.price}.`
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sambatours.co'
  const canonicalUrl = `${baseUrl}/tours/${params.slug}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}
