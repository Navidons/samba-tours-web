"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Eye, Calendar, Heart, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  video: {
    id: number
    title: string
    description: string
    duration: string | number | null
    views: number
    createdAt: string
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
  mode?: "inline" | "modal" | "hover-preview" | "thumbnail-only" | "about"
  size?: "small" | "medium" | "large" | "xl"
  className?: string
}

export default function VideoPlayer({
  video,
  mode = "thumbnail-only",
  size = "medium",
  className = "",
}: VideoPlayerProps) {
  const [showModal, setShowModal] = useState(false)

  // Blur data URL for better loading experience
  const blurDataURL =
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAREBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="

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
    return "/placeholder.svg?height=400&width=600&text=Video+Thumbnail"
  }

  const formatDuration = (duration: string | number | null): string => {
    if (!duration) return "0:00"

    if (typeof duration === "string" && duration.includes(":")) {
      return duration
    }

    const seconds = typeof duration === "string" ? Number.parseInt(duration) : duration
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getVideoSrc = (): string => {
    // If we have videoProvider and videoId, use them to generate embed URL
    if (video.videoProvider && video.videoId) {
      if (video.videoProvider.toLowerCase() === "youtube") {
        return `https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`
      } else if (video.videoProvider.toLowerCase() === "vimeo") {
        return `https://player.vimeo.com/video/${video.videoId}?autoplay=1`
      }
    }

    // If we have a videoUrl, try to extract embed URL from it
    if (video.videoUrl) {
      // Check if it's a YouTube URL
      const youtubeMatch = video.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
      if (youtubeMatch) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`
      }

      // Check if it's a Vimeo URL
      const vimeoMatch = video.videoUrl.match(/vimeo\.com\/(\d+)/)
      if (vimeoMatch) {
        return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
      }

      // If it's already an embed URL, return as is
      if (video.videoUrl.includes("embed") || video.videoUrl.includes("player")) {
        return video.videoUrl
      }

      // For direct video files
      return video.videoUrl
    }

    return ""
  }

  const isEmbeddedVideo = (): boolean => {
    const src = getVideoSrc()
    return src.includes("youtube.com/embed") || src.includes("vimeo.com/video") || src.includes("player.vimeo.com")
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
      <>
        <div
          className={cn(
            "relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500",
            "bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100",
            getSizeClasses(),
            className,
          )}
          onClick={handleModalOpen}
        >
          <Image
            src={getThumbnailUrl() || "/placeholder.svg"}
            alt={video.title || "Video Thumbnail"}
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
              {video.featured && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
                  <Heart className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <div className="space-y-3">
              <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">{video.title}</h3>
            </div>
          </div>
        </div>

        {/* Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] p-0 bg-black border-0 overflow-hidden">
            <DialogTitle>{video.title}</DialogTitle>
            <DialogDescription>{video.description}</DialogDescription>
            <div className="relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModalClose}
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full p-2 bg-black/50 backdrop-blur-sm"
                title="Close video"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Video container */}
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                {isEmbeddedVideo() ? (
                  <iframe
                    src={getVideoSrc()}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    style={{ border: 0 }}
                    title={video.title}
                  />
                ) : (
                  <video
                    src={getVideoSrc()}
                    className="absolute inset-0 w-full h-full object-cover"
                    controls
                    autoPlay
                    playsInline
                    crossOrigin="anonymous"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>

            {/* Video info */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{video.title}</h2>
                <p className="text-gray-700 mb-4">{video.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Inline mode
  if (mode === "inline") {
    return (
      <div className={cn("relative", getSizeClasses(), className)}>
        {isEmbeddedVideo() ? (
          <iframe
            src={getVideoSrc()}
            className="w-full h-full rounded-xl shadow-lg"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            title={video.title}
          />
        ) : (
          <video
            src={getVideoSrc()}
            className="w-full h-full rounded-xl shadow-lg object-cover"
            controls
            playsInline
            crossOrigin="anonymous"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    )
  }

  // Hover preview mode
  if (mode === "hover-preview") {
    return (
      <>
        <div
          className={cn(
            "relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500",
            "bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100",
            getSizeClasses(),
            className,
          )}
          onClick={handleModalOpen}
        >
          {/* Thumbnail */}
          <Image
            src={getThumbnailUrl() || "/placeholder.svg"}
            alt={video.title || "Video Thumbnail"}
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
              {video.featured && (
                <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
                  <Heart className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
            <div className="space-y-3">
              <h3 className="text-white font-bold text-lg leading-tight drop-shadow-lg">{video.title}</h3>
            </div>
          </div>
        </div>

        {/* Modal for full playback */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-6xl w-[95vw] max-h-[95vh] p-0 bg-black border-0 overflow-hidden">
            <DialogTitle>{video.title}</DialogTitle>
            <DialogDescription>{video.description}</DialogDescription>
            <div className="relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModalClose}
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full p-2 bg-black/50 backdrop-blur-sm"
                title="Close video"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Video container */}
              <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                {isEmbeddedVideo() ? (
                  <iframe
                    src={getVideoSrc()}
                    className="absolute inset-0 w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    style={{ border: 0 }}
                    title={video.title}
                  />
                ) : (
                  <video
                    src={getVideoSrc()}
                    className="absolute inset-0 w-full h-full object-cover"
                    controls
                    autoPlay
                    playsInline
                    crossOrigin="anonymous"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-3">{video.title}</h2>
                <p className="text-gray-700 mb-4">{video.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
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
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Add a new mode: 'about' for static Samba Tours Uganda info
  if (mode === "about") {
    return (
      <>
        <div
          className={cn(
            "relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500",
            "bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100",
            getSizeClasses(),
            className,
          )}
          onClick={handleModalOpen}
        >
          <Image
            src={getThumbnailUrl() || "/placeholder.svg"}
            alt={video.title || "Video Thumbnail"}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            quality={85}
            placeholder="blur"
            blurDataURL={blurDataURL}
            loading="lazy"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white text-center drop-shadow-lg bg-black/40 px-6 py-4 rounded-xl">
              Samba Tours Uganda<br />
              <span className="block text-xl md:text-2xl mt-2">The Best and Largest in Africa and East Africa</span>
            </h2>
          </div>
        </div>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl w-[90vw] max-h-[90vh] p-0 bg-white border-0 overflow-hidden flex flex-col items-center justify-center">
            <DialogTitle>Samba Tours Uganda</DialogTitle>
            <DialogDescription>
              Samba Tours Uganda is the best and largest tour company in Africa and East Africa, offering unforgettable safari experiences, cultural journeys, and adventure tours. Discover the beauty of Uganda and beyond with the region's most trusted and experienced team.
            </DialogDescription>
            <div className="flex flex-col items-center justify-center p-8">
              <Image
                src="/logo/samba tours-01.png"
                alt="Samba Tours Uganda Logo"
                width={180}
                height={180}
                className="mb-6 rounded-full shadow-lg"
              />
              <h2 className="text-2xl font-bold text-emerald-700 mb-2">Samba Tours Uganda</h2>
              <p className="text-lg text-gray-700 text-center mb-4">
                The Best and Largest in Africa and East Africa
              </p>
              <p className="text-gray-600 text-center max-w-md">
                We offer the most comprehensive safari and travel experiences across Uganda and the entire East African region. Our expert guides, custom itineraries, and commitment to excellence make us the top choice for adventurers, families, and explorers from around the world.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  return null
} 
