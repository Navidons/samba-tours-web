"use client"

import { useState, useEffect } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Play, Clock, Eye, Calendar, AlertCircle, RefreshCw, Grid, List, MousePointer, Monitor } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import LoadingSpinner from "@/components/ui/loading-spinner"
import VideoPlayer from "./video-player"

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
    return new Date(dateString).toLocaleDateString()
  }

  const formatDuration = (duration: string | number | null): string => {
    if (!duration) return '0:00'
    
    // If it's a string and already formatted (MM:SS), return as is
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration
    }
    
    // Convert to number (either from string or if already number)
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
      <section className="section-padding bg-gradient-to-br from-orange-50 to-red-50">
        <div className="container-max">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-earth-900 mb-6">
              Video
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                Gallery
              </span>
            </h2>
            <div className="max-w-md mx-auto">
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error.message}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRetry}
                    className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-earth-900 mb-6">
            Video
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
              Gallery
            </span>
          </h2>
          <p className="text-xl text-earth-600 max-w-3xl mx-auto">
            Experience Uganda through motion. Our video collection captures the sounds, movements, and emotions of real
            adventures with our travelers.
          </p>
        </div>

        {/* Mode Description */}
        <div className="text-center mb-6 max-w-2xl mx-auto">
          <p className="text-sm text-earth-600">
            {viewMode === "thumbnail-only" && "Click videos to watch in full-screen modal with cinematic experience"}
            {viewMode === "hover-preview" && "Hover over videos for instant preview, click for full playback"}
            {viewMode === "inline" && "Watch videos directly in the page with full controls"}
          </p>
        </div>

        {/* Video Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-earth-700 mr-2">View Mode:</span>
            
            <Button
              variant={viewMode === "thumbnail-only" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("thumbnail-only")}
              className={`${
                viewMode === "thumbnail-only"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                  : "border-orange-200 hover:bg-orange-50"
              }`}
            >
              <Grid className="h-4 w-4 mr-2" />
              Thumbnail
            </Button>
            
            <Button
              variant={viewMode === "hover-preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("hover-preview")}
              className={`${
                viewMode === "hover-preview"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                  : "border-orange-200 hover:bg-orange-50"
              }`}
            >
              <MousePointer className="h-4 w-4 mr-2" />
              Hover Preview
            </Button>
            
            <Button
              variant={viewMode === "inline" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("inline")}
              className={`${
                viewMode === "inline"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                  : "border-orange-200 hover:bg-orange-50"
              }`}
            >
              <Monitor className="h-4 w-4 mr-2" />
              Inline Player
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-earth-700 mr-2">Size:</span>
            
            <Button
              variant={gridSize === "small" ? "default" : "outline"}
              size="sm"
              onClick={() => setGridSize("small")}
              className={`${
                gridSize === "small"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0"
                  : "border-orange-200 hover:bg-orange-50"
              }`}
            >
              Small
            </Button>
            
            <Button
              variant={gridSize === "medium" ? "default" : "outline"}
              size="sm"
              onClick={() => setGridSize("medium")}
              className={`${
                gridSize === "medium"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0"
                  : "border-orange-200 hover:bg-orange-50"
              }`}
            >
              Medium
            </Button>
            
            <Button
              variant={gridSize === "large" ? "default" : "outline"}
              size="sm"
              onClick={() => setGridSize("large")}
              className={`${
                gridSize === "large"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0"
                  : "border-orange-200 hover:bg-orange-50"
              }`}
            >
              Large
            </Button>
          </div>
        </div>

        {/* Show other types of errors */}
        {error && error.type !== 'CONNECTION_ERROR' && (
          <Alert className="mb-8 border-orange-200 bg-orange-50 max-w-md mx-auto">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {error.message}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRetry}
                className="ml-4 text-orange-600 hover:text-orange-700 hover:bg-orange-100"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-earth-600">Loading videos...</p>
            </div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Play className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos available</h3>
            <p className="text-gray-600">
              No featured videos are currently available in the gallery.
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${getGridColumns()}`}>
            {videos.map((video) => (
              <div key={video.id} className="space-y-4">
                <VideoPlayer
                  video={video}
                  mode={viewMode}
                  size={gridSize}
                  autoPlay={false}
                  showControls={viewMode === "inline"}
                />
                
                {/* Video info below player (for inline mode) */}
                {viewMode === "inline" && (
                  <div className="bg-white rounded-lg p-4 border border-orange-100">
                    <h3 className="font-bold text-lg text-earth-900 mb-2">
                      {video.title}
                    </h3>
                    <p className="text-earth-700 mb-3 text-sm line-clamp-2">{video.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-earth-600">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-3 w-3 text-orange-500" />
                          <span>{video.views.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-orange-500" />
                          <span>{formatDate(video.createdAt)}</span>
                        </div>
                      </div>
                      {video.location && (
                        <div className="text-xs text-earth-500">
                          {video.location.name}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      {video.category && (
                        <Badge 
                          className="text-white border-0 text-xs"
                          style={{ backgroundColor: video.category.color || '#f97316' }}
                        >
                          {video.category.name}
                        </Badge>
                      )}
                      {video.featured && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="border-orange-200 hover:bg-gradient-to-r hover:from-orange-500 hover:to-red-500 hover:text-white hover:border-transparent bg-transparent"
          >
            View All Videos
          </Button>
        </div>
      </div>
    </section>
  )
}
