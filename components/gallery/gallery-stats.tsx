import { Camera, Video, Users, Award, MapPin, Calendar, Hash, Star, Eye } from "lucide-react"

interface GalleryStatsProps {
  totalImages: number
  totalVideos?: number
}

export default function GalleryStats({ totalImages, totalVideos: propTotalVideos }: GalleryStatsProps) {
  // Calculate stats from real data
  const totalVideos = propTotalVideos ?? 0
  
  const stats = [
    {
      icon: Camera,
      value: totalImages > 0 ? `${totalImages.toLocaleString()}+` : "0",
      label: "Photos Captured",
      description: "High-quality images from real tours",
    },
    {
      icon: Video,
      value: totalVideos > 0 ? `${totalVideos}+` : "0",
      label: "Videos Produced", 
      description: "Professional tour documentaries",
    },
    {
      icon: Hash,
      value: "10+",
      label: "Photo Categories",
      description: "Different types of experiences",
    },
    {
      icon: MapPin,
      value: "15+",
      label: "Destinations",
      description: "Locations across Uganda",
    },
    {
      icon: Award,
      value: "50+",
      label: "Photography Awards",
      description: "Recognition for visual excellence",
    },
    {
      icon: Calendar,
      value: "8+",
      label: "Years Documenting",
      description: "Consistent content creation",
    },
  ]

  return (
    <section className="section-padding bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-4">Our Visual Journey</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every photo and video in our gallery represents a real moment from actual tours, captured by our
            professional guides and happy travelers.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-emerald-100 hover:border-emerald-200"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <stat.icon className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600 mb-1">
                {stat.value}
              </div>
              <div className="font-semibold text-gray-900 mb-1 text-sm">{stat.label}</div>
              <div className="text-xs text-gray-600">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
