import { MetadataRoute } from 'next'
import { SEO_CONFIG } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/tours/',
          '/blog/',
          '/gallery/',
          '/about',
          '/contact',
          '/faqs',
          '/careers',
          '/press',
          '/privacy',
          '/terms',
          '/api/tours/',
          '/api/blog/',
          '/api/gallery/'
        ],
        disallow: [
          '/admin/',
          '/signin',
          '/cart/',
          '/checkout/',
          '/booking-confirmation/',
          '/api/admin/',
          '/api/test-*',
          '/api/upload/',
          '/api/email/',
          '/api/track-visitor',
          '/_next/',
          '/search?*',
          '*?*utm_*',
          '*?*ref=*',
          '*?*fbclid=*',
          '*?*gclid=*',
          '*.json',
          '*.xml',
          '/tmp/',
          '/temp/'
        ],
        crawlDelay: 1
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/tours/',
          '/blog/',
          '/gallery/',
          '/about',
          '/contact',
          '/faqs',
          '/careers',
          '/press',
          '/privacy',
          '/terms'
        ],
        disallow: [
          '/admin/',
          '/signin',
          '/cart/',
          '/checkout/',
          '/booking-confirmation/',
          '/api/admin/',
          '/api/test-*',
          '/api/upload/',
          '/api/email/',
          '/api/track-visitor'
        ]
      },
      {
        userAgent: 'Bingbot',
        allow: [
          '/',
          '/tours/',
          '/blog/',
          '/gallery/',
          '/about',
          '/contact',
          '/faqs',
          '/careers',
          '/press',
          '/privacy',
          '/terms'
        ],
        disallow: [
          '/admin/',
          '/signin',
          '/cart/',
          '/checkout/',
          '/booking-confirmation/',
          '/api/admin/',
          '/api/test-*',
          '/api/upload/',
          '/api/email/',
          '/api/track-visitor'
        ]
      },
      {
        userAgent: 'facebookexternalhit',
        allow: [
          '/',
          '/tours/',
          '/blog/',
          '/gallery/',
          '/about',
          '/contact'
        ]
      },
      {
        userAgent: 'Twitterbot',
        allow: [
          '/',
          '/tours/',
          '/blog/',
          '/gallery/',
          '/about',
          '/contact'
        ]
      },
      // Block malicious bots
      {
        userAgent: [
          'AhrefsBot',
          'MJ12bot',
          'DotBot',
          'SemrushBot',
          'MegaIndex.ru',
          'BLEXBot',
          'PetalBot'
        ],
        disallow: '/'
      }
    ],
    sitemap: [
      `${SEO_CONFIG.siteUrl}/sitemap.xml`,
      `${SEO_CONFIG.alternateUrl}/sitemap.xml`
    ],
    host: SEO_CONFIG.siteUrl
  }
} 
