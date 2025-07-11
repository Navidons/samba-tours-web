"use client"

import { useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, ChevronLeft, ChevronRight, Download, Share2, Heart, MapPin, Camera, Calendar, Eye } from "lucide-react"

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
}

export default function GalleryLightbox({ images, currentIndex, onClose, onNext, onPrev }: GalleryLightboxProps) {
  const currentImage = images[currentIndex]

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

  if (!currentImage) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 h-10 w-10 p-0"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Navigation buttons */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12 p-0"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={onNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 text-white hover:bg-white/20 h-12 w-12 p-0"
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row h-full w-full max-w-7xl mx-auto p-4">
        {/* Image */}
        <div className="flex-1 flex items-center justify-center relative">
          <div className="relative max-w-full max-h-full">
            <Image
              src={currentImage.src || "/placeholder.svg"}
              alt={currentImage.alt}
              width={1200}
              height={800}
              className="max-w-full max-h-[80vh] object-contain"
              priority
            />
          </div>
        </div>

        {/* Info panel */}
        <div className="lg:w-80 bg-gradient-to-br from-emerald-900/20 to-green-900/20 backdrop-blur-sm rounded-lg p-6 text-white lg:ml-6 mt-4 lg:mt-0 border border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white capitalize border-0">
              {currentImage.category.replace("-", " ")}
            </Badge>
            <span className="text-sm text-emerald-200">
              {currentIndex + 1} of {images.length}
            </span>
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
                <span>{currentImage.likes}</span>
              </div>
              <div className="flex items-center space-x-1 text-emerald-200">
                <Eye className="h-4 w-4" />
                <span>{currentImage.views}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 border-0"
            >
              <Heart className="h-4 w-4 mr-2" />
              Like
            </Button>
            <Button
              size="sm"
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 border-0"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 border-0"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4">
        {images.slice(Math.max(0, currentIndex - 5), currentIndex + 6).map((image, index) => {
          const actualIndex = Math.max(0, currentIndex - 5) + index
          return (
            <div
              key={image.id}
              className={`relative w-16 h-16 flex-shrink-0 rounded cursor-pointer overflow-hidden ${
                actualIndex === currentIndex ? "ring-2 ring-emerald-400" : "opacity-60 hover:opacity-100"
              }`}
              onClick={() => {
                const newIndex = actualIndex
                if (newIndex !== currentIndex) {
                  // Update current index logic would go here
                }
              }}
            >
              <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
