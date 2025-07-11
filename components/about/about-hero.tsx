import Image from "next/image"
import { Award, Mountain, Users } from "lucide-react"

export default function AboutHero() {
  return (
    <section className="relative bg-gray-900 text-white">
      <div className="absolute inset-0">
        <Image
          src="/photos/kampala-city-ug.jpg"
          alt="Kampala city skyline - Samba Tours team in Uganda"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-20 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-playfair mb-4 text-shadow-lg">
          Our Story: The Heart of Ugandan Adventure
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-gray-300 text-shadow">
          We are more than a tour company; we are storytellers, conservationists, and your personal guides to the soul
          of Uganda.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
            <Award className="h-10 w-10 mx-auto text-emerald-400 mb-3" />
            <h3 className="text-xl font-semibold">10+ Years of Excellence</h3>
            <p className="text-gray-400 mt-1">Crafting unforgettable safari experiences since 2012.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
            <Mountain className="h-10 w-10 mx-auto text-emerald-400 mb-3" />
            <h3 className="text-xl font-semibold">Local Expertise</h3>
            <p className="text-gray-400 mt-1">100% Ugandan team with deep-rooted local knowledge.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
            <Users className="h-10 w-10 mx-auto text-emerald-400 mb-3" />
            <h3 className="text-xl font-semibold">5,000+ Happy Travelers</h3>
            <p className="text-gray-400 mt-1">Join our family of adventurers from around the globe.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
