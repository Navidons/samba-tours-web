import { Award, Shield, Users, Star, Globe, Heart } from "lucide-react"

const trustMetrics = [
  {
    icon: Award,
    value: "15+",
    label: "Years Excellence",
    description: "Industry Leading Experience",
  },
  {
    icon: Users,
    value: "5,000+",
    label: "Happy Travelers",
    description: "From 50+ Countries",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Average Rating",
    description: "Based on 2,847 Reviews",
  },
  {
    icon: Shield,
    value: "100%",
    label: "Safety Record",
    description: "Zero Incidents Policy",
  },
  {
    icon: Globe,
    value: "50+",
    label: "Tour Packages",
    description: "Expertly Crafted",
  },
  {
    icon: Heart,
    value: "98%",
    label: "Return Rate",
    description: "Customer Satisfaction",
  },
]

const certifications = [
  { name: "Uganda Tourism Board", logo: "🏛️" },
  { name: "TripAdvisor Excellence", logo: "🏆" },
  { name: "Sustainable Tourism", logo: "🌿" },
  { name: "Wildlife Conservation", logo: "🦍" },
]

export default function TrustSignals() {
  return (
    <section className="py-16 bg-gradient-to-br from-white via-emerald-50 to-green-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-32 h-32 bg-emerald-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-green-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container-max px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-6 py-3 rounded-full text-sm font-bold mb-4 border border-green-200">
            <Shield className="h-4 w-4 mr-2" />
            Trusted by Thousands Worldwide
          </div>
          <h2 className="text-3xl md:text-4xl font-playfair font-bold text-gray-900 mb-4">
            Why 5,000+ Travelers Choose
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Samba Tours
            </span>
          </h2>
        </div>

        {/* Trust Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
          {trustMetrics.map((metric, index) => (
            <div key={index} className="text-center group hover:scale-105 transition-all duration-300">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 group-hover:border-green-200">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <metric.icon className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                  {metric.value}
                </div>
                <div className="font-semibold text-gray-700 mb-1">{metric.label}</div>
                <div className="text-sm text-gray-600">{metric.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Certified & Recognized</h3>
            <p className="text-gray-600">
              Official partnerships and certifications that guarantee your safety and satisfaction
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{cert.logo}</div>
                <div className="font-semibold text-gray-700 text-sm">{cert.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Proof Banner */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-emerald-800 rounded-3xl p-8 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center"
                  >
                    <span className="text-white font-bold text-sm">{i}</span>
                  </div>
                ))}
              </div>
              <div className="text-emerald-300 font-bold">+5,000 more</div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Join thousands of satisfied adventurers</h3>
            <p className="text-emerald-100 text-lg">
              "Best safari experience of our lives! Professional, safe, and absolutely magical."
              <span className="block text-emerald-300 font-semibold mt-2">- Recent traveler from USA</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
