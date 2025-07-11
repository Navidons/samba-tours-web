"use client"

import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Play, 
  Clock, 
  Eye, 
  Calendar, 
  AlertCircle, 
  RefreshCw, 
  Grid, 
  List, 
  MousePointer, 
  Monitor,
  MapPin,
  Heart,
  Filter,
  Search,
  ArrowRight,
  Sparkles
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import LoadingSpinner from "@/components/ui/loading-spinner"
import VideoPlayer from "./video-player"
import { cn } from "@/lib/utils"

interface VideoData {
  id: number
  title: string
  description: string
  duration: string | number | null
  views: number
  createdAt: string
  category?: {
    id: number
    name: string
    slug: string
    color: string
  } | null
  location?: {
    id: number
    name: string
    slug: string
    country: string | null
    region: string | null
  } | null
  thumbnail: {
    data: string
    name: string | null
    type: string | null
  } | null
  videoUrl: string
  featured: boolean
}

export default function VideoGallery() {
  const [videos, setVideos] = useState<VideoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ message: string; type: string } | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"thumbnail-only" | "hover-preview" | "inline">("thumbnail-only")
  const [gridSize, setGridSize] = useState<"small" | "medium" | "large">("medium")
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 4,
    totalPages: 1
  })

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        featured: 'true', // Show only featured videos in this section
        limit: '4', // Limit to 4 videos for the gallery preview
        page: '1'
      })

      const response = await fetch(`/api/gallery/videos?${params}`)
      const data = await response.json()

      if (!response.ok) {
        if (data.type === 'CONNECTION_ERROR') {
          setError({
            message: 'Unable to connect to the database. Please try again later.',
            type: 'CONNECTION_ERROR'
          })
        } else {
          setError({
            message: data.error || 'Failed to load videos',
            type: data.type || 'UNKNOWN_ERROR'
          })
        }
        return
      }

      setVideos(data.videos || [])
      setPagination(data.pagination || { total: 0, page: 1, pageSize: 4, totalPages: 1 })
    } catch (err) {
      console.error('Error loading videos:', err)
      setError({
        message: 'An unexpected error occurred while loading videos.',
        type: 'UNKNOWN_ERROR'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    loadVideos()
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDuration = (duration: string | number | null): string => {
    if (!duration) return '0:00'
    
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration
    }
    
    const seconds = typeof duration === 'string' ? parseInt(duration) : duration
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getGridColumns = () => {
    switch (gridSize) {
      case "small":
        return "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      case "medium":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      case "large":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
      default:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    }
  }

  // Show connection error state
  if (error?.type === 'CONNECTION_ERROR') {
    return (
      <section className="py-24 bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <div className="container-max px-4">
          <div className="text-center">
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-6">
                Video
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                  Gallery
                </span>
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mx-auto rounded-full"></div>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-emerald-100">
                <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Connection Error</h3>
                <p className="text-gray-600 mb-6">{error.message}</p>
                <Button 
                  onClick={handleRetry} 
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 rounded-xl"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="container-max px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-6">
              Video
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                Gallery
              </span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-green-500 mx-auto rounded-full"></div>
          </div>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience Uganda through motion. Our video collection captures the sounds, movements, and emotions of real
            adventures with our travelers.
          </p>
          
          {/* Stats */}
          <div className="flex justify-center items-center space-x-8 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{pagination.total}</div>
              <div className="text-sm text-gray-600">Videos</div>
            </div>
            <div className="w-px h-8 bg-emerald-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {videos.reduce((sum, video) => sum + video.views, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Views</div>
            </div>
            <div className="w-px h-8 bg-emerald-200"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {videos.filter(v => v.featured).length}
              </div>
              <div className="text-sm text-gray-600">Featured</div>
            </div>
          </div>
        </div>

        {/* Mode Description */}
        <div className="text-center mb-8 max-w-2xl mx-auto">
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-emerald-100">
            <p className="text-sm text-gray-600 font-medium">
              {viewMode === "thumbnail-only" && (
                <>
                  <Sparkles className="inline w-4 h-4 mr-2 text-emerald-500" />
                  Click videos to watch in full-screen modal with cinematic experience
                </>
              )}
              {viewMode === "hover-preview" && (
                <>
                  <MousePointer className="inline w-4 h-4 mr-2 text-emerald-500" />
                  Hover over videos for instant preview, click for full playback
                </>
              )}
              {viewMode === "inline" && (
                <>
                  <Monitor className="inline w-4 h-4 mr-2 text-emerald-500" />
                  Watch videos directly in the page with full controls
                </>
              )}
            </p>
          </div>
        </div>

        {/* Video Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-700 mr-2">View Mode:</span>
            
            <Button
              variant={viewMode === "thumbnail-only" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("thumbnail-only")}
              className={cn(
                "rounded-xl px-4 py-2 transition-all duration-300",
                viewMode === "thumbnail-only"
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 shadow-lg"
                  : "border-emerald-200 hover:bg-emerald-50 text-gray-700"
              )}
            >
              <Grid className="h-4 w-4 mr-2" />
              Thumbnail
            </Button>
            
            <Button
              variant={viewMode === "hover-preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("hover-preview")}
              className={cn(
                "rounded-xl px-4 py-2 transition-all duration-300",
                viewMode === "hover-preview"
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 shadow-lg"
                  : "border-emerald-200 hover:bg-emerald-50 text-gray-700"
              )}
            >
              <MousePointer className="h-4 w-4 mr-2" />
              Hover Preview
            </Button>
            
            <Button
              variant={viewMode === "inline" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("inline")}
              className={cn(
                "rounded-xl px-4 py-2 transition-all duration-300",
                viewMode === "inline"
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 shadow-lg"
                  : "border-emerald-200 hover:bg-emerald-50 text-gray-700"
              )}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Inline Player
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700 mr-2">Size:</span>
            
            <Button
              variant={gridSize === "small" ? "default" : "outline"}
              size="sm"
              onClick={() => setGridSize("small")}
              className={cn(
                "rounded-xl px-3 py-1.5 transition-all duration-300",
                gridSize === "small"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg"
                  : "border-emerald-200 hover:bg-emerald-50 text-gray-700"
              )}
            >
              Small
            </Button>
            
            <Button
              variant={gridSize === "medium" ? "default" : "outline"}
              size="sm"
              onClick={() => setGridSize("medium")}
              className={cn(
                "rounded-xl px-3 py-1.5 transition-all duration-300",
                gridSize === "medium"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg"
                  : "border-emerald-200 hover:bg-emerald-50 text-gray-700"
              )}
            >
              Medium
            </Button>
            
            <Button
              variant={gridSize === "large" ? "default" : "outline"}
              size="sm"
              onClick={() => setGridSize("large")}
              className={cn(
                "rounded-xl px-3 py-1.5 transition-all duration-300",
                gridSize === "large"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg"
                  : "border-emerald-200 hover:bg-emerald-50 text-gray-700"
              )}
            >
              Large
            </Button>
          </div>
        </div>

        {/* Show other types of errors */}
        {error && error.type !== 'CONNECTION_ERROR' && (
          <Alert className="mb-8 border-emerald-200 bg-emerald-50 max-w-md mx-auto rounded-xl">
            <AlertCircle className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-800">
              {error.message}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRetry}
                className="ml-4 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-lg"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Video Grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="text-center">
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-emerald-100">
                <LoadingSpinner />
                <p className="mt-4 text-gray-600 font-medium">Loading videos...</p>
              </div>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg p-12 border border-emerald-100 max-w-md mx-auto">
              <div className="text-gray-400 mb-6">
                <Play className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No videos available</h3>
              <p className="text-gray-600 mb-6">
                No featured videos are currently available in the gallery.
              </p>
              <Button 
                variant="outline"
                className="border-emerald-200 hover:bg-emerald-50 text-gray-700 rounded-xl"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        ) : (
          <div className={cn("grid gap-8", getGridColumns())}>
            {videos.map((video) => (
              <div key={video.id} className="space-y-4 group">
                <VideoPlayer
                  video={video}
                  mode={viewMode}
                  size={gridSize}
                  autoPlay={false}
                  showControls={viewMode === "inline"}
                />
                
                {/* Video info below player (for inline mode) */}
                {viewMode === "inline" && (
                  <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-bold text-lg text-gray-900 leading-tight flex-1">
                        {video.title}
                      </h3>
                      {video.featured && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 ml-2">
                          <Heart className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-4 text-sm line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3 text-emerald-500" />
                          <span>{video.views.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-emerald-500" />
                          <span>{formatDate(video.createdAt)}</span>
                        </div>
                        {video.duration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-emerald-500" />
                            <span>{formatDuration(video.duration)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {video.category && (
                          <Badge 
                            className="text-white border-0 text-xs"
                            style={{ backgroundColor: video.category.color || '#10b981' }}
                          >
                            {video.category.name}
                          </Badge>
                        )}
                      </div>
                      
                      {video.location && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{video.location.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Explore More Videos
            </h3>
            <p className="text-gray-600 mb-6">
              Discover our complete collection of safari videos and travel experiences.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              View All Videos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
