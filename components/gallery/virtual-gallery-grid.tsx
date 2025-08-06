"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import GalleryLightbox from "./gallery-lightbox"
import OptimizedGalleryImage from "./optimized-gallery-image"

interface VirtualGalleryGridProps {
  images?: any[]
  viewMode?: "grid" | "masonry"
  itemHeight?: number
  overscan?: number
}

export default function VirtualGalleryGrid({ 
  images = [], 
  viewMode = "masonry",
  itemHeight = 300,
  overscan = 5
}: VirtualGalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [containerHeight, setContainerHeight] = useState(600)
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate how many columns we can fit
  const columns = viewMode === "masonry" 
    ? typeof window !== 'undefined' && window.innerWidth < 640 ? 1 
      : typeof window !== 'undefined' && window.innerWidth < 1024 ? 2 
      : 3
    : typeof window !== 'undefined' && window.innerWidth < 640 ? 1 
      : typeof window !== 'undefined' && window.innerWidth < 1024 ? 2 
      : 3

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) * columns - overscan * columns)
  const endIndex = Math.min(
    images.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) * columns + overscan * columns
  )

  const visibleImages = useMemo(() => {
    return images.slice(startIndex, endIndex + 1)
  }, [images, startIndex, endIndex])

  // Total height calculation
  const totalHeight = Math.ceil(images.length / columns) * itemHeight

  useEffect(() => {
    const updateContainerHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight)
      }
    }

    updateContainerHeight()
    window.addEventListener('resize', updateContainerHeight)
    return () => window.removeEventListener('resize', updateContainerHeight)
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Use throttling to improve performance and stability
    requestAnimationFrame(() => {
      setScrollTop(e.currentTarget.scrollTop)
    })
  }

  // For very large galleries (>100 images), use virtual scrolling
  // For smaller galleries, render all images with lazy loading
  const shouldUseVirtualScrolling = images.length > 100

  if (!shouldUseVirtualScrolling) {
    // Use regular optimized grid for smaller galleries
    return (
      <>
        <div
          className={`gallery-grid ${
            viewMode === "masonry"
              ? "columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4"
              : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          }`}
        >
          {images.map((item, index) => (
            <OptimizedGalleryImage
              key={item.id || index}
              item={item}
              index={index}
              viewMode={viewMode}
              priority={index < 8} // Prioritize first 8 images for faster initial load
              onClick={() => setSelectedImage(index)}
            />
          ))}
        </div>

        {selectedImage !== null && (
          <GalleryLightbox
            images={images}
            currentIndex={selectedImage}
            onClose={() => setSelectedImage(null)}
            onNext={() => setSelectedImage((selectedImage + 1) % images.length)}
            onPrev={() => setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1)}
            onIndexChange={(index) => setSelectedImage(index)}
          />
        )}
      </>
    )
  }

  // Virtual scrolling for very large galleries
  return (
    <>
      <div
        ref={containerRef}
        className="h-[80vh] overflow-auto"
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div
            style={{
              transform: `translateY(${Math.floor(startIndex / columns) * itemHeight}px)`,
              position: 'absolute',
              width: '100%'
            }}
            className={`gallery-grid ${
              viewMode === "masonry"
                ? "columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4"
                : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
            }`}
          >
            {visibleImages.map((item, index) => {
              const actualIndex = startIndex + index
              return (
                <OptimizedGalleryImage
                  key={item.id || actualIndex}
                  item={item}
                  index={actualIndex}
                  viewMode={viewMode}
                  priority={actualIndex < 8}
                  onClick={() => setSelectedImage(actualIndex)}
                />
              )
            })}
          </div>
        </div>
      </div>

      {selectedImage !== null && (
        <GalleryLightbox
          images={images}
          currentIndex={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNext={() => setSelectedImage((selectedImage + 1) % images.length)}
          onPrev={() => setSelectedImage(selectedImage === 0 ? images.length - 1 : selectedImage - 1)}
          onIndexChange={(index) => setSelectedImage(index)}
        />
      )}
    </>
  )
}
