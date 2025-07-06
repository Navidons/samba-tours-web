"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Volume2, VolumeX, Maximize2, X, RotateCcw, Clock, Eye, Calendar } from "lucide-react"
import Image from "next/image"

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
    featured: boolean
  }
  mode?: "inline" | "modal" | "hover-preview" | "thumbnail-only"
  size?: "small" | "medium" | "large" | "xl"
  autoPlay?: boolean
  showControls?: boolean
  className?: string
}

export default function VideoPlayer({
  video,
  mode = "thumbnail-only",
  size = "medium",
  autoPlay = false,
  showControls = true,
  className = ""
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [showKeyboardHint, setShowKeyboardHint] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()
  const keyboardHintTimeoutRef = useRef<NodeJS.Timeout>()

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
    return '/placeholder.svg'
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

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  const handlePlay = async () => {
    if (videoRef.current) {
      try {
        setIsLoading(true)
        if (isPlaying) {
          videoRef.current.pause()
        } else {
          await videoRef.current.play()
        }
      } catch (error) {
        console.error('Error playing video:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleVolumeToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current && duration > 0) {
      const rect = e.currentTarget.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newTime = (clickX / rect.width) * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (mode === "hover-preview") {
      // Delay before starting preview
      hoverTimeoutRef.current = setTimeout(() => {
        if (videoRef.current && !isPlaying) {
          videoRef.current.currentTime = 0
          videoRef.current.play()
        }
      }, 500)
    }
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    if (mode === "hover-preview" && videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const handleModalOpen = () => {
    setShowModal(true)
    // Show keyboard hint after 2 seconds
    keyboardHintTimeoutRef.current = setTimeout(() => {
      setShowKeyboardHint(true)
    }, 2000)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setShowKeyboardHint(false)
    if (keyboardHintTimeoutRef.current) {
      clearTimeout(keyboardHintTimeoutRef.current)
    }
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return

    const handleLoadedData = () => {
      setDuration(videoElement.duration)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime)
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    const handleVolumeChange = () => {
      setVolume(videoElement.volume)
      setIsMuted(videoElement.muted)
    }

    videoElement.addEventListener('loadeddata', handleLoadedData)
    videoElement.addEventListener('timeupdate', handleTimeUpdate)
    videoElement.addEventListener('play', handlePlay)
    videoElement.addEventListener('pause', handlePause)
    videoElement.addEventListener('volumechange', handleVolumeChange)

    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData)
      videoElement.removeEventListener('timeupdate', handleTimeUpdate)
      videoElement.removeEventListener('play', handlePlay)
      videoElement.removeEventListener('pause', handlePause)
      videoElement.removeEventListener('volumechange', handleVolumeChange)
      
      // Cleanup timeouts
      if (keyboardHintTimeoutRef.current) {
        clearTimeout(keyboardHintTimeoutRef.current)
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Keyboard event handler for modal controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle spacebar when modal is open
      if (showModal && event.code === 'Space') {
        event.preventDefault() // Prevent page scroll
        handleModalClose()
      }
      // ESC key also closes modal
      if (showModal && event.code === 'Escape') {
        event.preventDefault()
        handleModalClose()
      }
    }

    // Only add listener when modal is open
    if (showModal) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [showModal])

  // Thumbnail-only mode (default)
  if (mode === "thumbnail-only") {
    return (
      <div 
        className={`relative group cursor-pointer overflow-hidden rounded-lg ${getSizeClasses()} ${className}`}
        onClick={handleModalOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={getThumbnailUrl()}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Play overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-8 w-8 text-white ml-1" />
          </div>
        </div>

        {/* Info overlays */}
        <div className="absolute top-3 left-3">
          {video.category && (
            <Badge 
              className="text-white border-0 mb-2"
              style={{ backgroundColor: video.category.color || '#f97316' }}
            >
              {video.category.name}
            </Badge>
          )}
        </div>

        {video.duration && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(video.duration)}</span>
          </div>
        )}

        {video.featured && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
              Featured
            </Badge>
          </div>
        )}

        {/* Title overlay on hover */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <h3 className="text-white font-semibold mb-1">{video.title}</h3>
          <p className="text-white/80 text-sm line-clamp-2">{video.description}</p>
        </div>

        {/* Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-4xl p-0 bg-black border-0">
            <div className="relative">
              <video
                ref={videoRef}
                src={video.videoUrl}
                className="w-full aspect-video rounded-lg"
                controls={showControls}
                autoPlay={autoPlay}
                muted={isMuted}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModalClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                title="Close (ESC or Space)"
              >
                <X className="h-4 w-4" />
              </Button>
              
              {/* Keyboard shortcuts hint */}
              <div className={`absolute bottom-4 left-4 text-white/70 text-xs bg-black/50 px-2 py-1 rounded backdrop-blur-sm transition-opacity duration-500 ${
                showKeyboardHint ? 'opacity-100' : 'opacity-0'
              }`}>
                Press <kbd className="bg-white/20 px-1 rounded text-white">Space</kbd> or <kbd className="bg-white/20 px-1 rounded text-white">ESC</kbd> to close
              </div>
            </div>
            
            {/* Video info in modal */}
            <div className="p-6 bg-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h2>
              <p className="text-gray-600 mb-4">{video.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{video.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                </div>
                {video.location && (
                  <div className="text-xs">
                    {video.location.name}
                  </div>
                )}
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
      <div className={`relative ${getSizeClasses()} ${className}`}>
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full h-full rounded-lg"
          poster={getThumbnailUrl()}
          controls={showControls}
          autoPlay={autoPlay}
          muted={isMuted}
          onClick={handlePlay}
        />
        
        {!showControls && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              onClick={handlePlay}
              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-4"
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Hover preview mode
  if (mode === "hover-preview") {
    return (
      <div 
        className={`relative group cursor-pointer overflow-hidden rounded-lg ${getSizeClasses()} ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleModalOpen}
      >
        {/* Thumbnail */}
        <Image
          src={getThumbnailUrl()}
          alt={video.title}
          fill
          className={`object-cover transition-all duration-500 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
        />

        {/* Video for hover preview */}
        <video
          ref={videoRef}
          src={video.videoUrl}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${isHovering ? 'opacity-100' : 'opacity-0'}`}
          muted
          loop
          preload="metadata"
        />

        {/* Play button overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="h-8 w-8 text-white ml-1" />
          </div>
        </div>

        {/* Info overlays */}
        <div className="absolute top-3 left-3">
          {video.category && (
            <Badge 
              className="text-white border-0"
              style={{ backgroundColor: video.category.color || '#f97316' }}
            >
              {video.category.name}
            </Badge>
          )}
        </div>

        {video.duration && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(video.duration)}</span>
          </div>
        )}

        {/* Modal for full playback */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-4xl p-0 bg-black border-0">
            <div className="relative">
              <video
                src={video.videoUrl}
                className="w-full aspect-video rounded-lg"
                controls
                autoPlay
                muted={false}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModalClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                title="Close (ESC or Space)"
              >
                <X className="h-4 w-4" />
              </Button>
              
              {/* Keyboard shortcuts hint */}
              <div className={`absolute bottom-4 left-4 text-white/70 text-xs bg-black/50 px-2 py-1 rounded backdrop-blur-sm transition-opacity duration-500 ${
                showKeyboardHint ? 'opacity-100' : 'opacity-0'
              }`}>
                Press <kbd className="bg-white/20 px-1 rounded text-white">Space</kbd> or <kbd className="bg-white/20 px-1 rounded text-white">ESC</kbd> to close
              </div>
            </div>
            
            <div className="p-6 bg-white">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{video.title}</h2>
              <p className="text-gray-600 mb-4">{video.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{video.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                </div>
                {video.location && (
                  <div className="text-xs">
                    {video.location.name}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return null
} 