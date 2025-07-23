import Image from "next/image"
import { Camera, Video, Users } from "lucide-react"

interface GalleryHeroProps {
  hideHeading?: boolean
}

export default function GalleryHero({ hideHeading }: GalleryHeroProps) {
  return (
    <section className="relative bg-gray-900 text-white">
      <div className="absolute inset-0">
        <Image
          src="/photos/uganda-wildlife.jpg"
          alt="Uganda wildlife - Majestic animals in their natural habitat"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40 pb-20 text-center">
        {!hideHeading && (
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-playfair mb-4 text-shadow-lg">
            A Glimpse of Uganda's Soul
          </h2>
        )}
        <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-gray-300 text-shadow">
          Explore moments captured by our guides and fellow travelers. This is the magic that awaits you.
        </p>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
            <Camera className="h-10 w-10 mx-auto text-emerald-400 mb-3" />
            <h3 className="text-xl font-semibold">1,200+ Photos</h3>
            <p className="text-gray-400 mt-1">A vibrant collection of wildlife and landscapes.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
            <Video className="h-10 w-10 mx-auto text-emerald-400 mb-3" />
            <h3 className="text-xl font-semibold">50+ Videos</h3>
            <p className="text-gray-400 mt-1">Immersive footage from the heart of Africa.</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
            <Users className="h-10 w-10 mx-auto text-emerald-400 mb-3" />
            <h3 className="text-xl font-semibold">Traveler Submissions</h3>
            <p className="text-gray-400 mt-1">See Uganda through the eyes of our guests.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
