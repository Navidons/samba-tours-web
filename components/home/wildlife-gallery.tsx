"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"

// Image loading optimization settings
const imageOptimization = {
  quality: 75, // Reduced for faster loading
  placeholder: 'blur' as const,
  blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
}

const wildlifeImages = [
  { src: "/home-hero-photos/elephant.jpg", alt: "African elephant in Uganda", title: "African Elephant", desc: "Gentle giants of the savannah" },
  { src: "/home-hero-photos/giraffe.jpg", alt: "Giraffe in Uganda", title: "Giraffe", desc: "Towering over the acacia trees" },
  { src: "/home-hero-photos/giraffes.jpg", alt: "Giraffes in Uganda", title: "Giraffe Family", desc: "Social creatures of the plains" },
  { src: "/home-hero-photos/zebras.jpg", alt: "Zebras in Uganda", title: "Zebras", desc: "Striped beauties of the grasslands" },
  { src: "/home-hero-photos/tourists.jpg", alt: "Tourists on safari in Uganda", title: "Safari Experience", desc: "Unforgettable wildlife encounters" },
  { src: "/home-hero-photos/woman tourist.jpg", alt: "Female tourist in Uganda", title: "Adventure Awaits", desc: "Personal safari experiences" },
  { src: "/tours-attractions/lion cubs.jpg", alt: "Lion cubs in Uganda", title: "Lion Cubs", desc: "Future kings of the jungle" },
  { src: "/tours-attractions/boat cruise.jpg", alt: "Boat cruise in Uganda", title: "Boat Safari", desc: "Water-based wildlife viewing" },
]

export default function WildlifeGallery() {
  return (
    <section className="py-20 bg-gradient-to-b from-emerald-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="bg-emerald-100 text-emerald-800 mb-4">Wildlife Gallery</Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Uganda's Magnificent Wildlife
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From majestic elephants to graceful giraffes, discover the incredible diversity of wildlife that calls Uganda home
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {wildlifeImages.map((img, idx) => (
            <div key={img.src} className="relative group overflow-hidden rounded-xl h-48">
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover w-full group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
                quality={imageOptimization.quality}
                placeholder="blur"
                blurDataURL={imageOptimization.blurDataURL}
                loading="lazy" // All images lazy loaded since they're below the fold
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="font-semibold">{img.title}</h3>
                <p className="text-sm text-emerald-200">{img.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
