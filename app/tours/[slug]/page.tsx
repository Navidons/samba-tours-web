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
import Breadcrumbs from "@/components/seo/breadcrumbs"
import StructuredData from "@/components/seo/structured-data"
import { generateSEOMetadata, generateTourSchema, generateFAQSchema } from "@/lib/seo"
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

  const reviewsData = await getTourReviews(params.slug)
  let relatedTours = []
  try {
    relatedTours = await getRelatedTours(tour)
  } catch (error) {
    console.error('Error fetching related tours:', error)
    // Continue without related tours if they fail to load
  }

  // Generate structured data
  const tourSchema = generateTourSchema(tour)
  const breadcrumbItems = [
    { name: 'Tours', url: '/tours' },
    ...(tour.category ? [{ name: tour.category.name, url: `/tours/category/${tour.category.slug}` }] : []),
    { name: tour.title, url: `/tours/${tour.slug}`, current: true }
  ]

  // Generate FAQ schema if tour has FAQ data
  const faqSchema = tour.faqs && tour.faqs.length > 0 
    ? generateFAQSchema(tour.faqs.map((faq: any) => ({
        question: faq.question,
        answer: faq.answer
      })))
    : null

  const schemas = [tourSchema, faqSchema].filter(Boolean)

  return (
    <>
      <StructuredData data={schemas} />
      
      <main className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-green-50/30">
        {/* Breadcrumbs */}
        <div className="container-max pt-6">
          <Breadcrumbs items={breadcrumbItems} />
        </div>

        {/* Hero Section */}
        <TourHero tour={tour} />

        <div className="container-max section-padding">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
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
              <div className="sticky top-8">
                <TourBooking tour={tour} />
              </div>
            </div>
          </div>

          {/* Related Tours */}
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Tours</h2>
            <RelatedTours currentTour={tour} relatedTours={relatedTours} />
          </section>
        </div>
      </main>
    </>
  )
}

export async function generateMetadata({ params }: TourPageProps) {
  const tour = await getTour(params.slug)

  if (!tour) {
    return generateSEOMetadata({
      title: "Tour Not Found",
      description: "The requested tour could not be found.",
      noIndex: true
    })
  }

  const title = tour.metaTitle || `${tour.title} - Uganda Safari Tour`
  const description = tour.metaDescription || tour.shortDescription || 
    `Experience ${tour.title} with Samba Tours. ${tour.duration}-day adventure through Uganda's stunning landscapes. Starting from $${tour.price}.`
  
  const keywords = [
    tour.title.toLowerCase(),
    `${tour.title.toLowerCase()} Uganda`,
    `${tour.title.toLowerCase()} safari`,
    `${tour.title.toLowerCase()} tour`,
    ...(tour.category ? [tour.category.name.toLowerCase()] : []),
    ...(tour.seoKeywords || []),
    'Uganda safari',
    'Uganda tour',
    'East Africa adventure'
  ]

  const images = tour.images && tour.images.length > 0 
    ? tour.images.slice(0, 4).map((img: any) => 
        typeof img === 'string' 
          ? (img.startsWith('http') ? img : `/images/tours/${img}`)
          : (img.data?.startsWith('http') ? img.data : `/images/tours/${img.data || ''}`)
      )
    : []

  return generateSEOMetadata({
    title,
    description,
    keywords,
    images,
    type: 'website',
    canonical: `/tours/${tour.slug}`,
    alternates: {
      'application/ld+json': `/api/tours/${tour.slug}/schema`
    }
  })
}
