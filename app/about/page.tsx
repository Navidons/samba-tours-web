import type { Metadata } from "next"
import AboutHero from "@/components/about/about-hero"
import CompanyStory from "@/components/about/company-story"
import ValuesSection from "@/components/about/values-section"
import AchievementsSection from "@/components/about/achievements-section"
import WhyChooseUs from "@/components/about/why-choose-us"
import CallToAction from "@/components/about/call-to-action"

export const metadata: Metadata = {
  title: "About Samba Tours Uganda - Your Trusted Safari Partner",
  description:
    "Learn about Samba Tours Uganda, your trusted partner for authentic safari experiences. Discover our story, values, and commitment to sustainable tourism.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <AboutHero />
      <CompanyStory />
      <ValuesSection />
      <AchievementsSection />
      <WhyChooseUs />
      <CallToAction />
    </div>
  )
}
