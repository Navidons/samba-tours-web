"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Clock, 
  Eye, 
  Calendar,
  MapPin,
  Heart,
  X
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { getEmbedUrl } from "@/lib/utils/video-utils"

interface VideoPlayerProps {
  video: {
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
    videoProvider?: string
    videoId?: string
    featured: boolean
  }
  mode?: "inline" | "modal" | "hover-preview" | "thumbnail-only"
  size?: "small" | "medium" | "large" | "xl"
  className?: string
}

export default function VideoPlayer({
  video,
  mode = "thumbnail-only",
  size = "medium",
  className = ""
}: VideoPlayerProps) {
  const [showModal, setShowModal] = useState(false)

  // Blur data URL for better loading experience
  const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAREBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return "w-full max-w-sm aspect-video"
      case "medium":
        return "w-full max-w-md aspect-video"
      case "large":
        return "w-full max-w-2xl aspect-video"
      case "xl":
        return "w-full max-w-4xl aspect-video"
      default:
        return "w-full aspect-video"
    }
  }

  const getThumbnailUrl = (): string => {
    if (video.thumbnail && video.thumbnail.data && video.thumbnail.type) {
      return `data:${video.thumbnail.type};base64,${video.thumbnail.data}`
    }
    return ''
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

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getVideoSrc = (): string => {
    // If we have videoProvider and videoId, use them to generate embed URL
    if (video.videoProvider && video.videoId) {
      if (video.videoProvider === 'youtube') {
        return `https://www.youtube.com/embed/${video.videoId}`
      } else if (video.videoProvider === 'vimeo') {
        return `https://player.vimeo.com/video/${video.videoId}`
      }
    }
    
    // If we have a videoUrl, try to extract embed URL from it
    if (video.videoUrl) {
      const embedUrl = getEmbedUrl(video.videoUrl)
      if (embedUrl) {
        return embedUrl
      }
      // If no embed URL found, return the original URL (for direct video files)
      return video.videoUrl
    }
    
    return ''
  }

  const isEmbeddedVideo = (): boolean => {
    const src = getVideoSrc()
    return src.includes('youtube.com/embed') || src.includes('vimeo.com/video')
  }

  const handleModalOpen = () => {
    setShowModal(true)
  }

  const handleModalClose = () => {
    setShowModal(false)
  }

  // Thumbnail-only mode (default)
  if (mode === "thumbnail-only") {
    return (
      <div 
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500",
          "bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100",
          getSizeClasses(),
          className
        )}
        onClick={handleModalOpen}
      >
        <Image
          src={getThumbnailUrl()}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={85}
          placeholder="blur"
          blurDataURL={blurDataURL}
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="bg-white/20 backdrop-blur-md rounded-full p-6 transform scale-75 group-hover:scale-100 transition-transform duration-500 border border-white/30">
            <Play className="h-10 w-10 text-white ml-1 drop-shadow-lg" />
          </div>
        </div>

        {/* Top info overlays */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {video.category && (
              <Badge 
                className="text-white border-0 shadow-lg backdrop-blur-sm"
                style={{ backgroundColor: video.category.color || '#10b981' }}
              >
                {video.category.name}
              </Badge>
            )}
            {video.featured && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
                <Heart className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
          
          {video.duration && (
            <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center space-x-1 shadow-lg">
              <Clock className="h-3 w-3" />
              <span className="font-medium">{formatDuration(video.duration)}</span>
            </div>
          )}
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">
              {video.title}
            </h3>
            <p className="text-white/90 text-sm line-clamp-2 leading-relaxed">
              {video.description}
            </p>
            
            <div className="flex items-center justify-between text-white/80 text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  <span>{video.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  <span>{formatDate(video.createdAt)}</span>
                </div>
              </div>
              {video.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span>{video.location.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] p-0 bg-black border-0 rounded-lg overflow-hidden">
            <div className="relative">
              <iframe
                src={getVideoSrc()}
                className="w-full aspect-video"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModalClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 z-50 bg-black/30 backdrop-blur-sm"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Video info */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{video.title}</h2>
                <p className="text-gray-700 mb-4">{video.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4 text-emerald-500" />
                    <span>{video.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                  {video.duration && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                  )}
                  {video.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      <span>{video.location.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // Inline mode
  if (mode === "inline") {
    return (
      <div className={cn("relative", getSizeClasses(), className)}>
        <iframe
          src={getVideoSrc()}
          className="w-full h-full rounded-xl shadow-lg"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    )
  }

  // Hover preview mode
  if (mode === "hover-preview") {
    return (
      <div 
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500",
          "bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100",
          getSizeClasses(),
          className
        )}
        onClick={handleModalOpen}
      >
        {/* Thumbnail */}
        <Image
          src={getThumbnailUrl()}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          quality={85}
          placeholder="blur"
          blurDataURL={blurDataURL}
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="bg-white/20 backdrop-blur-md rounded-full p-6 transform scale-75 group-hover:scale-100 transition-transform duration-500 border border-white/30">
            <Play className="h-10 w-10 text-white ml-1 drop-shadow-lg" />
          </div>
        </div>

        {/* Info overlays */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {video.category && (
              <Badge 
                className="text-white border-0 shadow-lg backdrop-blur-sm"
                style={{ backgroundColor: video.category.color || '#10b981' }}
              >
                {video.category.name}
              </Badge>
            )}
            {video.featured && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
                <Heart className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
          </div>
          
          {video.duration && (
            <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm flex items-center space-x-1 shadow-lg">
              <Clock className="h-3 w-3" />
              <span className="font-medium">{formatDuration(video.duration)}</span>
            </div>
          )}
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <div className="space-y-3">
            <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">
              {video.title}
            </h3>
            <p className="text-white/90 text-sm line-clamp-2 leading-relaxed">
              {video.description}
            </p>
            
            <div className="flex items-center justify-between text-white/80 text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4 text-emerald-400" />
                  <span>{video.views.toLocaleString()} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  <span>{formatDate(video.createdAt)}</span>
                </div>
              </div>
              {video.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span>{video.location.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal for full playback */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] p-0 bg-black border-0 rounded-lg overflow-hidden">
            <div className="relative">
              <iframe
                src={getVideoSrc()}
                className="w-full aspect-video"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModalClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 z-50 bg-black/30 backdrop-blur-sm"
                title="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{video.title}</h2>
                <p className="text-gray-700 mb-4">{video.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4 text-emerald-500" />
                    <span>{video.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-emerald-500" />
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                  {video.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      <span>{video.location.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return null
} 
