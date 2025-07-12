import Image from "next/image"
import { Shield, Heart, Leaf, Users, Award, Globe } from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "Passion for Excellence",
    description:
      "We pour our hearts into every tour, ensuring each experience exceeds expectations and creates lasting memories.",
  },
  {
    icon: Leaf,
    title: "Sustainable Tourism",
    description:
      "We're committed to responsible travel that protects Uganda's environment and benefits local communities.",
  },
  {
    icon: Users,
    title: "Community First",
    description:
      "We work closely with local communities, ensuring tourism creates positive economic and social impact.",
  },
  {
    icon: Shield,
    title: "Safety & Security",
    description:
      "Your safety is our top priority. We maintain the highest safety standards and comprehensive insurance coverage.",
  },
  {
    icon: Award,
    title: "Authentic Experiences",
    description: "We create genuine, unscripted encounters with Uganda's wildlife, culture, and natural beauty.",
  },
  {
    icon: Globe,
    title: "Cultural Respect",
    description:
      "We honor and celebrate Uganda's diverse cultures, fostering meaningful connections between visitors and locals.",
  },
]

export default function ValuesSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 to-green-50 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 opacity-10">
        <Image
          src="/photos/uganda-wildlife.jpg"
          alt="Uganda wildlife background"
          fill
          className="object-cover"
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Our Core Values</h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            These principles guide everything we do, from planning your itinerary to the moment you return home with
            unforgettable memories of Uganda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="group text-center p-8 rounded-xl bg-white hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50 transition-all duration-300 shadow-lg hover:shadow-xl border border-emerald-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <value.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
              <p className="text-gray-700 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
