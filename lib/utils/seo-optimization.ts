/**
 * SEO Optimization utilities for better search engine ranking
 */

// Core Web Vitals optimization settings
export const PERFORMANCE_CONFIG = {
  // Image optimization
  images: {
    quality: 85,
    formats: ['image/webp', 'image/avif'],
    sizes: {
      mobile: '(max-width: 768px) 100vw',
      tablet: '(max-width: 1024px) 50vw', 
      desktop: '33vw'
    },
    priority: {
      aboveFold: true,
      belowFold: false
    }
  },
  
  // Font optimization
  fonts: {
    display: 'swap',
    preload: ['Inter-VariableFont_opsz,wght.ttf'],
    fallback: 'system-ui, sans-serif'
  },
  
  // Core Web Vitals targets
  vitals: {
    LCP: 2.5, // Largest Contentful Paint (seconds)
    FID: 100, // First Input Delay (milliseconds)  
    CLS: 0.1, // Cumulative Layout Shift
    FCP: 1.8, // First Contentful Paint (seconds)
    TTI: 3.8  // Time to Interactive (seconds)
  }
}

// SEO meta tag generators
export function generateSEOTags(page: {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
}) {
  const baseUrl = 'https://sambatours.co'
  const fullUrl = `${baseUrl}${page.url}`
  const imageUrl = page.image ? `${baseUrl}${page.image}` : `${baseUrl}/photos/uganda-wildlife.jpg`
  
  return {
    title: `${page.title} | Samba Tours Uganda`,
    description: page.description,
    keywords: page.keywords?.join(', '),
    canonical: fullUrl,
    
    openGraph: {
      title: page.title,
      description: page.description,
      url: fullUrl,
      siteName: 'Samba Tours Uganda',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: page.title,
          type: 'image/jpeg'
        }
      ],
      locale: 'en_US',
      type: page.type || 'website',
      ...(page.publishedTime && { publishedTime: page.publishedTime }),
      ...(page.modifiedTime && { modifiedTime: page.modifiedTime })
    },
    
    twitter: {
      card: 'summary_large_image',
      title: page.title,
      description: page.description,
      images: [imageUrl],
      creator: '@sambatoursug',
      site: '@sambatoursug'
    }
  }
}

// Structured data generators
export function generateOrganizationLD() {
  return {
    "@type": "TravelAgency",
    "@id": "https://sambatours.co/#organization",
    "name": "Samba Tours Uganda",
    "alternateName": "Samba Tours & Travel Uganda",
    "url": "https://sambatours.co",
    "logo": "https://sambatours.co/logo/samba tours-01.png",
    "description": "Premier Uganda safari company offering authentic gorilla trekking, wildlife safaris, and cultural tours.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "UG",
      "addressRegion": "Central Region", 
      "addressLocality": "Kampala"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "0.3476",
      "longitude": "32.5825"
    },
    "areaServed": [
      { "@type": "Country", "name": "Uganda" },
      { "@type": "Place", "name": "East Africa" }
    ],
    "serviceType": [
      "Safari Tours",
      "Gorilla Trekking", 
      "Wildlife Safari",
      "Cultural Tours",
      "Adventure Travel"
    ],
    "knowsAbout": [
      "Bwindi Impenetrable Forest",
      "Queen Elizabeth National Park",
      "Murchison Falls National Park",
      "Mountain Gorillas",
      "Uganda Wildlife"
    ],
    "award": "TripAdvisor Certificate of Excellence",
    "foundingDate": "2015",
    "slogan": "Discover the Pearl of Africa"
  }
}

export function generateArticleLD(article: {
  headline: string
  description: string
  image: string
  author: string
  publishDate: string
  modifiedDate: string
  url: string
}) {
  return {
    "@type": "Article",
    "headline": article.headline,
    "description": article.description,
    "image": article.image,
    "author": {
      "@type": "Person",
      "name": article.author
    },
    "publisher": generateOrganizationLD(),
    "datePublished": article.publishDate,
    "dateModified": article.modifiedDate,
    "url": article.url,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  }
}

export function generateTourLD(tour: {
  name: string
  description: string
  image: string
  price: number
  duration: string
  location: string
  url: string
}) {
  return {
    "@type": "TouristTrip",
    "name": tour.name,
    "description": tour.description,
    "image": tour.image,
    "touristType": "Safari Enthusiast",
    "itinerary": {
      "@type": "ItemList",
      "name": "Safari Itinerary"
    },
    "offers": {
      "@type": "Offer",
      "price": tour.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "seller": generateOrganizationLD()
    },
    "duration": tour.duration,
    "location": {
      "@type": "Place",
      "name": tour.location,
      "addressCountry": "UG"
    },
    "url": tour.url,
    "provider": generateOrganizationLD()
  }
}

// Brand differentiation helpers
export function generateBrandDifferentiationLD() {
  return {
    "@type": "Organization",
    "name": "Samba Tours Uganda",
    "description": "Authentic Uganda safari operator - NOT affiliated with Pamba Tours",
    "disambiguatingDescription": "Samba Tours Uganda is a distinct, independent safari company based in Kampala, Uganda. We are NOT Pamba Tours or any other similarly named company.",
    "brand": {
      "@type": "Brand", 
      "name": "Samba Tours Uganda",
      "logo": "https://sambatours.co/logo/samba tours-01.png"
    },
    "sameAs": [
      "https://sambatours.co",
      "https://www.tripadvisor.com/Attraction_Review-g293827-d12345678-Reviews-Samba_Tours_Uganda-Kampala_Central_Region.html"
    ],
    "knowsAbout": [
      "Uganda Safari",
      "Gorilla Trekking",
      "Bwindi Impenetrable Forest", 
      "Queen Elizabeth National Park"
    ]
  }
}

// Page speed optimization helpers
export function getOptimizedImageProps(src: string, alt: string, priority = false) {
  return {
    src,
    alt,
    quality: PERFORMANCE_CONFIG.images.quality,
    priority,
    sizes: priority 
      ? PERFORMANCE_CONFIG.images.sizes.mobile
      : `${PERFORMANCE_CONFIG.images.sizes.mobile}, ${PERFORMANCE_CONFIG.images.sizes.tablet}, ${PERFORMANCE_CONFIG.images.sizes.desktop}`,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  }
}

// SEO monitoring and testing
export function validateSEOCompliance(page: {
  title: string
  description: string
  h1Count: number
  imageAltCount: number
  totalImages: number
}) {
  const issues = []
  
  if (page.title.length < 30 || page.title.length > 60) {
    issues.push('Title should be 30-60 characters')
  }
  
  if (page.description.length < 120 || page.description.length > 160) {
    issues.push('Meta description should be 120-160 characters')
  }
  
  if (page.h1Count !== 1) {
    issues.push('Page should have exactly one H1 tag')
  }
  
  if (page.imageAltCount < page.totalImages) {
    issues.push('All images should have alt text')
  }
  
  return {
    isValid: issues.length === 0,
    issues
  }
}
