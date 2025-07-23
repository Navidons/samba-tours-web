import type { Metadata } from 'next'

// SEO Constants
export const SEO_CONFIG = {
  siteName: 'Samba Tours',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://sambatours.co',
  alternateUrl: 'https://sambatours.co',
  defaultTitle: 'Samba Tours - Uganda\'s Premier Safari & Adventure Travel Company',
  defaultDescription: 'Experience authentic Uganda with Samba Tours. Expert-guided gorilla trekking, wildlife safaris, cultural tours, and adventure travel. Book your dream African safari today!',
  defaultKeywords: [
    'Uganda tours', 'Uganda safari', 'gorilla trekking Uganda', 'wildlife safari',
    'Bwindi gorilla trekking', 'Uganda travel', 'East Africa safari', 'adventure travel Uganda',
    'Uganda tour packages', 'Murchison Falls', 'Queen Elizabeth Park', 'cultural tours Uganda',
    'Uganda travel agency', 'eco tourism Uganda', 'mountain gorilla tours', 'Uganda vacation',
    'African safari', 'primate tours', 'birding tours Uganda', 'Uganda honeymoon safari'
  ],
  twitterHandle: '@sambatours',
  facebookPage: 'SambaToursUganda',
  instagramHandle: '@sambatours',
  linkedin: 'company/samba-tours',
  organization: {
    name: 'Samba Tours and Travel',
    legalName: 'Samba Tours and Travel Limited',
    foundingDate: '2010',
    description: 'Uganda\'s leading eco-tourism and safari company specializing in gorilla trekking, wildlife safaris, and cultural experiences.',
    email: 'info@sambatours.co',
    phone: '+256-700-123-456',
    address: {
      streetAddress: 'Plot 123, Kampala Road',
      addressLocality: 'Kampala',
      addressRegion: 'Central Region',
      postalCode: '256',
      addressCountry: 'UG'
    }
  }
}

// Enhanced Metadata Generator
export function generateSEOMetadata({
  title,
  description,
  keywords = [],
  images = [],
  type = 'website',
  publishedTime,
  modifiedTime,
  authors = [],
  canonical,
  noIndex = false,
  noFollow = false,
  alternates = {},
  jsonLd = []
}: {
  title?: string
  description?: string
  keywords?: string[]
  images?: string[]
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  canonical?: string
  noIndex?: boolean
  noFollow?: boolean
  alternates?: Record<string, string>
  jsonLd?: any[]
}): Metadata {
  const fullTitle = title 
    ? `${title} | ${SEO_CONFIG.siteName}`
    : SEO_CONFIG.defaultTitle

  const seoDescription = description || SEO_CONFIG.defaultDescription
  const seoKeywords = [...SEO_CONFIG.defaultKeywords, ...keywords].join(', ')
  
  const metadata: Metadata = {
    title: fullTitle,
    description: seoDescription,
    keywords: seoKeywords,
    authors: [{ name: SEO_CONFIG.siteName }],
    creator: SEO_CONFIG.siteName,
    publisher: SEO_CONFIG.siteName,
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      }
    },
    openGraph: {
      type,
      title: fullTitle,
      description: seoDescription,
      siteName: SEO_CONFIG.siteName,
      url: canonical ? `${SEO_CONFIG.siteUrl}${canonical}` : SEO_CONFIG.siteUrl,
      images: images.length > 0 ? images.map(img => ({
        url: img.startsWith('http') ? img : `${SEO_CONFIG.siteUrl}${img}`,
        width: 1200,
        height: 630,
        alt: title || SEO_CONFIG.siteName
      })) : [{
        url: `${SEO_CONFIG.siteUrl}/images/og-default.jpg`,
        width: 1200,
        height: 630,
        alt: SEO_CONFIG.siteName
      }],
      locale: 'en_US'
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: seoDescription,
      creator: SEO_CONFIG.twitterHandle,
      site: SEO_CONFIG.twitterHandle,
      images: images.length > 0 ? images : [`${SEO_CONFIG.siteUrl}/images/twitter-card.jpg`]
    },
    alternates: {
      canonical: canonical ? `${SEO_CONFIG.siteUrl}${canonical}` : undefined,
      ...alternates
    }
  }

  // Add article-specific metadata
  if (type === 'article' && (publishedTime || modifiedTime || authors.length > 0)) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: authors.length > 0 ? authors : [SEO_CONFIG.siteName]
    }
  }

  return metadata
}

