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
  description: 'Experience authentic Uganda with Samba Tours. Expert-guided gorilla trekking, wildlife safaris, cultural tours, and adventure travel.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://sambatours.co'))
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
      </head>
      
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`} style={{ margin: 0, padding: 0 }}>
        
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
        
        {/* WhatsApp Floating Button */}
        <a
          href="https://wa.me/256791742494"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 1000,
            backgroundColor: '#25D366',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="white"
          >
            <path d="M16 3C9.373 3 4 8.373 4 15c0 2.647.87 5.093 2.36 7.09L4 29l7.184-2.312A12.93 12.93 0 0016 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22.917c-2.13 0-4.19-.624-5.93-1.8l-.424-.267-4.27 1.375 1.4-4.16-.276-.43A9.93 9.93 0 016 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.29-7.6c-.29-.145-1.71-.844-1.974-.94-.264-.097-.456-.145-.648.146-.193.29-.744.94-.912 1.134-.168.193-.336.218-.626.073-.29-.145-1.225-.452-2.334-1.44-.863-.77-1.445-1.72-1.615-2.01-.168-.29-.018-.447.127-.592.13-.13.29-.336.435-.504.145-.168.193-.29.29-.484.097-.193.048-.363-.024-.508-.073-.145-.648-1.566-.888-2.146-.234-.563-.472-.486-.648-.495l-.553-.01c-.193 0-.508.073-.774.363-.266.29-1.016.994-1.016 2.425 0 1.43 1.04 2.81 1.186 3.005.145.193 2.05 3.13 4.97 4.267.695.3 1.236.478 1.66.612.698.222 1.334.19 1.836.115.56-.084 1.71-.698 1.953-1.372.24-.674.24-1.252.168-1.372-.07-.12-.264-.193-.553-.338z"/>
          </svg>
        </a>
      </body>
    </html>
  )
}
