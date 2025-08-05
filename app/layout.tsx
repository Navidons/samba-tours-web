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
  title: 'Samba Tours - Uganda\'s Premier Safari & Adventure Travel Company',
  description: 'Expert-guided gorilla trekking, wildlife safaris, and cultural tours in Uganda. Discover the Pearl of Africa with Samba Tours - the authentic Uganda safari experience.',
  keywords: 'Samba Tours, Uganda safari, gorilla trekking Uganda, wildlife safari Africa, Uganda tours, African adventure travel, Bwindi gorilla trekking, Queen Elizabeth National Park, authentic Uganda experience, local Uganda tour operator, Samba Tours Uganda, Samba Tours & Travel',
  authors: [{ name: "Samba Tours" }],
  creator: "Samba Tours",
  publisher: "Samba Tours",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'development' ? 'https://sambatours.co' : 'https://sambatours.co')),
  alternates: {
    canonical: 'https://sambatours.co/',
  },
  openGraph: {
    title: 'Samba Tours - Uganda\'s Premier Safari & Adventure Travel Company',
    description: 'Expert-guided gorilla trekking, wildlife safaris, and cultural tours in Uganda. Discover the Pearl of Africa with Samba Tours - the authentic Uganda safari experience.',
    url: '/',
    siteName: 'Samba Tours',
    images: [
      {
        url: '/photos/uganda-wildlife.jpg',
        width: 1200,
        height: 630,
        alt: 'Samba Tours - Uganda Wildlife Safari',
      },
      {
        url: '/photos/giraffe-uganda-savana-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Samba Tours - Giraffes in Uganda Savannah',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Samba Tours - Uganda\'s Premier Safari & Adventure Travel Company',
    description: 'Expert-guided gorilla trekking, wildlife safaris, and cultural tours in Uganda. Discover the Pearl of Africa with Samba Tours.',
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
    google: 'your-google-verification-code', // TODO: Replace with your real code
  },
  other: {
    'brand': 'Samba Tours',
    'company': 'Samba Tours Uganda',
    'official-name': 'Samba Tours & Travel',
    'differentiation': 'Authentic Uganda safari operator, not Pamba Tours',
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
