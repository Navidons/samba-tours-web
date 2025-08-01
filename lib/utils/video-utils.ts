/**
 * Utility functions for handling video URLs and extracting video IDs
 */

export interface VideoInfo {
  provider: 'youtube' | 'vimeo' | 'other'
  videoId: string | null
  embedUrl: string | null
  thumbnailUrl: string | null
}

/**
 * Extract video information from a URL
 */
export function extractVideoInfo(url: string): VideoInfo {
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/
  
  const youtubeMatch = url.match(youtubeRegex)
  const vimeoMatch = url.match(vimeoRegex)
  
  if (youtubeMatch) {
    const videoId = youtubeMatch[1]
    return {
      provider: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
  }
  
  if (vimeoMatch) {
    const videoId = vimeoMatch[1]
    return {
      provider: 'vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      thumbnailUrl: null // Vimeo requires API call for thumbnails
    }
  }
  
  return {
    provider: 'other',
    videoId: null,
    embedUrl: null,
    thumbnailUrl: null
  }
}

/**
 * Validate if a URL is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
  const videoInfo = extractVideoInfo(url)
  return videoInfo.provider !== 'other' || url.includes('video') || url.includes('watch')
}

/**
 * Get embed URL for a video
 */
export function getEmbedUrl(url: string): string | null {
  const videoInfo = extractVideoInfo(url)
  return videoInfo.embedUrl
}

/**
 * Get thumbnail URL for a video
 */
export function getThumbnailUrl(url: string): string | null {
  const videoInfo = extractVideoInfo(url)
  return videoInfo.thumbnailUrl
}

/**
 * Get YouTube thumbnail URL with specified quality
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'maxres'): string {
  const qualityMap = {
    default: 'default.jpg',
    medium: 'mqdefault.jpg',
    high: 'hqdefault.jpg',
    standard: 'sddefault.jpg',
    maxres: 'maxresdefault.jpg'
  }
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}`
}

/**
 * Get all available YouTube thumbnail URLs for a video
 */
export function getYouTubeThumbnailUrls(videoId: string): {
  default: string
  medium: string
  high: string
  standard: string
  maxres: string
} {
  return {
    default: getYouTubeThumbnailUrl(videoId, 'default'),
    medium: getYouTubeThumbnailUrl(videoId, 'medium'),
    high: getYouTubeThumbnailUrl(videoId, 'high'),
    standard: getYouTubeThumbnailUrl(videoId, 'standard'),
    maxres: getYouTubeThumbnailUrl(videoId, 'maxres')
  }
} 