"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Share2, Camera } from "lucide-react"

interface OptimizedGalleryImageProps {
  item: {
    id: number | string
    src: string
    alt: string
    title?: string
    description?: string
    aspectRatio?: string
    featured?: boolean
  }
  index: number
  viewMode: "grid" | "masonry"
  onClick: () => void
  priority?: boolean
}

export default function OptimizedGalleryImage({ 
  item, 
  index, 
  viewMode, 
  onClick, 
  priority = false 
}: OptimizedGalleryImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const [hasError, setHasError] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  // Blur data URL for better loading experience
  const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAREBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

  // Viewport-driven loading to prevent fetching all images at once
  useEffect(() => {
    if (!imageRef.current || isInView) return
    const element = imageRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.unobserve(element)
          }
        })
      },
      { root: null, rootMargin: '600px', threshold: 0.01 }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [isInView])

  const getGridItemClass = (aspectRatio: string) => {
    switch (aspectRatio) {
      case "1:1":
        return "aspect-square"
      case "3:4":
        return "aspect-[3/4]"
      case "4:3":
        return "aspect-[4/3]"
      case "3:2":
        return "aspect-[3/2]"
      case "8:5":
        return "aspect-[8/5]"
      case "5:3":
        return "aspect-[5/3]"
      case "8:7":
        return "aspect-[8/7]"
      default:
        return "aspect-[4/3]"
    }
  }

  const handleImageLoad = () => {
    setIsLoaded(true)
  }

  const handleImageError = () => {
    setHasError(true)
    setIsLoaded(true) // Stop showing loading state
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Implement sharing functionality
    if (navigator.share) {
      navigator.share({
        title: item.title || 'Gallery Image',
        text: item.description || 'Check out this image from our gallery',
        url: window.location.href
      })
    }
  }

  return (
    <Card
      ref={imageRef}
      className={`group overflow-hidden hover:shadow-lg md:hover:shadow-xl transition-all duration-200 cursor-zoom-in border-emerald-100 hover:border-emerald-200 ${
        viewMode === "masonry" ? "break-inside-avoid mb-3 sm:mb-4" : ""
      }`}
      onClick={onClick}
    >
      <div className="relative overflow-hidden">
        {/* Image container - always rendered */}
          <div 
            className={`relative ${viewMode === "grid" ? "aspect-[4/3]" : getGridItemClass(item.aspectRatio || "4:3")} w-full bg-gray-100`}
          >
          {/* YouTube-style skeleton - clean shimmer effect */}
          <div className={`absolute inset-0 transition-opacity duration-500 ${isLoaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            {/* Main skeleton background */}
            <div className="absolute inset-0 bg-gray-200" />
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" 
                 style={{
                   backgroundSize: '200% 100%'
                 }} />
          </div>

          {/* Error state */}
          {hasError && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
              <div className="text-center text-gray-500">
                <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Image unavailable</p>
              </div>
            </div>
          )}

          {/* Actual image - render only when near/in viewport or marked priority */}
          {!hasError && item.src && isInView && (
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              quality={priority ? 70 : 60}
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              placeholder="blur"
              blurDataURL={blurDataURL}
              className={`object-cover transition-transform duration-300 ${
                isLoaded ? "opacity-100 md:group-hover:scale-105" : "opacity-0"
              } group-hover:scale-105`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}

          {/* Hover overlay - only shows when image is loaded and on desktop */}
          {isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-200" />
          )}

          {/* Featured badge - always visible */}
          {item.featured && (
            <div className="absolute top-3 left-3 z-20">
              <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0">
                Featured
              </Badge>
            </div>
          )}

          {/* Action buttons - only show when loaded and on desktop */}
          {isLoaded && (
            <div className="absolute top-3 right-3 flex space-x-2 opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 z-20">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white border-emerald-200"
                onClick={handleShare}
                title="Share image"
              >
                <Share2 className="h-4 w-4 text-emerald-600" />
              </Button>
            </div>
          )}

          {/* Bottom info overlay - only show when loaded and on desktop */}
          {isLoaded && (item.title || item.description) && (
            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white transform translate-y-full md:group-hover:translate-y-0 transition-transform duration-200 z-20">
              {item.title && <h3 className="font-semibold mb-1">{item.title}</h3>}
              {item.description && <p className="text-sm text-emerald-100 mb-2 line-clamp-2">{item.description}</p>}
              <div className="flex items-center justify-between text-xs text-emerald-200">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Camera className="h-3 w-3" />
                    <span>Gallery</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card metadata section - always visible with content */}
      {(item.title || item.description) && (
        <div className="p-3 sm:p-4 bg-white">
          {item.title && (
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base line-clamp-1">{item.title}</h3>
          )}
          {item.description && (
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{item.description}</p>
          )}
        </div>
      )}
    </Card>
  )
}
