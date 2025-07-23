/**
 * Utility functions for handling images safely
 */

export function getSafeImageUrl(imageUrl?: string, fallback?: string): string | null {
  if (!imageUrl) return fallback || null
  
  // Check if it's a valid URL or relative path
  try {
    // If it's already a full URL, return it
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }
    
    // If it's a relative path starting with /, it's valid
    if (imageUrl.startsWith('/')) {
      return imageUrl
    }
    
    // If it's a data URL, return it
    if (imageUrl.startsWith('data:')) {
      return imageUrl
    }
    
    // Otherwise, treat as relative path
    return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  } catch {
    return fallback || null
  }
}

export function isValidImageUrl(url?: string): boolean {
  if (!url) return false
  
  try {
    // Check if it's a valid URL
    new URL(url, 'http://localhost')
    return true
  } catch {
    // Check if it's a valid relative path
    return url.startsWith('/') || url.startsWith('./') || url.startsWith('../')
  }
}

export function getImageFallback(text?: string, width = 400, height = 300): string {
  // Use a simple placeholder service that doesn't require SVG
  return `https://via.placeholder.com/${width}x${height}/f3f4f6/9ca3af?text=${encodeURIComponent(text || 'Image')}`
}

export function createPlaceholderStyle(width?: number, height?: number) {
  return {
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    minWidth: width ? `${width}px` : 'auto',
    minHeight: height ? `${height}px` : 'auto',
    background: 'linear-gradient(135deg, #f3f4f6 0%, #d1d5db 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500',
  }
} 
