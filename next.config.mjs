/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com', port: '', pathname: '/vi/**' },
      { protocol: 'https', hostname: 'i.ytimg.com', port: '', pathname: '/vi/**' },
    ],
  },
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}

export default nextConfig
