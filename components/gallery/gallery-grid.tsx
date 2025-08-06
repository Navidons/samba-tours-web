"use client"

import { useState } from "react"
import GalleryLightbox from "./gallery-lightbox"
import OptimizedGalleryImage from "./optimized-gallery-image"

interface GalleryGridProps {
  images?: any[]
  viewMode?: "grid" | "masonry"
}

export default function GalleryGrid({ images = [], viewMode = "masonry" }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

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
            priority={index < 8} // Prioritize first 8 images
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
