import type { Metadata } from "next"
import ContactForm from "@/components/contact/contact-form"
import ContactInfo from "@/components/contact/contact-info"
import ContactHero from "@/components/contact/contact-hero"

export const metadata: Metadata = {
  title: "Contact Samba Tours - Get in Touch for Uganda Safaris",
  description: "Ready for your Uganda adventure? Contact Samba Tours for expert safari planning, gorilla trekking, and personalized travel experiences. Get instant support and quotes."
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-emerald-50">
      {/* Preload the hero image */}
      <link
        rel="preload"
        href="/photos/savannah-plains-kidepo-uganda-1024x683.webp"
        as="image"
        type="image/webp"
      />
      
      <ContactHero />

      {/* Contact Section */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContactInfo />
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}
