import { Camera, Video, Users, Award, MapPin, Calendar, Hash, Star, Eye } from "lucide-react"
import type { GalleryCategory, GalleryLocation } from "@/lib/gallery-service"

interface GalleryStatsProps {
  totalImages: number
  totalVideos?: number
  categories: GalleryCategory[]
  locations: GalleryLocation[]
}

export default function GalleryStats({ totalImages, totalVideos: propTotalVideos, categories, locations }: GalleryStatsProps) {
  // Calculate stats from real data
  const videosFromCategories = categories.reduce((sum, cat) => sum + cat.videoCount, 0)
  const totalVideos = propTotalVideos ?? videosFromCategories // Use prop if provided, otherwise calculate from categories
  const totalLocations = locations.length
  const totalCategories = categories.length
  const featuredImages = 0 // This would need to be passed from parent if available
  
  // Debug logging (remove in production)
  // console.log('Gallery Stats Debug:', {
  //   totalImages,
  //   propTotalVideos,
  //   videosFromCategories,
  //   totalVideos,
  //   categories: categories.map(c => ({ name: c.name, videoCount: c.videoCount })),
  //   locations: locations.map(l => ({ name: l.name, videoCount: l.videoCount }))
  // })
  
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
      value: totalCategories > 0 ? `${totalCategories}` : "0",
      label: "Photo Categories",
      description: "Different types of experiences",
    },
    {
      icon: MapPin,
      value: totalLocations > 0 ? `${totalLocations}+` : "0",
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

  // Show top categories if we have data
  const topCategories = categories
    .sort((a, b) => (b.imageCount + b.videoCount) - (a.imageCount + a.videoCount))
    .slice(0, 3)

  // Show top locations if we have data
  const topLocations = locations
    .sort((a, b) => (b.imageCount + b.videoCount) - (a.imageCount + a.videoCount))
    .slice(0, 3)

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
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

        {/* Show top categories and locations if available */}
        {(topCategories.length > 0 || topLocations.length > 0) && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Top Categories */}
            {topCategories.length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-emerald-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Hash className="h-5 w-5 text-emerald-600 mr-2" />
                  Popular Categories
                </h3>
                <div className="space-y-3">
                  {topCategories.map((category) => {
                    const totalCount = category.imageCount + category.videoCount
                    return (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium text-gray-800">{category.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{totalCount} items</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Top Locations */}
            {topLocations.length > 0 && (
              <div className="bg-white rounded-lg p-6 border border-emerald-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 text-emerald-600 mr-2" />
                  Popular Destinations
                </h3>
                <div className="space-y-3">
                  {topLocations.map((location) => {
                    const totalCount = location.imageCount + location.videoCount
                    return (
                      <div key={location.id} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-800">{location.name}</span>
                          {location.region && (
                            <span className="text-sm text-gray-600 ml-2">({location.region})</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{totalCount} items</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
