import { CheckCircle, Clock, Shield, Users, Award, Headphones } from "lucide-react"

const reasons = [
  {
    icon: CheckCircle,
    title: "Local Expertise",
    description:
      "Born and raised in Uganda, our team knows every hidden gem and secret spot that makes your journey extraordinary.",
  },
  {
    icon: Clock,
    title: "24/7 Support",
    description:
      "From planning to your return home, our dedicated support team is available around the clock for your peace of mind.",
  },
  {
    icon: Shield,
    title: "Safety First",
    description:
      "Comprehensive safety protocols, experienced guides, and full insurance coverage ensure your adventure is worry-free.",
  },
  {
    icon: Users,
    title: "Small Group Sizes",
    description:
      "Intimate group sizes mean personalized attention, better wildlife viewing, and more meaningful cultural interactions.",
  },
  {
    icon: Award,
    title: "Award-Winning Service",
    description: "Multiple industry awards and 98% customer satisfaction rate speak to our commitment to excellence.",
  },
  {
    icon: Headphones,
    title: "Personalized Experiences",
    description:
      "Every tour is tailored to your interests, fitness level, and preferences for a truly unique adventure.",
  },
]

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6 leading-tight">Why Choose Samba Tours?</h2>
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              With so many tour operators to choose from, here's what sets us apart and makes us the preferred choice
              for discerning travelers seeking authentic Uganda experiences.
            </p>

            <div className="space-y-6">
              {reasons.map((reason, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-orange-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                    <reason.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">{reason.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{reason.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-6">What Our Travelers Say</h3>
              <div className="space-y-6">
                <blockquote className="border-l-4 border-orange-300 pl-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                  <p className="italic mb-3 leading-relaxed">
                    "Samba Tours didn't just show us Uganda – they helped us fall in love with it. Every detail was
                    perfect, from the knowledgeable guides to the carefully selected accommodations."
                  </p>
                  <cite className="text-orange-200 font-medium">- Sarah & Michael, USA</cite>
                </blockquote>

                <blockquote className="border-l-4 border-orange-300 pl-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                  <p className="italic mb-3 leading-relaxed">
                    "The gorilla trekking experience was life-changing, but what impressed us most was how the team went
                    above and beyond to ensure our comfort and safety throughout the journey."
                  </p>
                  <cite className="text-orange-200 font-medium">- Emma Thompson, UK</cite>
                </blockquote>

                <blockquote className="border-l-4 border-orange-300 pl-4 bg-white/10 p-4 rounded-lg backdrop-blur-sm">
                  <p className="italic mb-3 leading-relaxed">
                    "Professional, passionate, and genuinely caring – Samba Tours made our Uganda adventure absolutely
                    unforgettable. We're already planning our return trip!"
                  </p>
                  <cite className="text-orange-200 font-medium">- David & Lisa, Canada</cite>
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
