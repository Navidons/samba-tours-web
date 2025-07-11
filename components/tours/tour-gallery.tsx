"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react"

interface TourImage {
  id: string
  data: string
  name: string
  type: string
  size: number
  altText?: string
  title?: string
  description?: string
  isFeatured: boolean
  displayOrder: number
}

interface TourGalleryProps {
  gallery?: TourImage[]
  images?: TourImage[]
  title?: string
}

export default function TourGallery({ gallery, images, title }: TourGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  
  // Handle both prop names
  const imageArray = gallery || images || []
  
  // Don't render if no images
  if (imageArray.length === 0) {
    return (
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-emerald-600" />
            <span>Photo Gallery</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">No images available for this tour.</p>
        </CardContent>
      </Card>
    )
  }

  // Convert image objects to data URLs if needed
  const getImageSrc = (image: TourImage | string) => {
    if (typeof image === 'string') {
      return image
    }
    // If data already contains a data URL, use it directly
    if (image.data && image.data.startsWith('data:')) {
      return image.data
    }
    // Otherwise construct the data URL
    return image.data ? `data:${image.type};base64,${image.data}` : null
  }

  const getImageAlt = (image: TourImage | string, index: number) => {
    if (typeof image === 'string') {
      return `${title || 'Tour'} - Image ${index + 1}`
    }
    return image.altText || image.title || `${title || 'Tour'} - Image ${index + 1}`
  }

  const openLightbox = (index: number) => {
    setSelectedImage(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % imageArray.length)
    }
  }

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + imageArray.length) % imageArray.length)
    }
  }

  return (
    <>
      <Card className="border-emerald-100">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-emerald-600" />
            <span>Photo Gallery</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imageArray.map((image, index) => {
              const imageSrc = getImageSrc(image)
              const imageAlt = getImageAlt(image, index)
              
              return (
                <div
                  key={typeof image === 'object' ? image.id : index}
                  className="relative aspect-video overflow-hidden rounded-lg cursor-pointer group"
                  onClick={() => openLightbox(index)}
                >
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <div className="text-2xl mb-1">📷</div>
                        <div className="text-xs">No Image</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:bg-white/20 h-10 w-10 p-0"
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 p-0"
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12 p-0"
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          <div className="max-w-4xl max-h-[80vh] relative">
            {imageArray[selectedImage] ? (
              <img
                src={getImageSrc(imageArray[selectedImage])}
                alt={getImageAlt(imageArray[selectedImage], selectedImage)}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📷</div>
                  <div className="text-lg">No Image Available</div>
                </div>
              </div>
            )}
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
            {selectedImage + 1} of {imageArray.length}
          </div>
        </div>
      )}
    </>
  )
}
