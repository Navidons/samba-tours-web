import { Suspense } from "react"
import { Metadata } from "next"
import HeroSection from "@/components/home/hero-section"
import FeaturedTours from "@/components/home/featured-tours"
import AboutPreview from "@/components/home/about-preview"
import TestimonialsPreview from "@/components/home/testimonials-preview"
import NewsletterSignup from "@/components/home/newsletter-signup"
import TrustSignals from "@/components/home/trust-signals"
import UrgencyBanner from "@/components/home/urgency-banner"
import LoadingSpinner from "@/components/ui/loading-spinner"
import StructuredData from "@/components/seo/structured-data"
import { generateSEOMetadata, generateOrganizationSchema, generateFAQSchema, SEO_CONFIG } from "@/lib/seo"

// Homepage FAQ data for structured data
const homepageFAQs = [
  {
    question: "What makes Samba Tours the best choice for Uganda safaris?",
    answer: "Samba Tours offers over 10 years of experience, expert local guides, sustainable tourism practices, and personalized service. We specialize in gorilla trekking, wildlife safaris, and cultural experiences across Uganda."
  },
  {
    question: "How do I book a tour with Samba Tours?",
    answer: "You can book directly through our website, contact us via email at info@sambatours.org, or call us. We offer flexible booking options and personalized itineraries to match your preferences."
  },
  {
    question: "What is included in Samba Tours packages?",
    answer: "Our tour packages typically include accommodation, meals, transportation, park fees, professional guides, and all activities mentioned in the itinerary. Specific inclusions vary by tour."
  },
  {
    question: "When is the best time to visit Uganda for safaris?",
    answer: "Uganda offers year-round wildlife viewing. The dry seasons (December-February and June-September) are ideal for gorilla trekking and general safaris, while the wet seasons offer excellent bird watching."
  }
]

export const metadata: Metadata = generateSEOMetadata({
  title: "Uganda Safari & Adventure Tours | Samba Tours",
  description: "Discover Uganda with expert-guided gorilla trekking, wildlife safaris, and cultural tours. Experience authentic African adventures with our local guides.",
  keywords: [
    'Uganda tours', 'Uganda safari', 'gorilla trekking Uganda', 'wildlife safari',
    'Bwindi gorilla trekking', 'Uganda travel', 'East Africa safari', 'adventure travel Uganda',
    'Uganda tour packages', 'Murchison Falls', 'Queen Elizabeth Park', 'cultural tours Uganda',
    'Uganda travel agency', 'eco tourism Uganda', 'mountain gorilla tours', 'Uganda vacation',
    'African safari', 'primate tours', 'birding tours Uganda', 'Uganda honeymoon safari',
    'best Uganda tour operator', 'Uganda safari packages', 'Uganda wildlife tours'
  ],
  images: ['/images/og-homepage.webp', '/images/gorilla-trekking-hero.jpg'],
  canonical: '/',
  alternates: {
    types: '/rss.xml'
  }
})

export default function HomePage() {
  const organizationSchema = generateOrganizationSchema()
  const faqSchema = generateFAQSchema(homepageFAQs)
  
  // Website schema for homepage
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SEO_CONFIG.siteName,
    "url": SEO_CONFIG.siteUrl,
    "description": SEO_CONFIG.defaultDescription,
    "publisher": {
      "@type": "Organization",
      "name": SEO_CONFIG.organization.name
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SEO_CONFIG.siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  }

  const schemas = [organizationSchema, websiteSchema, faqSchema]

  return (
    <>
      <StructuredData data={schemas} />
      
      <main className="min-h-screen">
        {/* Above the fold content */}
        <header role="banner">
          <UrgencyBanner />
          <HeroSection />
        </header>

        {/* Trust signals for credibility */}
        <section aria-label="Trust and credibility indicators">
          <TrustSignals />
        </section>

        {/* Featured tours section */}
        <section aria-labelledby="featured-tours-heading">
          <h2 id="featured-tours-heading" className="sr-only">Featured Tours</h2>
          <FeaturedTours />
        </section>

        {/* About company preview */}
        <section aria-labelledby="about-preview-heading">
          <h2 id="about-preview-heading" className="sr-only">About Samba Tours</h2>
          <AboutPreview />
        </section>

        {/* Customer testimonials */}
        <section aria-labelledby="testimonials-heading">
          <h2 id="testimonials-heading" className="sr-only">Customer Testimonials</h2>
          <Suspense fallback={<LoadingSpinner />}>
            <TestimonialsPreview />
          </Suspense>
        </section>

        {/* Newsletter signup */}
        <section aria-labelledby="newsletter-heading">
          <h2 id="newsletter-heading" className="sr-only">Newsletter Signup</h2>
          <NewsletterSignup />
        </section>
      </main>
    </>
  )
}
