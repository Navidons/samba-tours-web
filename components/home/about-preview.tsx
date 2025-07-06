import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Award, Users, Globe, Heart, ArrowRight, Shield, Star } from "lucide-react"

const achievements = [
  {
    icon: Award,
    title: "15+ Years Excellence",
    description: "Industry-leading experience in Uganda tourism",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Users,
    title: "5,000+ Happy Travelers",
    description: "Satisfied adventurers from over 50 countries",
    color: "from-blue-500 to-purple-500",
  },
  {
    icon: Shield,
    title: "100% Safety Record",
    description: "Uncompromising commitment to traveler safety",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Heart,
    title: "Conservation Partners",
    description: "Supporting wildlife and community conservation",
    color: "from-red-500 to-pink-500",
  },
]

const teamMembers = [
  {
    name: "David Mukasa",
    role: "Founder & CEO",
    image: "/photos/chimpanzee-bwindi-forest-impenetrable-park.jpg",
    experience: "20+ years",
    specialty: "Gorilla Trekking Expert",
  },
  {
    name: "Sarah Namukasa",
    role: "Operations Manager",
    image: "/photos/queen-elizabeth-national-park-ug-kasese-hero.jpg",
    experience: "15+ years",
    specialty: "Cultural Tours Specialist",
  },
  {
    name: "James Okello",
    role: "Senior Safari Guide",
    image: "/photos/uganda-monkeys.jpg",
    experience: "12+ years",
    specialty: "Wildlife Photography",
  },
]

export default function AboutPreview() {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-cream-50 to-earth-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-40 left-20 w-96 h-96 bg-forest-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-40 w-80 h-80 bg-orange-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container-max px-4 relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center bg-gradient-to-r from-forest-100 to-orange-100 text-forest-700 px-6 py-3 rounded-full text-sm font-bold mb-6 border border-forest-200">
              <Globe className="h-4 w-4 mr-2" />
              About Samba Tours
            </div>

            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-earth-900 mb-6 leading-tight">
              Your Gateway to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-forest-600 to-orange-600">
                Authentic Africa
              </span>
            </h2>

            <p className="text-xl text-earth-600 mb-8 leading-relaxed">
              For over 15 years, we've been crafting extraordinary adventures that showcase Uganda's incredible
              biodiversity, rich culture, and breathtaking landscapes. Our passion for conservation and community
              development drives everything we do.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-forest-100 to-forest-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-forest-600" />
                </div>
                <div>
                  <h3 className="font-bold text-earth-900 mb-2">Expert Local Guides</h3>
                  <p className="text-earth-600">
                    Our certified guides are passionate locals with deep knowledge of Uganda's wildlife and culture.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-earth-900 mb-2">Safety First Approach</h3>
                  <p className="text-earth-600">
                    Your safety is our top priority with comprehensive insurance and emergency protocols.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-earth-900 mb-2">Conservation Impact</h3>
                  <p className="text-earth-600">
                    Every tour contributes to wildlife conservation and local community development projects.
                  </p>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white px-8 py-4 text-lg font-bold rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
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
                    <h3 className="font-bold text-earth-900 mb-2 group-hover:text-forest-600 transition-colors">
                      {achievement.title}
                    </h3>
                    <p className="text-earth-600 text-sm leading-relaxed">{achievement.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Team Preview */}
            <Card className="bg-gradient-to-br from-forest-600 to-forest-800 text-white border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">Meet Our Expert Team</h3>
                <div className="grid grid-cols-3 gap-4">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="text-center group">
                      <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-3 border-3 border-white/30 group-hover:border-white transition-colors duration-300">
                        <img
                          src={member.image || "/placeholder.svg"}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <h4 className="font-bold text-sm mb-1">{member.name}</h4>
                      <p className="text-forest-200 text-xs mb-1">{member.role}</p>
                      <p className="text-forest-300 text-xs">{member.experience}</p>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-forest-900 font-bold rounded-full bg-transparent"
                    asChild
                  >
                    <Link href="/about#team">Meet Full Team</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
