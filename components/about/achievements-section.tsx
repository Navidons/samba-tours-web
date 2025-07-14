import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Star, Users, Globe, Award, Heart } from "lucide-react"

const achievements = [
  {
    icon: Trophy,
    title: "Uganda Tourism Excellence Award",
    year: "2023",
    description: "Recognized for outstanding contribution to Uganda's tourism industry",
    category: "Industry Recognition",
  },
  {
    icon: Star,
    title: "TripAdvisor Certificate of Excellence",
    year: "2022-2024",
    description: "Consistently rated 5 stars by travelers for exceptional service",
    category: "Customer Satisfaction",
  },
  {
    icon: Users,
    title: "500+ Successful Tours",
    year: "2024",
    description: "Milestone achievement in creating unforgettable experiences",
    category: "Service Delivery",
  },
  {
    icon: Globe,
    title: "Sustainable Tourism Certification",
    year: "2023",
    description: "Certified for responsible tourism practices and community impact",
    category: "Sustainability",
  },
  {
    icon: Award,
    title: "Best Safari Operator - East Africa",
    year: "2023",
    description: "Regional recognition for excellence in safari operations",
    category: "Regional Excellence",
  },
  {
    icon: Heart,
    title: "Community Impact Award",
    year: "2022",
    description: "Honored for significant contributions to local community development",
    category: "Social Impact",
  },
]

const statistics = [
  { number: "98%", label: "Customer Satisfaction Rate", description: "Based on post-tour surveys" },
  { number: "500+", label: "Tours Completed", description: "Successful adventures delivered" },
  { number: "25+", label: "Team Members", description: "Local experts and guides" },
  { number: "15+", label: "Destinations", description: "Across Uganda and East Africa" },
  { number: "8+", label: "Years Experience", description: "In Uganda tourism industry" },
  { number: "12", label: "Awards Won", description: "Industry and customer recognition" },
]

export default function AchievementsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Our Achievements</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            We're proud of the recognition we've received from industry bodies and, most importantly, from the travelers
            who trust us with their Uganda adventures.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {statistics.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-emerald-100"
            >
              <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="font-semibold text-gray-900 mb-1 text-sm lg:text-base">{stat.label}</div>
              <div className="text-xs text-gray-600">{stat.description}</div>
            </div>
          ))}
        </div>

        {/* Awards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {achievements.map((achievement, index) => (
            <Card key={index} className="hover:shadow-xl transition-all duration-300 border border-emerald-100 bg-white">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <achievement.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                        {achievement.category}
                      </span>
                      <span className="text-sm text-gray-500 font-medium">{achievement.year}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">{achievement.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{achievement.description}</p>
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
