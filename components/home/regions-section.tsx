"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Compass } from "lucide-react"

// Image loading optimization settings
const imageOptimization = {
  quality: 75, // Reduced from 85
  placeholder: 'blur' as const,
  blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
}

// Uganda regions and their highlights
const ugandaRegions = [
  {
    name: "Western Uganda",
    description: "Home to misty mountains, endangered gorillas, and pristine crater lakes",
    highlights: [
      "Rwenzori Mountains - Africa's highest mountain range",
      "Queen Elizabeth National Park - Tree-climbing lions",
      "Bwindi Forest - Mountain gorilla sanctuary",
      "Fort Portal Craters - Scenic crater lakes"
    ],
    image: "/photos/rwenzori-mountain-hero.jpg",
    wildlifeImage: "/tours-attractions/lion.jpg",
    landscapeImage: "/photos/fort-portal-crater-hero.jpg",
    color: "emerald"
  },
  {
    name: "Eastern Uganda",
    description: "Where the mighty Nile begins its journey and adventure awaits",
    highlights: [
      "Source of the Nile - World's longest river origin",
      "Mount Elgon - Ancient volcano with unique flora",
      "Sipi Falls - Majestic triple waterfall",
      "Jinja Adventures - White water rafting capital"
    ],
    image: "/photos/the-source-of-nile-hero.jpg",
    wildlifeImage: "/tours-attractions/elephant 2.jpg",
    landscapeImage: "/photos/river-nile-jinja-hero.jpg",
    color: "blue"
  },
  {
    name: "Northern Uganda",
    description: "Wild savannahs, powerful waterfalls, and incredible wildlife diversity",
    highlights: [
      "Murchison Falls - World's most powerful waterfall",
      "Nile River - Spectacular wildlife viewing",
      "Kidepo Valley - Remote wilderness paradise",
      "Wildlife Safaris - Big five encounters"
    ],
    image: "/photos/african-nile.jpg",
    wildlifeImage: "/tours-attractions/giraffe.jpg",
    landscapeImage: "/photos/Murchison Falls National Park.webp",
    color: "orange"
  },
  {
    name: "Central Uganda",
    description: "The heart of Uganda with vibrant culture and modern city life",
    highlights: [
      "Kampala City - Bustling capital with rich history",
      "Lake Victoria - Africa's largest lake",
      "Cultural Heritage - Traditional kingdoms",
      "Urban Adventures - Markets and nightlife"
    ],
    image: "/photos/kampala-city-ug.jpg",
    wildlifeImage: "/tours-attractions/buffalo.jpg",
    landscapeImage: "/photos/lake-victoria-ug-hero.jpg",
    color: "purple"
  }
]

export default function RegionsSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/photos/uganda-map-pattern.svg')] opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 via-transparent to-green-100/20" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <Badge className="bg-emerald-100 text-emerald-800 mb-4">Explore Uganda</Badge>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Uganda's Diverse Regions
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Each region of Uganda offers unique experiences, from mountain gorillas in the west to the source of the Nile in the east
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {ugandaRegions.map((region, index) => (
            <div 
              key={index}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-100"
            >
              {/* Main Hero Image */}
              <div className="relative h-64 md:h-80">
                <Image
                  src={region.image}
                  alt={region.name}
                  fill
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  loading="lazy" // Changed from priority to lazy
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={imageOptimization.quality}
                  placeholder="blur"
                  blurDataURL={imageOptimization.blurDataURL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/50 to-transparent group-hover:via-emerald-900/60 transition-all duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-200 transition-colors duration-300">{region.name}</h3>
                  <p className="text-emerald-100 text-sm mb-3">{region.description}</p>
                </div>
              </div>
              
              {/* Content Section */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge className={`bg-${region.color}-100 text-${region.color}-800`}>
                    {region.highlights.length} Highlights
                  </Badge>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-6">
                  {region.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300 ease-in-out">
                      <Compass className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700 leading-relaxed">{highlight}</span>
                    </li>
                  ))}
                </ul>
                
                {/* Additional Images Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative overflow-hidden rounded-lg">
                    <Image
                      src={region.wildlifeImage}
                      alt={`Wildlife in ${region.name}`}
                      fill
                      className="object-cover w-full h-20 group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      quality={imageOptimization.quality}
                      placeholder="blur"
                      blurDataURL={imageOptimization.blurDataURL}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute bottom-1 left-1">
                      <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">Wildlife</span>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-lg">
                    <Image
                      src={region.landscapeImage}
                      alt={`Landscape in ${region.name}`}
                      fill
                      className="object-cover w-full h-20 group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      quality={imageOptimization.quality}
                      placeholder="blur"
                      blurDataURL={imageOptimization.blurDataURL}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                    <div className="absolute bottom-1 left-1">
                      <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">Landscape</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
