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
import { getTour, getTourReviews } from "@/lib/tours-service"

interface TourPageProps {
  params: {
    slug: string
  }
}

export default async function TourPage({ params }: TourPageProps) {
  const tour = await getTour(params.slug)

  if (!tour) {
    notFound()
  }

  const reviewsData = await getTourReviews(params.slug)

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
              {tour.bestTime && Array.isArray(tour.bestTime) && tour.bestTime.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Best Time to Visit</h2>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    {tour.bestTime.map((item: any, idx: number) => (
                      <li key={idx}>{item.item || item}</li>
                    ))}
                  </ul>
                </section>
              )}
              {tour.whatToBring && Array.isArray(tour.whatToBring) && tour.whatToBring.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">What to Bring</h2>
                  <ul className="list-disc pl-6 text-gray-700 space-y-2">
                    {tour.whatToBring.map((item: any, idx: number) => (
                      <li key={idx}>{item.item || item}</li>
                    ))}
                  </ul>
                </section>
              )}
              {tour.physicalRequirements && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Physical Requirements</h2>
                  <div className="text-gray-700 prose prose-gray max-w-none">
                    <p>{tour.physicalRequirements}</p>
                  </div>
                </section>
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
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Tours</h2>
            <Suspense fallback={<LoadingSpinner />}>
              <RelatedTours currentTour={tour} relatedTours={[]} />
            </Suspense>
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
