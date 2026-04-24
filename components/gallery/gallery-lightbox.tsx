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
  Camera, 
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2
} from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface GalleryItem {
  id: number
  src: string
  alt: string
  title: string
  description: string
  featured: boolean
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
  function LightboxThumbnail({ image, index, onClick }: { image: any, index: number, onClick: () => void }) {
    const [isInView, setIsInView] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      if (!ref.current) return
      const el = ref.current
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true)
              io.unobserve(el)
            }
          })
        },
        { root: null, rootMargin: '200px', threshold: 0.01 }
      )
      io.observe(el)
      return () => io.disconnect()
    }, [])

    return (
      <div
        ref={ref}
        className={`relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded cursor-pointer overflow-hidden transition-all duration-200 ${
          index === currentIndex 
            ? 'ring-2 ring-emerald-400 scale-110' 
            : 'opacity-60 hover:opacity-100 hover:scale-105'
        }`}
        onClick={onClick}
      >
        {isInView ? (
          <Image 
            src={image.src} 
            alt={image.alt || image.title || 'Gallery Image'} 
            fill 
            className="object-cover"
            quality={35}
            placeholder="blur"
            blurDataURL={blurDataURL}
            loading="lazy"
            sizes={isMobile ? '48px' : '64px'}
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        {index === currentIndex && (
          <div className="absolute inset-0 bg-emerald-400/20" />
        )}
      </div>
    )
  }
  const currentImage = images[currentIndex]
  const isMobile = useIsMobile()
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  // Hide info panel by default on mobile
  const [showInfo, setShowInfo] = useState(!isMobile)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)

  // Blur data URL for better loading experience
  const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAREBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

  // Reset zoom, rotation, and position when image changes
  useEffect(() => {
    setScale(1)
    setRotation(0)
    setPosition({ x: 0, y: 0 })
    setIsImageLoaded(false)
  }, [currentIndex, currentImage])

  // Hint browser to prefetch only the immediate next image to reduce bandwidth
  useEffect(() => {
    if (images.length > 1) {
      const nextIndex = currentIndex + 1 < images.length ? currentIndex + 1 : -1
      if (nextIndex >= 0) {
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.as = 'image'
        link.href = images[nextIndex].src
        document.head.appendChild(link)
        return () => {
          document.head.removeChild(link)
        }
      }
    }
  }, [currentIndex, images])

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
    if (e.touches.length === 1) {
      touchStartX.current = e.touches[0].clientX
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

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false)
    if (touchStartX.current !== null && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartX.current
      if (Math.abs(deltaX) > 50) {
        if (deltaX > 0) onPrev()
        else onNext()
      }
      touchStartX.current = null
    }
  }

  if (!currentImage) return null

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 bg-black/95 flex items-start justify-center pt-4 md:pt-8 ${isFullscreen ? 'z-[60]' : ''}`}
      style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)' }}
      onClick={(e) => {
        // Close when clicking the backdrop, but ignore clicks inside content
        if (e.target === containerRef.current) onClose()
      }}
    >
      {/* Modal container */}
      <div 
        className="relative w-[92vw] md:w-[85vw] lg:w-[75vw] max-w-6xl max-h-[90vh] bg-black/80 rounded-xl shadow-2xl border border-white/10 overflow-hidden"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
      >
        {/* Close button */}
        <div className="absolute top-2 right-2 z-20">
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

        {/* Navigation buttons */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrev}
          className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12 p-0"
          title="Previous (←)"
        >
          <ChevronLeft className="h-7 w-7 md:h-8 md:w-8" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 z-20 text-white hover:bg-white/20 h-10 w-10 md:h-12 md:w-12 p-0"
          title="Next (→)"
        >
          <ChevronRight className="h-7 w-7 md:h-8 md:w-8" />
        </Button>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row h-[64vh] md:h-[70vh] w-full p-2 md:p-4 pb-16">
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
              className={`relative w-full h-full max-w-full ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg) translate(${position.x}px, ${position.y}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out'
              }}
            >
              <Image
                src={currentImage.src}
                alt={currentImage.alt || currentImage.title || "Gallery Image"}
                fill
                className={`object-contain w-full h-full transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                priority
                fetchPriority="high"
                quality={50}
                placeholder="blur"
                blurDataURL={blurDataURL}
                onLoadingComplete={() => setIsImageLoaded(true)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 80vw"
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
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {Math.round(scale * 100)}%
              </div>
            )}
          </div>

          {/* Info panel: hide by default on mobile, toggleable */}
          {showInfo && (
            <div className="lg:w-80 bg-gradient-to-br from-emerald-900/20 to-green-900/20 backdrop-blur-sm rounded-lg p-4 md:p-6 text-white lg:ml-6 mt-4 lg:mt-0 border border-emerald-500/20 max-h-full overflow-y-auto">
              <h2 className="text-2xl font-bold mb-3 text-emerald-100">{currentImage.title}</h2>
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        <div 
          className="absolute left-0 right-0 flex justify-center space-x-2 max-w-full overflow-x-auto px-2 md:px-4 pb-1"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)' }}
        >
          {images.map((image, index) => (
            <LightboxThumbnail 
              key={image.id}
              image={image}
              index={index}
              onClick={() => handleThumbnailClick(index)}
            />
          ))}
        </div>

        {/* Keyboard shortcuts help */}
        {!isMobile && (
          <div 
            className="absolute right-4 text-white/60 text-xs"
            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)' }}
          >
            <div>ESC: Close | ←→: Navigate | +/-: Zoom | R: Rotate | 0: Reset | F: Fullscreen | I: Info | Mouse: Drag/Zoom</div>
          </div>
        )}
      </div>
    </div>
  )
}
