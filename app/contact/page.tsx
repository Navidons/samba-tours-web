import ContactForm from "@/components/contact/contact-form"
import ContactInfo from "@/components/contact/contact-info"
import ContactHero from "@/components/contact/contact-hero"

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
