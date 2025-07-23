"use client"

import { useEffect, useCallback, useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Share2, 
  Heart, 
  MapPin, 
  Camera, 
  Calendar, 
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2
} from "lucide-react"
import { galleryService } from "@/lib/gallery-service"

interface GalleryItem {
  id: number
  src: string
  alt: string
  category: string
  location: string
  title: string
  description: string
  photographer: string
  date: string
  likes: number
  views: number
  aspectRatio: string
}

interface GalleryLightboxProps {
  images: GalleryItem[]
  currentIndex: number
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  onIndexChange?: (index: number) => void
}

export default function GalleryLightbox({ 
  images, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrev, 
  onIndexChange 
}: GalleryLightboxProps) {
  const currentImage = images[currentIndex]
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [imageStats, setImageStats] = useState({ likes: currentImage?.likes || 0, views: currentImage?.views || 0 })
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [showInfo, setShowInfo] = useState(true)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Reset zoom, rotation, and position when image changes
  useEffect(() => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setIsImageLoaded(false)
    setImageStats({ likes: currentImage?.likes || 0, views: currentImage?.views || 0 })
  }, [currentIndex, currentImage])

  // Track view when lightbox opens
  useEffect(() => {
    if (currentImage) {
      galleryService.trackImageView(currentImage.id)
      setImageStats(prev => ({ ...prev, views: prev.views + 1 }))
    }
  }, [currentImage])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose()
          break
        case "ArrowLeft":
          onPrev()
          break
        case "ArrowRight":
          onNext()
          break
        case "=":
        case "+":
          e.preventDefault()
          setScale(prev => Math.min(prev * 1.2, 5))
          break
        case "-":
          e.preventDefault()
          setScale(prev => Math.max(prev / 1.2, 0.1))
          break
        case "0":
          setScale(1)
          setRotation(0)
          break
        case "r":
          setRotation(prev => prev + 90)
          break
        case "f":
          setIsFullscreen(prev => !prev)
          break
        case "i":
          setShowInfo(prev => !prev)
          break
      }
    },
    [onClose, onNext, onPrev],
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [handleKeyDown])

  const handleZoomIn = () => setScale(prev => Math.min(prev * 1.2, 5))
  const handleZoomOut = () => setScale(prev => Math.max(prev / 1.2, 0.1))
  const handleReset = () => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
  }
  const handleRotate = () => setRotation(prev => prev + 90)

  const handleLike = async () => {
    if (!currentImage) return
    
    try {
      const result = await galleryService.toggleImageLike(currentImage.id)
      setIsLiked(result.liked)
      setImageStats(prev => ({ ...prev, likes: result.likes }))
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const handleDownload = () => {
    if (!currentImage) return
    
    const link = document.createElement('a')
    link.href = currentImage.src
    link.download = `${currentImage.title || 'gallery-image'}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (!currentImage) return
    
    const shareData = {
      title: currentImage.title,
      text: currentImage.description,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      const text = `${currentImage.title}\n${currentImage.description}\n${window.location.href}`
      await navigator.clipboard.writeText(text)
      alert('Image details copied to clipboard!')
    }
  }

  const handleThumbnailClick = (index: number) => {
    if (onIndexChange) {
      onIndexChange(index)
    }
  }

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setScale(prev => Math.max(0.1, Math.min(5, prev * delta)))
  }

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale > 1 && e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({ 
        x: e.touches[0].clientX - position.x, 
        y: e.touches[0].clientY - position.y 
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && scale > 1 && e.touches.length === 1) {
      e.preventDefault()
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  if (!currentImage) return null

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-black/95 flex items-center justify-center ${
        isFullscreen ? 'z-[60]' : ''
      }`}
    >
      {/* Top toolbar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInfo(!showInfo)}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            title="Toggle info (I)"
          >
            <X className="h-5 w-5" />
          </Button>
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} of {images.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            title="Zoom out (-)"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            title="Zoom in (+)"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRotate}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            title="Rotate (R)"
          >
            <RotateCw className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            title="Reset (0)"
          >
            <Minimize2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20 h-10 w-10 p-0"
            title="Close (ESC)"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation buttons */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12 p-0"
        title="Previous (←)"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12 p-0"
        title="Next (→)"
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row h-full w-full max-w-7xl mx-auto p-4 pt-20">
        {/* Image container with zoom and scroll */}
        <div 
          className="flex-1 flex items-center justify-center relative overflow-hidden"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            ref={imageRef}
            className={`relative max-w-full max-h-full ${
              scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
            }`}
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-out'
            }}
          >
            <Image
              src={currentImage.src}
              alt={currentImage.alt}
              width={1200}
              height={800}
              className={`max-w-full max-h-[80vh] object-contain transition-opacity duration-300 ${
                isImageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              priority
              onLoad={() => setIsImageLoaded(true)}
            />
            
            {/* Loading indicator */}
            {!isImageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              </div>
            )}
          </div>

          {/* Zoom indicator */}
          {scale !== 1 && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {Math.round(scale * 100)}%
            </div>
          )}
        </div>

        {/* Info panel */}
        {showInfo && (
          <div className="lg:w-80 bg-gradient-to-br from-emerald-900/20 to-green-900/20 backdrop-blur-sm rounded-lg p-6 text-white lg:ml-6 mt-4 lg:mt-0 border border-emerald-500/20 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white capitalize border-0">
                {currentImage.category.replace("-", " ")}
              </Badge>
            </div>

            <h2 className="text-2xl font-bold mb-3 text-emerald-100">{currentImage.title}</h2>
            <p className="text-emerald-200 mb-6 leading-relaxed">{currentImage.description}</p>

            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-emerald-300" />
                <span className="text-emerald-200">{currentImage.location}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Camera className="h-4 w-4 text-emerald-300" />
                <span className="text-emerald-200">Photo by {currentImage.photographer}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-emerald-300" />
                <span className="text-emerald-200">{new Date(currentImage.date).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6 text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-emerald-200">
                  <Heart className="h-4 w-4" />
                  <span>{imageStats.likes}</span>
                </div>
                <div className="flex items-center space-x-1 text-emerald-200">
                  <Eye className="h-4 w-4" />
                  <span>{imageStats.views}</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={handleLike}
                className={`flex-1 border-0 ${
                  isLiked 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                }`}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button
                size="sm"
                onClick={handleShare}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 border-0"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 border-0"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4 pb-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`relative w-16 h-16 flex-shrink-0 rounded cursor-pointer overflow-hidden transition-all duration-200 ${
              index === currentIndex 
                ? "ring-2 ring-emerald-400 scale-110" 
                : "opacity-60 hover:opacity-100 hover:scale-105"
            }`}
            onClick={() => handleThumbnailClick(index)}
          >
            <Image 
              src={image.src} 
              alt={image.alt} 
              fill 
              className="object-cover" 
            />
            {index === currentIndex && (
              <div className="absolute inset-0 bg-emerald-400/20" />
            )}
          </div>
        ))}
      </div>

      {/* Keyboard shortcuts help */}
      <div className="absolute bottom-4 right-4 text-white/60 text-xs">
        <div>ESC: Close | ←→: Navigate | +/-: Zoom | R: Rotate | 0: Reset | F: Fullscreen | I: Info | Mouse: Drag/Zoom</div>
      </div>
    </div>
  )
}
