export function getEmbedUrl(url: string): string | null {
  // YouTube URL patterns
  const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`
  }

  // Vimeo URL patterns
  const vimeoRegex = /vimeo\.com\/(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`
  }

  // If it's already an embed URL, return as is
  if (url.includes("embed") || url.includes("player.vimeo.com")) {
    return url
  }

  return null
}

export function isVideoUrl(url: string): boolean {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"]
  return videoExtensions.some((ext) => url.toLowerCase().includes(ext))
}

export function getVideoProvider(url: string): string | null {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return "youtube"
  }
  if (url.includes("vimeo.com")) {
    return "vimeo"
  }
  return null
}

export function extractVideoInfo(url: string): { provider: string | null, videoId: string | null } {
  // YouTube
  const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/
  const youtubeMatch = url.match(youtubeRegex)
  if (youtubeMatch) {
    return { provider: 'youtube', videoId: youtubeMatch[1] }
  }
  // Vimeo
  const vimeoRegex = /vimeo\.com\/(\d+)/
  const vimeoMatch = url.match(vimeoRegex)
  if (vimeoMatch) {
    return { provider: 'vimeo', videoId: vimeoMatch[1] }
  }
  return { provider: null, videoId: null }
}

export function getYouTubeThumbnailUrl(videoId: string, quality: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'hqdefault'): string {
  // quality: default, mqdefault, hqdefault, sddefault, maxresdefault
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
} 