import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Phone, Mail, MessageCircle } from "lucide-react"

export default function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-600 to-green-600 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">Ready to Start Your Uganda Adventure?</h2>
          <p className="text-xl text-emerald-100 mb-8 leading-relaxed">
            Let our expert team help you plan the perfect Uganda experience. Whether you're dreaming of gorilla
            encounters, thrilling safaris, or cultural immersion, we're here to make it happen.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100 text-emerald-600 px-8 py-4 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              asChild
            >
              <Link href="/tours" className="flex items-center space-x-2">
                <span>Browse Our Tours</span>
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-8 py-4 font-semibold backdrop-blur-sm bg-transparent"
              asChild
            >
              <Link href="/contact" className="flex items-center space-x-2">
                <span>Plan Custom Tour</span>
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-colors duration-300">
              <Phone className="h-8 w-8 mx-auto mb-3 text-emerald-200" />
              <h3 className="font-semibold mb-2">Call Us</h3>
              <p className="text-emerald-200">+256 700 123 456</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-colors duration-300">
              <Mail className="h-8 w-8 mx-auto mb-3 text-emerald-200" />
              <h3 className="font-semibold mb-2">Email Us</h3>
              <p className="text-emerald-200">info@sambatours.com</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-colors duration-300">
              <MessageCircle className="h-8 w-8 mx-auto mb-3 text-emerald-200" />
              <h3 className="font-semibold mb-2">WhatsApp</h3>
              <p className="text-emerald-200">Quick Response</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
