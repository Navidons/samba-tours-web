import { Suspense } from "react"
import type { Metadata } from "next"
import LoadingSpinner from "@/components/ui/loading-spinner"
import BlogClient from "./BlogClient"

export const metadata: Metadata = {
  title: "Uganda Safari Blog - Travel Stories, Tips & Wildlife Guides",
  description: "Expert Uganda safari blog with gorilla trekking guides, wildlife stories, travel tips, and cultural insights. Discover the best of African adventure travel from local experts.",
  keywords: "Uganda safari blog, gorilla trekking guide, wildlife stories, travel tips, African safari, Uganda travel blog, safari advice, adventure travel",
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
    canonical: '/blog',
  },
  openGraph: {
    title: "Uganda Safari Blog - Travel Stories, Tips & Wildlife Guides",
    description: "Expert Uganda safari blog with gorilla trekking guides, wildlife stories, travel tips, and cultural insights. Discover the best of African adventure travel.",
    url: '/blog',
    siteName: 'Samba Tours',
    images: [
      {
        url: '/photos/queen-elizabeth-national-park-uganda.jpg',
        width: 1200,
        height: 630,
        alt: 'Uganda Safari Blog - Queen Elizabeth National Park',
      },
      {
        url: '/photos/chimpanzee-bwindi-forest-impenetrable-park.jpg',
        width: 1200,
        height: 630,
        alt: 'Chimpanzees in Bwindi Forest - Uganda Safari Blog',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Uganda Safari Blog - Travel Stories, Tips & Wildlife Guides",
    description: "Expert Uganda safari blog with gorilla trekking guides, wildlife stories, travel tips, and cultural insights. Discover the best of African adventure travel.",
    images: ['/photos/queen-elizabeth-national-park-uganda.jpg'],
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

// Structured Data for Blog
const blogStructuredData = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "name": "Uganda Safari Blog",
  "description": "Expert Uganda safari blog with gorilla trekking guides, wildlife stories, travel tips, and cultural insights. Discover the best of African adventure travel from local experts.",
  "url": "https://sambatours.co/blog",
  "publisher": {
    "@type": "Organization",
    "name": "Samba Tours",
    "url": "https://sambatours.co",
    "logo": {
      "@type": "ImageObject",
      "url": "https://sambatours.co/logo/samba tours-01.png"
    }
  },
  "mainEntity": {
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Article",
          "headline": "Uganda Safari Blog",
          "description": "Expert guides, wildlife encounters, and travel tips from Uganda's top safari company"
        }
      }
    ]
  },
  "about": [
    {
      "@type": "Thing",
      "name": "Uganda Safari"
    },
    {
      "@type": "Thing", 
      "name": "Gorilla Trekking"
    },
    {
      "@type": "Thing",
      "name": "Wildlife Photography"
    },
    {
      "@type": "Thing",
      "name": "African Adventure Travel"
    }
  ]
}

export default function BlogPage() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogStructuredData),
        }}
      />
      
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner className="h-12 w-12" />
            <p className="mt-4 text-gray-600">Loading blog...</p>
          </div>
        </div>
      }>
        <BlogClient />
      </Suspense>
    </>
  )
}
