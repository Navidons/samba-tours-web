import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Languages, Award, User } from "lucide-react"

const teamMembers = [
  {
    name: "David Mukasa",
    role: "Founder & CEO",
    bio: "With over 10 years in Uganda's tourism industry, David founded Samba Tours with a vision to showcase authentic Uganda experiences.",
    specialties: ["Wildlife Safari", "Gorilla Trekking", "Cultural Tours"],
    languages: ["English", "Luganda", "Swahili"],
    certifications: ["Uganda Tourism Guide", "First Aid Certified"],
    initials: "DM",
  },
  {
    name: "Sarah Namukasa",
    role: "Operations Manager",
    bio: "Sarah ensures every detail of your journey is perfectly planned. Her attention to detail and customer service excellence is unmatched.",
    specialties: ["Tour Planning", "Customer Service", "Logistics"],
    languages: ["English", "Luganda", "French"],
    certifications: ["Tourism Management", "Customer Service Excellence"],
    initials: "SN",
  },
  {
    name: "James Okello",
    role: "Senior Safari Guide",
    bio: "Born and raised near Queen Elizabeth National Park, James has an encyclopedic knowledge of Uganda's wildlife and ecosystems.",
    specialties: ["Big Five Safari", "Bird Watching", "Photography Tours"],
    languages: ["English", "Runyankole", "Swahili"],
    certifications: ["Professional Safari Guide", "Wildlife Conservation"],
    initials: "JO",
  },
  {
    name: "Mary Atuhaire",
    role: "Cultural Experience Coordinator",
    bio: "Mary bridges the gap between visitors and local communities, creating meaningful cultural exchanges and authentic experiences.",
    specialties: ["Cultural Tours", "Community Engagement", "Traditional Crafts"],
    languages: ["English", "Rukiga", "Luganda"],
    certifications: ["Cultural Heritage Guide", "Community Development"],
    initials: "MA",
  },
  {
    name: "Robert Tumusiime",
    role: "Adventure Sports Specialist",
    bio: "For adrenaline seekers, Robert is your go-to expert. He specializes in adventure activities across Uganda's diverse landscapes.",
    specialties: ["Mountain Climbing", "White Water Rafting", "Hiking"],
    languages: ["English", "Rukiga", "Swahili"],
    certifications: ["Mountain Guide", "Water Sports Instructor"],
    initials: "RT",
  },
  {
    name: "Grace Nakato",
    role: "Gorilla Trekking Specialist",
    bio: "Grace has led over 200 gorilla trekking expeditions and is passionate about gorilla conservation and education.",
    specialties: ["Gorilla Trekking", "Primate Tours", "Conservation"],
    languages: ["English", "Luganda", "Rukiga"],
    certifications: ["Gorilla Trekking Guide", "Primate Conservation"],
    initials: "GN",
  },
]

export default function TeamSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Meet Our Expert Team</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Our passionate team of local experts, guides, and travel specialists are the heart of Samba Tours. Each
            member brings unique expertise and deep knowledge of Uganda's culture, wildlife, and landscapes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white border border-emerald-100"
            >
              <div className="relative h-48 bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                  <span className="text-3xl font-bold text-white">{member.initials}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-600/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-emerald-600 font-semibold">{member.role}</p>
                </div>

                <p className="text-gray-700 text-sm mb-4 leading-relaxed">{member.bio}</p>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Specialties</h4>
                    <div className="flex flex-wrap gap-1">
                      {member.specialties.map((specialty, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Languages className="h-4 w-4 mr-2 text-emerald-500" />
                    <span>{member.languages.join(", ")}</span>
                  </div>

                  <div className="flex items-start text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-emerald-500" />
                    <span>{member.certifications.join(", ")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
