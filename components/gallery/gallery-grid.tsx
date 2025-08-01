"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Share2, Eye, Camera } from "lucide-react"
import GalleryLightbox from "./gallery-lightbox"
import { useInView } from "react-intersection-observer"

interface GalleryGridProps {
  images?: any[]
  viewMode?: "grid" | "masonry"
}

export default function GalleryGrid({ images = [], viewMode = "masonry" }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [visibleImages, setVisibleImages] = useState<number[]>([])
  
  // Blur data URL for better loading experience
  const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAREBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  
  // Load images in batches of 8
  const BATCH_SIZE = 8
  
  useEffect(() => {
    // Initially load first batch
    setVisibleImages(images.slice(0, BATCH_SIZE).map(img => img.id))
    
    // Set up intersection observer for infinite scroll
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleImages.length < images.length) {
        const nextBatch = images
          .slice(visibleImages.length, visibleImages.length + BATCH_SIZE)
          .map(img => img.id)
        setVisibleImages(prev => [...prev, ...nextBatch])
      }
    }, { rootMargin: '100px' })
    
    // Observe the last image
    const lastImage = document.querySelector('.gallery-image:last-child')
    if (lastImage) observer.observe(lastImage)
    
    return () => observer.disconnect()
  }, [images, visibleImages.length])

  const handleImageLoad = (id: number) => {
    setLoadedImages((prev) => new Set([...prev, id]))
  }

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

  const renderImageCard = (item: any, index: number) => {
    // Skip rendering if image is not in visible batch
    if (!visibleImages.includes(item.id)) return null

    return (
      <Card
        key={item.id}
        className={`gallery-image group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-emerald-100 hover:border-emerald-200 ${
          viewMode === "masonry" ? "break-inside-avoid mb-4" : ""
        }`}
        onClick={() => {
          setSelectedImage(index)
        }}
      >
        <div className="relative overflow-hidden">
          <div 
            className={`relative ${viewMode === "grid" ? "aspect-[4/3]" : getGridItemClass(item.aspectRatio)} w-full`}
            style={{ backgroundColor: '#f3f4f6' }} // Placeholder color
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              quality={85}
              priority={index < 6} // Prioritize first 6 images
              loading={index < 6 ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL={blurDataURL}
              className={`object-cover group-hover:scale-105 transition-transform duration-500 ${
                loadedImages.has(item.id) ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => handleImageLoad(item.id)}
            />

            {/* Loading skeleton */}
            {!loadedImages.has(item.id) && (
              <div className="absolute inset-0 bg-emerald-100 animate-pulse" />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Featured badge */}
            {item.featured && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white border-0">
                  Featured
                </Badge>
              </div>
            )}

            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white border-emerald-200"
                onClick={(e) => e.stopPropagation()}
              >
                <Share2 className="h-4 w-4 text-emerald-600" />
              </Button>
            </div>

            {/* Bottom info overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-emerald-100 mb-2 line-clamp-2">{item.description}</p>

              <div className="flex items-center justify-between text-xs text-emerald-200">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Camera className="h-3 w-3" />
                    <span>Gallery</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-3 w-3" />
                    <span>{item.views || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-6">
          Captured
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
            Moments
          </span>
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Experience the beauty of Uganda through our lens. Every photo tells a story of adventure, wildlife
          encounters, and unforgettable moments from our safari expeditions.
        </p>
      </div>

      <div
        className={
          viewMode === "masonry"
            ? "columns-1 sm:columns-2 lg:columns-3 gap-4"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        }
      >
        {images.map((item, index) => renderImageCard(item, index))}
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