// JSON-LD Structured Data Generators
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": SEO_CONFIG.organization.name,
    "legalName": SEO_CONFIG.organization.legalName,
    "foundingDate": SEO_CONFIG.organization.foundingDate,
    "description": SEO_CONFIG.organization.description,
    "url": SEO_CONFIG.siteUrl,
    "logo": `${SEO_CONFIG.siteUrl}/images/logo.png`,
    "image": `${SEO_CONFIG.siteUrl}/images/company-photo.jpg`,
    "email": SEO_CONFIG.organization.email,
    "telephone": SEO_CONFIG.organization.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": SEO_CONFIG.organization.address.streetAddress,
      "addressLocality": SEO_CONFIG.organization.address.addressLocality,
      "addressRegion": SEO_CONFIG.organization.address.addressRegion,
      "postalCode": SEO_CONFIG.organization.address.postalCode,
      "addressCountry": SEO_CONFIG.organization.address.addressCountry
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 0.3136,
      "longitude": 32.5811
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "Uganda"
      },
      {
        "@type": "Country", 
        "name": "Kenya"
      },
      {
        "@type": "Country",
        "name": "Tanzania"
      },
      {
        "@type": "Country",
        "name": "Rwanda"
      }
    ],
    "serviceType": [
      "Safari Tours",
      "Gorilla Trekking",
      "Wildlife Tours", 
      "Cultural Tours",
      "Adventure Travel",
      "Eco Tourism"
    ],
    "sameAs": [
      `https://facebook.com/${SEO_CONFIG.facebookPage}`,
      `https://twitter.com/${SEO_CONFIG.twitterHandle.replace('@', '')}`,
      `https://instagram.com/${SEO_CONFIG.instagramHandle.replace('@', '')}`,
      `https://linkedin.com/${SEO_CONFIG.linkedin}`
    ]
  }
}

export function generateTourSchema(tour: any) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": tour.title,
    "description": tour.description || tour.shortDescription,
    "image": tour.images?.map((img: any) => 
      typeof img === 'string' 
        ? (img.startsWith('http') ? img : `${SEO_CONFIG.siteUrl}${img}`)
        : (img.data?.startsWith('http') ? img.data : `${SEO_CONFIG.siteUrl}${img.data || ''}`)
    ) || [],
    "url": `${SEO_CONFIG.siteUrl}/tours/${tour.slug}`,
    "duration": tour.duration ? `P${tour.duration}D` : undefined,
    "touristType": tour.category || "Adventure",
    "itinerary": tour.itinerary?.map((day: any, index: number) => ({
      "@type": "TouristDestination",
      "name": day.title || `Day ${index + 1}`,
      "description": day.description
    })),
    "offers": {
      "@type": "Offer",
      "price": tour.price?.toString(),
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString(),
      "seller": {
        "@type": "TravelAgency",
        "name": SEO_CONFIG.organization.name
      }
    },
    "provider": {
      "@type": "TravelAgency", 
      "name": SEO_CONFIG.organization.name,
      "url": SEO_CONFIG.siteUrl
    },
    "aggregateRating": tour.rating ? {
      "@type": "AggregateRating",
      "ratingValue": tour.rating,
      "ratingCount": tour.reviewCount || 1,
      "bestRating": 5,
      "worstRating": 1
    } : undefined
  }
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{name: string, url: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": `${SEO_CONFIG.siteUrl}${crumb.url}`
    }))
  }
}

export function generateReviewSchema(review: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    "author": {
      "@type": "Person",
      "name": review.author || "Anonymous"
    },
    "reviewRating": {
      "@type": "Rating", 
      "ratingValue": review.rating,
      "bestRating": 5,
      "worstRating": 1
    },
    "reviewBody": review.comment,
    "datePublished": review.createdAt || new Date().toISOString()
  }
}

export function generateFAQSchema(faqs: Array<{question: string, answer: string}>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }
}

// SEO Analytics & Performance
export function generatePreloadLinks(criticalResources: string[]) {
  return criticalResources.map(resource => ({
    rel: 'preload',
    href: resource,
    as: resource.endsWith('.css') ? 'style' :
        resource.endsWith('.js') ? 'script' :
        resource.match(/\.(jpg|jpeg|png|webp)$/) ? 'image' : 'fetch'
  }))
}

export function generateRobotsMeta(options: {
  index?: boolean
  follow?: boolean
  archive?: boolean
  snippet?: boolean
  imageIndex?: boolean
  translate?: boolean
} = {}) {
  const directives = []
  
  if (options.index === false) directives.push('noindex')
  if (options.follow === false) directives.push('nofollow') 
  if (options.archive === false) directives.push('noarchive')
  if (options.snippet === false) directives.push('nosnippet')
  if (options.imageIndex === false) directives.push('noimageindex')
  if (options.translate === false) directives.push('notranslate')
  
  return directives.length > 0 ? directives.join(',') : 'index,follow'
} 
