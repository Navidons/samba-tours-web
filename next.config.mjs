/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'sambatours.co', 
      'localhost',
      'img.youtube.com',
      'i.ytimg.com',
      'youtube.com',
      'www.youtube.com',
      'via.placeholder.com'
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Increase body parser limit for file uploads
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: '50mb',
  },
  // Increase timeout for API routes
  serverRuntimeConfig: {
    maxDuration: 300, // 5 minutes
  },
  // Handle large file uploads
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      }
    }
    return config
  },
}

export default nextConfig
