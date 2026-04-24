import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, MapPin, Calendar, Info, CheckCircle, Star } from "lucide-react"

interface Tour {
  id: string
  title: string
  description: string
  duration: string
  groupSize: string
  location: {
    country: string
    region: string | null
    coordinates?: {
      lat: number
      lng: number
    } | null
  }
  category?: {
    id: number
    name: string
    slug: string
  } | null
  difficulty: string
  highlights?: Array<{
    id: string
    highlight: string
    icon?: string | null
    displayOrder: number
  }> | null
  bestTime?: any
  physicalRequirements?: any
  whatToBring?: any
  rating: number
  reviewCount: number
}

interface TourDetailsProps {
  tour: Tour
}

export default function TourDetails({ tour }: TourDetailsProps) {
  return (
    <div className="space-y-8">
      {/* Overview */}
      <Card className="border-emerald-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <Info className="h-6 w-6 text-emerald-600" />
            <span className="text-gray-900">Tour Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <p className="text-gray-700 leading-relaxed mb-8 text-lg">{tour.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-emerald-50 rounded-lg">
                <Clock className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Duration</p>
                  <p className="text-gray-700">{tour.duration}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <Users className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Group Size</p>
                  <p className="text-gray-700">Maximum {tour.groupSize}</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-emerald-50 rounded-lg">
                <MapPin className="h-6 w-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Location</p>
                  <p className="text-gray-700">
                    {tour.location.region && tour.location.country 
                      ? `${tour.location.region}, ${tour.location.country}`
                      : tour.location.country || 'Location to be confirmed'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                <Star className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Rating</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-700">{tour.rating}/5</span>
                    <span className="text-gray-500">({tour.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Highlights */}
      <Card className="border-emerald-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
            <span className="text-gray-900">Tour Highlights</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tour.highlights && tour.highlights.length > 0 ? (
              tour.highlights.map((highlight, index) => (
                <div
                  key={highlight.id || index}
                  className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg"
                >
                  <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{highlight.highlight}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-2">No highlights listed for this tour.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Physical Requirements */}
      <Card className="border-emerald-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
          <CardTitle className="text-2xl text-gray-900">Physical Requirements</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-4">
            {(() => {
              let requirements = tour.physicalRequirements
              
              // If it's a string that looks like JSON, try to parse it
              if (typeof requirements === 'string' && requirements.startsWith('[')) {
                try {
                  requirements = JSON.parse(requirements)
                } catch (e) {
                  // Silently handle parsing errors
                }
              }
              
              if (Array.isArray(requirements) && requirements.length > 0) {
                return requirements.map((item, index) => {
                  const itemText = typeof item === 'string' ? item : (item && typeof item === 'object' && 'item' in item ? item.item : String(item))
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{itemText}</span>
                    </div>
                  )
                })
              } else if (requirements) {
                return (
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    {requirements}
                  </p>
                )
              } else {
                return (
                  <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                    No specific physical requirements listed for this tour.
                  </p>
                )
              }
            })()}
          </div>
          <Badge
            className={`text-lg px-4 py-2 mt-4 ${
              tour.difficulty === "Easy"
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : tour.difficulty === "Moderate"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
            }`}
          >
            {tour.difficulty} Level
          </Badge>
        </CardContent>
      </Card>

      {/* What to Bring */}
      <Card className="border-emerald-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
          <CardTitle className="text-2xl text-gray-900">What to Bring</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(() => {
              let items = tour.whatToBring
              
              // If it's a string that looks like JSON, try to parse it
              if (typeof items === 'string' && items.startsWith('[')) {
                try {
                  items = JSON.parse(items)
                } catch (e) {
                  // Silently handle parsing errors
                }
              }
              
              if (Array.isArray(items) && items.length > 0) {
                return items.map((item, index) => {
                  const itemText = typeof item === 'string' ? item : (item && typeof item === 'object' && 'item' in item ? item.item : String(item))
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg"
                    >
                      <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{itemText}</span>
                    </div>
                  )
                })
              } else if (items) {
                return (
                  <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg col-span-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{items}</span>
                  </div>
                )
              } else {
                return (
                  <p className="text-gray-500 col-span-2">No specific items listed to bring for this tour.</p>
                )
              }
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Best Time to Visit */}
      <Card className="border-emerald-100 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <Calendar className="h-6 w-6 text-emerald-600" />
            <span className="text-gray-900">Best Time to Visit</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <p className="text-gray-700 leading-relaxed text-lg">
            {(() => {
              let bestTime = tour.bestTime
              
              // If it's a string that looks like JSON, try to parse it
              if (typeof bestTime === 'string' && bestTime.startsWith('[')) {
                try {
                  bestTime = JSON.parse(bestTime)
                } catch (e) {
                  // Silently handle parsing errors
                }
              }
              
              if (Array.isArray(bestTime) && bestTime.length > 0) {
                return bestTime.map(item => typeof item === 'string' ? item : (item && typeof item === 'object' && 'item' in item ? item.item : String(item))).join(', ')
              } else if (bestTime) {
                return bestTime
              } else {
                return 'Best time to visit information not available for this tour.'
              }
            })()}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
