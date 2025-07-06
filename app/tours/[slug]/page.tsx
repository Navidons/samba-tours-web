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

interface TourPageProps {
  params: {
    slug: string
  }
}

async function getTourData(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/tours/${slug}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.success ? data.tour : null
  } catch (error) {
    console.error("Error fetching tour:", error)
    return null
  }
}

async function getTourReviews(tourSlug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/tours/${tourSlug}/reviews`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return { reviews: [], pagination: { total: 0 } }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return { reviews: [], pagination: { total: 0 } }
  }
}

export default async function TourPage({ params }: TourPageProps) {
  const tour = await getTourData(params.slug)

  if (!tour) {
    notFound()
  }

  const reviewsData = await getTourReviews(params.slug)

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <TourHero tour={tour} />

      <div className="container-max section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <TourDetails tour={tour} />
            {tour.bestTime && Array.isArray(tour.bestTime) && tour.bestTime.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-earth-900 mb-2">Best Time to Visit</h3>
                <ul className="list-disc pl-6 text-earth-700">
                  {tour.bestTime.map((item: any, idx: number) => (
                    <li key={idx}>{item.item || item}</li>
                  ))}
                </ul>
              </div>
            )}
            {tour.whatToBring && Array.isArray(tour.whatToBring) && tour.whatToBring.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-earth-900 mb-2">What to Bring</h3>
                <ul className="list-disc pl-6 text-earth-700">
                  {tour.whatToBring.map((item: any, idx: number) => (
                    <li key={idx}>{item.item || item}</li>
                  ))}
                </ul>
              </div>
            )}
            {tour.physicalRequirements && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-earth-900 mb-2">Physical Requirements</h3>
                <p className="text-earth-700">{tour.physicalRequirements}</p>
              </div>
            )}
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
            <div className="sticky top-8">
              <TourBooking tour={tour} />
            </div>
          </div>
        </div>

        {/* Related Tours */}
        <div className="mt-16">
          <Suspense fallback={<LoadingSpinner />}>
            <RelatedTours currentTour={tour} relatedTours={[]} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

export async function generateMetadata({ params }: TourPageProps) {
  const tour = await getTourData(params.slug)

  if (!tour) {
    return {
      title: "Tour Not Found - Samba Tours",
    }
  }

  return {
    title: `${tour.title} - Samba Tours`,
    description: tour.shortDescription,
    openGraph: {
      title: tour.title,
      description: tour.shortDescription,
      images: tour.images?.slice(0, 1) || [],
    },
  }
}
