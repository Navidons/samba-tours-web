import type { Metadata } from "next"
import ContactForm from "@/components/contact/contact-form"
import ContactInfo from "@/components/contact/contact-info"
import ContactHero from "@/components/contact/contact-hero"

export const metadata: Metadata = {
  title: "Contact Us - Samba Tours & Travel",
  description: "Connect with Uganda's premier safari experts. Our experienced team is ready to help plan your perfect adventure, from gorilla trekking to wildlife safaris.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-emerald-50">
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
