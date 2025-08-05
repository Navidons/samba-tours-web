import { Suspense } from "react"
import type { Metadata } from "next"
import GalleryClient from "./GalleryClient"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ScrollGuard from "@/components/ui/scroll-guard"

export const metadata: Metadata = {
  title: "Uganda Safari Gallery - Wildlife Photos & Adventure Images",
  description: "Explore stunning Uganda safari photos featuring gorillas, lions, elephants, and wildlife. Discover breathtaking landscapes, cultural moments, and adventure photography from the Pearl of Africa.",
  keywords: "Uganda safari photos, wildlife photography, gorilla trekking images, safari gallery, Uganda wildlife, African safari pictures, adventure photography",
  authors: [{ name: "Samba Tours" }],
  creator: "Samba Tours",
  publisher: "Samba Tours",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sambatours.co'),
  alternates: {
    canonical: '/gallery',
  },
  openGraph: {
    title: "Uganda Safari Gallery - Wildlife Photos & Adventure Images",
    description: "Explore stunning Uganda safari photos featuring gorillas, lions, elephants, and wildlife. Discover breathtaking landscapes and cultural moments.",
    url: '/gallery',
    siteName: 'Samba Tours',
    images: [
      {
        url: '/photos/uganda-wildlife.jpg',
        width: 1200,
        height: 630,
        alt: 'Uganda Wildlife Safari Gallery',
      },
      {
        url: '/photos/giraffe-uganda-savana-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Giraffes in Uganda Savannah',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Uganda Safari Gallery - Wildlife Photos & Adventure Images",
    description: "Explore stunning Uganda safari photos featuring gorillas, lions, elephants, and wildlife. Discover breathtaking landscapes and cultural moments.",
    images: ['/photos/uganda-wildlife.jpg'],
    creator: '@sambatours',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

// Structured Data for Gallery
const galleryStructuredData = {
  "@context": "https://schema.org",
  "@type": "ImageGallery",
  "name": "Uganda Safari Gallery",
  "description": "Explore stunning Uganda safari photos featuring gorillas, lions, elephants, and wildlife. Discover breathtaking landscapes, cultural moments, and adventure photography from the Pearl of Africa.",
  "url": "https://sambatours.co/gallery",
  "publisher": {
    "@type": "Organization",
    "name": "Samba Tours",
    "url": "https://sambatours.co"
  },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ImageObject",
        "name": "Uganda Wildlife Safari",
        "description": "Diverse wildlife of Uganda's national parks",
        "url": "https://sambatours.co/photos/uganda-wildlife.jpg",
        "contentUrl": "https://sambatours.co/photos/uganda-wildlife.jpg"
      },
      {
        "@type": "ImageObject",
        "name": "Giraffes in Uganda Savannah",
        "description": "Graceful giraffes in Uganda's beautiful savanna landscape",
        "url": "https://sambatours.co/photos/giraffe-uganda-savana-hero.jpg",
        "contentUrl": "https://sambatours.co/photos/giraffe-uganda-savana-hero.jpg"
      }
    ]
  }
}

interface GalleryPageProps {
  searchParams: {
    category?: string
    location?: string
    featured?: string
    search?: string
    page?: string
  }
}

export const dynamic = 'force-dynamic'

export default function GalleryPage({ searchParams }: GalleryPageProps) {
  return (
    <ScrollGuard>
      <h1 className="sr-only">Uganda Safari Gallery - Wildlife & Adventure Photos</h1>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(galleryStructuredData),
        }}
      />

      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading gallery...</p>
          </div>
        </div>
      }>
        <GalleryClient searchParams={searchParams} hideMainHeading={true} />
      </Suspense>
    </ScrollGuard>
  )
}
