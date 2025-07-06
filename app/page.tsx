import { Suspense } from "react"
import HeroSection from "@/components/home/hero-section"
import FeaturedTours from "@/components/home/featured-tours"
import AboutPreview from "@/components/home/about-preview"
import TestimonialsPreview from "@/components/home/testimonials-preview"
import NewsletterSignup from "@/components/home/newsletter-signup"
import TrustSignals from "@/components/home/trust-signals"
import UrgencyBanner from "@/components/home/urgency-banner"
import LoadingSpinner from "@/components/ui/loading-spinner"

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <UrgencyBanner />
      <HeroSection />
      <TrustSignals />

      <FeaturedTours />

      <AboutPreview />

      <Suspense fallback={<LoadingSpinner />}>
        <TestimonialsPreview />
      </Suspense>

      <NewsletterSignup />
    </main>
  )
}
