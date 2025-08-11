"use client"

import { } from "react"
import OptimizedGalleryImage from "./optimized-gallery-image"

interface GalleryGridProps {
  images?: any[]
  viewMode?: "grid" | "masonry"
}

export default function GalleryGrid({ images = [], viewMode = "masonry" }: GalleryGridProps) {
  return (
    <>
      <div
        className={`gallery-grid ${
          viewMode === "masonry"
            ? "columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4"
            : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
        }`}
      >
        {images.map((item, index) => (
          <OptimizedGalleryImage
            key={item.id || index}
            item={item}
            index={index}
            viewMode={viewMode}
            priority={index < 8} // Prioritize first 8 images
            onClick={() => {}}
          />
        ))}
      </div>
    </>
  )
}
