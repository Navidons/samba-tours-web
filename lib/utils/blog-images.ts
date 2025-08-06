/**
 * Utility functions for blog image handling and fallbacks
 */

// Default blog images for Uganda safari content
export const DEFAULT_BLOG_IMAGES = [
  '/photos/queen-elizabeth-national-park-uganda.jpg',
  '/photos/chimpanzee-bwindi-forest-impenetrable-park.jpg',
  '/photos/giraffe-uganda-savana-hero.jpg',
  '/photos/uganda-wildlife.jpg',
  '/photos/african-nile-hero.webp',
  '/photos/animals-hero.webp',
  '/home-hero-photos/uganda-safari-hero.jpg',
  '/tours-attractions/animals-hero.webp'
]

// Category-specific images
export const CATEGORY_IMAGES: Record<string, string[]> = {
  'wildlife': [
    '/photos/chimpanzee-bwindi-forest-impenetrable-park.jpg',
    '/photos/uganda-wildlife.jpg',
    '/photos/animals-hero.webp',
    '/tours-attractions/animals-hero.webp'
  ],
  'safari': [
    '/photos/queen-elizabeth-national-park-uganda.jpg',
    '/photos/giraffe-uganda-savana-hero.jpg',
    '/home-hero-photos/uganda-safari-hero.jpg'
  ],
  'culture': [
    '/photos/uganda-culture.jpg',
    '/photos/local-communities.jpg'
  ],
  'adventure': [
    '/photos/african-nile-hero.webp',
    '/photos/adventure-activities.jpg'
  ],
  'travel-tips': [
    '/photos/uganda-landscape.jpg',
    '/photos/travel-guide.jpg'
  ]
}

/**
 * Get a fallback image based on post content and category
 */
export function getFallbackBlogImage(
  postId: number, 
  category?: string, 
  title?: string
): string {
  // Determine category from title if not provided
  const inferredCategory = category || inferCategoryFromTitle(title || '')
  
  // Get category-specific images or fall back to default
  const categoryImages = CATEGORY_IMAGES[inferredCategory.toLowerCase()] || DEFAULT_BLOG_IMAGES
  
  // Use post ID to consistently select an image
  const imageIndex = postId % categoryImages.length
  return categoryImages[imageIndex]
}

/**
 * Infer category from blog post title
 */
function inferCategoryFromTitle(title: string): string {
  const titleLower = title.toLowerCase()
  
  if (titleLower.includes('wildlife') || titleLower.includes('animal') || 
      titleLower.includes('gorilla') || titleLower.includes('chimpanzee') ||
      titleLower.includes('elephant') || titleLower.includes('lion')) {
    return 'wildlife'
  }
  
  if (titleLower.includes('safari') || titleLower.includes('game drive') ||
      titleLower.includes('national park') || titleLower.includes('reserve')) {
    return 'safari'
  }
  
  if (titleLower.includes('culture') || titleLower.includes('local') ||
      titleLower.includes('community') || titleLower.includes('tradition')) {
    return 'culture'
  }
  
  if (titleLower.includes('adventure') || titleLower.includes('trek') ||
      titleLower.includes('hiking') || titleLower.includes('rafting')) {
    return 'adventure'
  }
  
  if (titleLower.includes('tip') || titleLower.includes('guide') ||
      titleLower.includes('plan') || titleLower.includes('prepare')) {
    return 'travel-tips'
  }
  
  return 'safari' // Default to safari
}

/**
 * Generate a placeholder image URL for blog posts without thumbnails
 */
export function generatePlaceholderImage(
  width: number = 800, 
  height: number = 400, 
  text?: string
): string {
  const encodedText = encodeURIComponent(text || 'Uganda Safari Blog')
  return `https://via.placeholder.com/${width}x${height}/10b981/ffffff?text=${encodedText}`
}

/**
 * Check if an image URL is valid and accessible
 */
export async function isImageAccessible(imageUrl: string): Promise<boolean> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Get optimized image URL with proper sizing
 */
export function getOptimizedImageUrl(
  originalUrl: string, 
  width?: number, 
  height?: number, 
  quality: number = 75
): string {
  // If it's already a data URL or external URL, return as is
  if (originalUrl.startsWith('data:') || originalUrl.startsWith('http')) {
    return originalUrl
  }
  
  // For local images, we can add Next.js optimization parameters
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  params.set('q', quality.toString())
  
  const queryString = params.toString()
  return queryString ? `${originalUrl}?${queryString}` : originalUrl
}

/**
 * Generate social media optimized image URL for sharing
 */
export function getSocialShareImage(
  originalUrl?: string, 
  title?: string
): string {
  if (originalUrl && !originalUrl.startsWith('data:')) {
    return getOptimizedImageUrl(originalUrl, 1200, 630, 80)
  }
  
  // Use first default image for social sharing
  return getOptimizedImageUrl(DEFAULT_BLOG_IMAGES[0], 1200, 630, 80)
}
