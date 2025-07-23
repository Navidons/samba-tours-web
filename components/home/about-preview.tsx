import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Award, Users, Globe, Heart, ArrowRight, Shield, Star } from "lucide-react"

const achievements = [
  {
    icon: Award,
    title: "15+ Years Excellence",
    description: "Industry-leading experience in Uganda tourism",
    color: "from-yellow-500 to-green-500",
  },
  {
    icon: Users,
    title: "5,000+ Happy Travelers",
    description: "Satisfied adventurers from over 50 countries",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Shield,
    title: "100% Safety Record",
    description: "Uncompromising commitment to traveler safety",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Heart,
    title: "Conservation Partners",
    description: "Supporting wildlife and community conservation",
    color: "from-green-500 to-emerald-500",
  },
]



export default function AboutPreview() {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-emerald-50 to-green-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-40 left-20 w-96 h-96 bg-emerald-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-40 w-80 h-80 bg-green-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container-max px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-6 py-3 rounded-full text-sm font-bold mb-6 border border-green-200">
              <Globe className="h-4 w-4 mr-2" />
              About Samba Tours
            </div>

            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-6 leading-tight">
              Your Gateway to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                Authentic Africa
              </span>
            </h2>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              For over 15 years, we've been crafting extraordinary adventures that showcase Uganda's incredible
              biodiversity, rich culture, and breathtaking landscapes. Our passion for conservation and community
              development drives everything we do.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Expert Local Guides</h3>
                  <p className="text-gray-600">
                    Our certified guides are passionate locals with deep knowledge of Uganda's wildlife and culture.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Safety First Approach</h3>
                  <p className="text-gray-600">
                    Your safety is our top priority with comprehensive insurance and emergency protocols.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Conservation Impact</h3>
                  <p className="text-gray-600">
                    Every tour contributes to wildlife conservation and local community development projects.
                  </p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-8 py-4 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
              asChild
            >
              <Link href="/about">
                Learn More About Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Right Content - Achievements Grid */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {achievements.map((achievement, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg bg-white"
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${achievement.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <achievement.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {achievement.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{achievement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>


          </div>
        </div>
      </div>
    </section>
  )
}
