import { Facebook, Instagram, Twitter, Youtube, Linkedin, TwitterIcon as TikTok } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const socialPlatforms = [
  {
    name: "Facebook",
    icon: Facebook,
    handle: "@SambaToursUganda",
    followers: "15.2K",
    description: "Daily updates, customer photos, and travel tips",
    href: "https://facebook.com/sambatours",
    color: "bg-blue-600 hover:bg-blue-700",
  },
  {
    name: "Instagram",
    icon: Instagram,
    handle: "@sambatours_uganda",
    followers: "28.5K",
    description: "Stunning photos and stories from our tours",
    href: "https://instagram.com/sambatours",
    color: "bg-pink-600 hover:bg-pink-700",
  },
  {
    name: "Twitter",
    icon: Twitter,
    handle: "@SambaToursUG",
    followers: "8.3K",
    description: "Real-time updates and travel news",
    href: "https://twitter.com/sambatours",
    color: "bg-sky-500 hover:bg-sky-600",
  },
  {
    name: "YouTube",
    icon: Youtube,
    handle: "Samba Tours Uganda",
    followers: "12.1K",
    description: "Virtual tours and travel documentaries",
    href: "https://youtube.com/sambatours",
    color: "bg-red-600 hover:bg-red-700",
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    handle: "Samba Tours & Travel",
    followers: "3.2K",
    description: "Professional updates and industry insights",
    href: "https://linkedin.com/company/sambatours",
    color: "bg-blue-700 hover:bg-blue-800",
  },
  {
    name: "TikTok",
    icon: TikTok,
    handle: "@sambatours_ug",
    followers: "45.7K",
    description: "Fun travel moments and behind-the-scenes",
    href: "https://tiktok.com/@sambatours",
    color: "bg-black hover:bg-gray-800",
  },
]

export default function SocialConnect() {
  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 mb-4">
          Connect With Us on Social Media
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Follow our adventures, get travel inspiration, and stay updated with the latest from Uganda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {socialPlatforms.map((platform, index) => (
          <Card key={index} className="group hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 ${platform.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                >
                  <platform.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                  <p className="text-sm text-gray-600">{platform.handle}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900 mb-1">{platform.followers}</div>
                <p className="text-sm text-gray-600">{platform.description}</p>
              </div>

              <Button asChild className={`w-full ${platform.color} text-white border-0`}>
                <a href={platform.href} target="_blank" rel="noopener noreferrer">
                  Follow Us
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Social Feed Preview */}
      <div className="mt-12 bg-gradient-to-r from-emerald-50 to-gray-50 p-8 rounded-2xl">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-playfair font-bold text-gray-900 mb-2">Latest from Our Social Media</h3>
          <p className="text-gray-600">See what our travelers are sharing about their Uganda adventures</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-lg p-4 shadow-sm">
              <div className="aspect-square bg-gradient-to-br from-emerald-200 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                <Instagram className="h-8 w-8 text-gray-600" />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                "Amazing gorilla trekking experience with @sambatours_uganda! The guides were incredible and the
                wildlife was breathtaking. #UgandaSafari #GorillaTracking"
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>@traveler{item}</span>
                <span>2 hours ago</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
