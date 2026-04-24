import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Send } from "lucide-react"

export default function NewsletterCTA() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700">
      <div className="container-max">
        <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl">
          <div className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Mail className="h-8 w-8 text-white" />
            </div>

            <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-4">Never Miss an Adventure</h2>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Subscribe to our newsletter and get the latest travel stories, exclusive deals, and insider tips delivered
              straight to your inbox.
            </p>

            <form className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Input type="email" placeholder="Enter your email address" className="flex-1 h-12 text-lg" required />
                <Button
                  type="submit"
                  className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-base"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Subscribe
                </Button>
              </div>

              <p className="text-sm text-gray-500 mt-4">Join 5,000+ travelers who trust us. Unsubscribe anytime.</p>
            </form>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                <span>Weekly Travel Tips</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                <span>Exclusive Deals</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                <span>Adventure Stories</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
