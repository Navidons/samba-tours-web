import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { MockAuthProvider } from "@/components/auth/mock-auth-provider"
import { UserAuthProvider } from "@/components/auth/user-auth-provider"
import { CartProvider } from "@/hooks/use-cart"
import ConditionalLayout from "@/components/layout/conditional-layout"

import StructuredData from "@/components/seo/structured-data"
import { generateSEOMetadata, generateOrganizationSchema, SEO_CONFIG } from "@/lib/seo"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
  preload: true
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: 'swap',
  preload: true
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#10b981' },
    { media: '(prefers-color-scheme: dark)', color: '#059669' }
  ]
}

export const metadata: Metadata = {
  ...generateSEOMetadata({
  title: 'Uganda\'s Premier Safari & Adventure Travel Company',
  description: 'Experience authentic Uganda with Samba Tours. Expert-guided gorilla trekking, wildlife safaris, cultural tours, and adventure travel. Book your dream African safari today!',
  keywords: [
    'Uganda tours', 'Uganda safari', 'gorilla trekking Uganda', 'wildlife safari',
    'Bwindi gorilla trekking', 'Uganda travel', 'East Africa safari', 'adventure travel Uganda',
    'Uganda tour packages', 'Murchison Falls', 'Queen Elizabeth Park', 'cultural tours Uganda',
    'Uganda travel agency', 'eco tourism Uganda', 'mountain gorilla tours', 'Uganda vacation',
    'African safari', 'primate tours', 'birding tours Uganda', 'Uganda honeymoon safari'
  ],
  images: ['/images/og-default.jpg'],
  canonical: '/'
  }),
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://sambatours.co'))
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = generateOrganizationSchema()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Domain alternates for SEO */}
        <link rel="alternate" href="https://sambatours.co" hrefLang="en" />
        <link rel="alternate" href="https://sambatours.org" hrefLang="en" />
        <link rel="canonical" href="https://sambatours.co" />
        
        {/* Additional SEO tags */}
        <meta name="application-name" content={SEO_CONFIG.siteName} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={SEO_CONFIG.siteName} />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Additional Open Graph tags */}
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content={SEO_CONFIG.siteName} />
        <meta property="business:contact_data:street_address" content={SEO_CONFIG.organization.address.streetAddress} />
        <meta property="business:contact_data:locality" content={SEO_CONFIG.organization.address.addressLocality} />
        <meta property="business:contact_data:region" content={SEO_CONFIG.organization.address.addressRegion} />
        <meta property="business:contact_data:postal_code" content={SEO_CONFIG.organization.address.postalCode} />
        <meta property="business:contact_data:country_name" content="Uganda" />
        <meta property="business:contact_data:email" content={SEO_CONFIG.organization.email} />
        <meta property="business:contact_data:phone_number" content={SEO_CONFIG.organization.phone} />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
      </head>
      
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`} style={{ margin: 0, padding: 0 }}>
        <StructuredData data={organizationSchema} />
        
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <MockAuthProvider>
            <UserAuthProvider>
              <CartProvider>
                <ConditionalLayout>{children}</ConditionalLayout>
                <Toaster />
              </CartProvider>
            </UserAuthProvider>
          </MockAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
