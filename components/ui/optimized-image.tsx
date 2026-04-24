"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
  sizes?: string
  quality?: number
  className?: string
  containerClassName?: string
  onLoad?: () => void
  onError?: () => void
  placeholder?: "blur" | "empty"
  blurDataURL?: string
  loading?: "lazy" | "eager"
  responsive?: boolean
  aspectRatio?: "16/9" | "4/3" | "1/1" | "3/2"
}

// Blur data URL for better loading experience
const defaultBlurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

export default function OptimizedImage({
  src,
  alt,
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  quality = 85,
  className,
  containerClassName,
  onLoad,
  onError,
  placeholder = "blur",
  blurDataURL = defaultBlurDataURL,
  loading = "lazy",
  responsive = false,
  aspectRatio
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === "eager") {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { 
        threshold: 0.1,
        rootMargin: "50px" // Start loading 50px before entering viewport
      }
    )

    if (imageRef.current) {
      observer.observe(imageRef.current)
    }

    return () => observer.disconnect()
  }, [priority, loading])

  // Generate responsive sizes if not provided
  const getResponsiveSizes = () => {
    if (sizes) return sizes
    
    if (responsive) {
      return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    }
    
    return fill ? "100vw" : undefined
  }

  // Generate aspect ratio classes
  const getAspectRatioClass = () => {
    if (!aspectRatio) return ""
    
    const ratios = {
      "16/9": "aspect-video",
      "4/3": "aspect-[4/3]",
      "1/1": "aspect-square",
      "3/2": "aspect-[3/2]"
    }
    
    return ratios[aspectRatio] || ""
  }

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    onError?.()
  }

  return (
    <div 
      ref={imageRef}
      className={cn(
        "relative overflow-hidden",
        getAspectRatioClass(),
        containerClassName
      )}
    >
      {isInView && (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={!fill ? width : undefined}
          height={!fill ? height : undefined}
          priority={priority}
          sizes={getResponsiveSizes()}
          quality={quality}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      
      {/* Loading placeholder */}
      {!isLoaded && placeholder === "blur" && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}
    </div>
  )
}

// Usage examples:
/*
// Hero image with priority loading
<OptimizedImage
  src="/hero-image.jpg"
  alt="Hero"
  fill
  priority
  sizes="100vw"
  aspectRatio="16/9"
/>

// Lazy loaded thumbnail
<OptimizedImage
  src="/thumbnail.jpg"
  alt="Thumbnail"
  width={400}
  height={300}
  responsive
  aspectRatio="4/3"
/>

// Gallery image with custom loading
<OptimizedImage
  src="/gallery-image.jpg"
  alt="Gallery"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  onLoad={() => console.log('Image loaded')}
/>
*/ 