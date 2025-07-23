"use client"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  X, 
  RotateCcw, 
  Clock, 
  Eye, 
  Calendar,
  MapPin,
  Heart,
  Share2,
  Download,
  Settings,
  Fullscreen,
  SkipBack,
  SkipForward
} from "lucide-react"
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
  const [showCustomControls, setShowCustomControls] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout>()
  const keyboardHintTimeoutRef = useRef<NodeJS.Timeout>()
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

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

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  const handleSkip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration))
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
    setShowCustomControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    if (mode === "hover-preview") {
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
    controlsTimeoutRef.current = setTimeout(() => {
      setShowCustomControls(false)
    }, 2000)
    
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
    keyboardHintTimeoutRef.current = setTimeout(() => {
      setShowKeyboardHint(true)
    }, 2000)
  }

  const handleModalClose = () => {
    setShowModal(false)
    setShowKeyboardHint(false)
    setShowCustomControls(false)
    if (keyboardHintTimeoutRef.current) {
      clearTimeout(keyboardHintTimeoutRef.current)
    }
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
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

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    videoElement.addEventListener('loadeddata', handleLoadedData)
    videoElement.addEventListener('timeupdate', handleTimeUpdate)
    videoElement.addEventListener('play', handlePlay)
    videoElement.addEventListener('pause', handlePause)
    videoElement.addEventListener('volumechange', handleVolumeChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData)
      videoElement.removeEventListener('timeupdate', handleTimeUpdate)
      videoElement.removeEventListener('play', handlePlay)
      videoElement.removeEventListener('pause', handlePause)
      videoElement.removeEventListener('volumechange', handleVolumeChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      
      if (keyboardHintTimeoutRef.current) {
        clearTimeout(keyboardHintTimeoutRef.current)
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showModal && event.code === 'Space') {
        event.preventDefault()
        handlePlay()
      }
      if (showModal && event.code === 'Escape') {
        event.preventDefault()
        handleModalClose()
      }
      if (showModal && event.code === 'ArrowLeft') {
        event.preventDefault()
        handleSkip(-10)
      }
      if (showModal && event.code === 'ArrowRight') {
        event.preventDefault()
        handleSkip(10)
      }
      if (showModal && event.code === 'KeyM') {
        event.preventDefault()
        handleVolumeToggle()
      }
      if (showModal && event.code === 'KeyF') {
        event.preventDefault()
        handleFullscreen()
      }
    }

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
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500",
          "bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100",
          getSizeClasses(),
          className
        )}
        onClick={handleModalOpen}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={getThumbnailUrl()}
          alt={video.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
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
          <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] p-0 bg-black border-0 rounded-lg overflow-hidden flex flex-col">
            <div className="relative group/video">
              <video
                ref={videoRef}
                src={video.videoUrl}
                className="w-full aspect-video"
                controls={false}
                autoPlay={autoPlay}
                muted={isMuted}
                playsInline
              />
              
              {/* Custom video controls */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent",
                "flex flex-col justify-between p-4 md:p-6 transition-opacity duration-300",
                showCustomControls ? "opacity-100" : "opacity-0"
              )}>
                {/* Top controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 md:space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleModalClose}
                      className="text-white hover:bg-white/20 rounded-full p-2 z-50 bg-black/30 backdrop-blur-sm"
                      title="Close (ESC)"
                    >
                      <X className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    
                    <div className="hidden md:flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        className={cn(
                          "text-white hover:bg-white/20 rounded-full p-2",
                          isLiked && "text-red-500"
                        )}
                        title="Like"
                      >
                        <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 rounded-full p-2"
                        title="Share"
                      >
                        <Share2 className="h-5 w-5" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20 rounded-full p-2"
                        title="Download"
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVolumeToggle}
                      className="text-white hover:bg-white/20 rounded-full p-2"
                      title="Toggle Mute (M)"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4 md:h-5 md:w-5" /> : <Volume2 className="h-4 w-4 md:h-5 md:w-5" />}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFullscreen}
                      className="text-white hover:bg-white/20 rounded-full p-2"
                      title="Fullscreen (F)"
                    >
                      <Fullscreen className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </div>
                </div>
                
                {/* Bottom controls */}
                <div className="space-y-3 md:space-y-4">
                  {/* Progress bar */}
                  <div 
                    className="w-full h-1 md:h-1.5 bg-white/30 rounded-full cursor-pointer group/progress"
                    onClick={handleSeek}
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full relative"
                      style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                    >
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 md:w-3 md:h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  
                  {/* Control buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 md:space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSkip(-10)}
                        className="text-white hover:bg-white/20 rounded-full p-1.5 md:p-2"
                        title="Skip Back 10s (←)"
                      >
                        <SkipBack className="h-4 w-4 md:h-5 md:w-5" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="lg"
                        onClick={handlePlay}
                        className="text-white hover:bg-white/20 rounded-full p-3 md:p-4"
                        title="Play/Pause (Space)"
                      >
                        {isPlaying ? <Pause className="h-6 w-6 md:h-8 md:w-8" /> : <Play className="h-6 w-6 md:h-8 md:w-8 ml-0.5 md:ml-1" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSkip(10)}
                        className="text-white hover:bg-white/20 rounded-full p-1.5 md:p-2"
                        title="Skip Forward 10s (→)"
                      >
                        <SkipForward className="h-4 w-4 md:h-5 md:w-5" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-2 md:space-x-4 text-white text-xs md:text-sm">
                      <span>{formatTime(currentTime)}</span>
                      <span>/</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Keyboard shortcuts hint */}
              <div className={cn(
                "absolute bottom-4 left-4 text-white/70 text-xs bg-black/50 px-2 py-1.5 md:px-3 md:py-2 rounded-lg backdrop-blur-sm transition-opacity duration-500 hidden md:block",
                showKeyboardHint ? "opacity-100" : "opacity-0"
              )}>
                <div className="space-y-1">
                  <div>Press <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-white">Space</kbd> to play/pause</div>
                  <div>Press <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-white">←</kbd> <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-white">→</kbd> to skip</div>
                  <div>Press <kbd className="bg-white/20 px-1.5 py-0.5 rounded text-white">F</kbd> for fullscreen</div>
                </div>
              </div>
            </div>
            
            {/* Video info */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 flex-1 overflow-y-auto">
              <div className="p-4 md:p-6 max-w-4xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4 md:mb-6">
                  <div className="flex-1">
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-3">{video.title}</h2>
                    <p className="text-gray-700 text-sm md:text-base lg:text-lg leading-relaxed mb-3 md:mb-4">{video.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-600">
                      <div className="flex items-center space-x-1 md:space-x-2">
                        <Eye className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" />
                        <span>{video.views.toLocaleString()} views</span>
                      </div>
                      <div className="flex items-center space-x-1 md:space-x-2">
                        <Calendar className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" />
                        <span>{formatDate(video.createdAt)}</span>
                      </div>
                      {video.duration && (
                        <div className="flex items-center space-x-1 md:space-x-2">
                          <Clock className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" />
                          <span>{formatDuration(video.duration)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 lg:ml-6">
                    {video.category && (
                      <Badge 
                        className="text-white border-0 text-xs"
                        style={{ backgroundColor: video.category.color || '#10b981' }}
                      >
                        {video.category.name}
                      </Badge>
                    )}
                    {video.featured && (
                      <Badge className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0 text-xs">
                        <Heart className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
                
                {video.location && (
                  <div className="flex items-center space-x-1 md:space-x-2 text-gray-600 text-xs md:text-sm">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" />
                    <span className="font-medium">{video.location.name}</span>
                    {video.location.country && (
                      <span className="text-gray-500">• {video.location.country}</span>
                    )}
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
      <div className={cn("relative", getSizeClasses(), className)}>
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="w-full h-full rounded-xl shadow-lg"
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
              className="bg-black/50 hover:bg-black/70 text-white rounded-full p-4 backdrop-blur-sm"
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
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500",
          "bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100",
          getSizeClasses(),
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleModalOpen}
      >
        {/* Thumbnail */}
        <Image
          src={getThumbnailUrl()}
          alt={video.title}
          fill
          className={cn(
            "object-cover transition-all duration-500",
            isHovering ? 'opacity-0 scale-110' : 'opacity-100 scale-100'
          )}
        />

        {/* Video for hover preview */}
        <video
          ref={videoRef}
          src={video.videoUrl}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-all duration-500",
            isHovering ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
          )}
          muted
          loop
          preload="metadata"
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
          <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] p-0 bg-black border-0 rounded-lg overflow-hidden flex flex-col">
            <div className="relative group/video">
              <video
                src={video.videoUrl}
                className="w-full aspect-video"
                controls
                autoPlay
                muted={false}
                playsInline
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleModalClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 z-50 bg-black/30 backdrop-blur-sm"
                title="Close (ESC)"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 flex-1 overflow-y-auto">
              <div className="p-4 md:p-6 max-w-4xl mx-auto">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 md:mb-3">{video.title}</h2>
                <p className="text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed mb-3 md:mb-4">{video.description}</p>
                
                <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-gray-600">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <Eye className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" />
                    <span>{video.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" />
                    <span>{formatDate(video.createdAt)}</span>
                  </div>
                  {video.location && (
                    <div className="flex items-center space-x-1 md:space-x-2">
                      <MapPin className="h-3 w-3 md:h-4 md:w-4 text-emerald-500" />
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
