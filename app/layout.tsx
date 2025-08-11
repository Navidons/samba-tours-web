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
  title: {
    default: 'Samba Tours Uganda - Authentic Safari & Gorilla Trekking Experiences',
    template: '%s | Samba Tours Uganda'
  },
  description: 'Premier Uganda safari company offering authentic gorilla trekking, wildlife safaris, and cultural tours. Established local operator specializing in Bwindi, Queen Elizabeth & Murchison Falls. Book direct with Samba Tours Uganda.',
  keywords: [
    'Samba Tours Uganda',
    'Uganda safari company', 
    'gorilla trekking Uganda',
    'Bwindi gorilla tracking',
    'Queen Elizabeth National Park safari',
    'Murchison Falls safari',
    'authentic Uganda tours',
    'local Uganda tour operator',
    'Uganda wildlife safari',
    'Pearl of Africa tours',
    'Uganda cultural tours',
    'East Africa safari',
    'Uganda adventure travel',
    'mountain gorilla trekking',
    'Uganda primates tour'
  ].join(', '),
  authors: [{ 
    name: "Samba Tours Uganda",
    url: "https://sambatours.co"
  }],
  creator: "Samba Tours Uganda",
  publisher: "Samba Tours Uganda",
  applicationName: "Samba Tours Uganda",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sambatours.co'),
  // Do not set a site-wide canonical to the homepage; pages will define their own canonicals
  alternates: {
    languages: {
      'en-US': 'https://sambatours.co',
      'en': 'https://sambatours.co'
    }
  },
  category: 'travel',
  openGraph: {
    title: 'Samba Tours Uganda - Authentic Safari & Gorilla Trekking Experiences',
    description: 'Premier Uganda safari company offering authentic gorilla trekking, wildlife safaris, and cultural tours. Established local operator specializing in Bwindi, Queen Elizabeth & Murchison Falls.',
    url: 'https://sambatours.co',
    siteName: 'Samba Tours Uganda',
    images: [
      {
        url: 'https://sambatours.co/photos/uganda-wildlife.jpg',
        width: 1200,
        height: 630,
        alt: 'Samba Tours Uganda - Premier Wildlife Safari Company',
        type: 'image/jpeg'
      },
      {
        url: 'https://sambatours.co/photos/chimpanzee-bwindi-forest-impenetrable-park.jpg',
        width: 1200,
        height: 630,
        alt: 'Gorilla Trekking Bwindi Forest - Samba Tours Uganda',
        type: 'image/jpeg'
      },
    ],
    locale: 'en_US',
    type: 'website',
    countryName: 'Uganda',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Samba Tours Uganda - Authentic Safari & Gorilla Trekking',
    description: 'Premier Uganda safari company offering authentic gorilla trekking, wildlife safaris, and cultural tours. Book direct with local operators.',
    images: ['https://sambatours.co/photos/uganda-wildlife.jpg'],
    creator: '@sambatoursug',
    site: '@sambatoursug',
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
    google: 'google-site-verification-code', // Add your actual Google Search Console verification code
    other: {
      'msvalidate.01': 'bing-webmaster-verification-code', // Add your Bing verification code
    }
  },
  other: {
    'brand': 'Samba Tours Uganda',
    'company': 'Samba Tours Uganda Limited',
    'official-name': 'Samba Tours & Travel Uganda',
    'differentiation': 'Authentic local Uganda safari operator - NOT Pamba Tours',
    'geo.region': 'UG',
    'geo.country': 'Uganda',
    'geo.placename': 'Kampala, Uganda',
    'ICBM': '0.3476,32.5825', // Coordinates for Kampala, Uganda
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* SEO meta tags for better search engine understanding */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="slurp" content="index, follow" />
        <meta name="duckduckbot" content="index, follow" />
        <meta name="baiduspider" content="index, follow" />
        <meta name="yandexbot" content="index, follow" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <MockAuthProvider>
            <UserAuthProvider>
              <CartProvider>
                <ConditionalLayout>
                  {children}
                </ConditionalLayout>
                <Toaster />
              </CartProvider>
            </UserAuthProvider>
          </MockAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
