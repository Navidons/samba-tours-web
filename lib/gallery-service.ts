interface GalleryImage {
  id: number
  galleryId?: number
  gallery?: {
    id: number
    name: string
    slug: string
  }
  imageData: string
  imageName: string | null
  imageType: string | null
  imageSize: number | null
  alt: string | null
  title: string | null
  description: string | null
  photographer: string | null
  date: string | null
  featured: boolean
  category?: {
    id: number
    name: string
    slug: string
    color: string
  } | null
  location?: {
    id: number
    name: string
    slug: string
    country: string | null
    region: string | null
  } | null
  likes: number
  views: number
  displayOrder: number
  createdAt: string
  updatedAt?: string
}

interface GalleryVideo {
  id: number
  galleryId?: number
  gallery?: {
    id: number
    name: string
    slug: string
  }
  title: string | null
  description: string | null
  duration: string | null
  videoName: string | null
  videoType: string | null
  videoSize: number | null
  photographer: string | null
  date: string | null
  featured: boolean
  category?: {
    id: number
    name: string
    slug: string
    color: string
  } | null
  location?: {
    id: number
    name: string
    slug: string
    country: string | null
    region: string | null
  } | null
  likes: number
  views: number
  displayOrder: number
  createdAt: string
  updatedAt?: string
  thumbnail: {
    data: string
    name: string | null
    type: string | null
  } | null
  videoUrl: string
}

interface Gallery {
  id: number
  name: string
  slug: string
  description: string | null
  featured: boolean
  thumbnail: {
    data: string
    name: string | null
    type: string | null
  } | null
  imageCount: number
  videoCount: number
  createdAt: string
  updatedAt: string
  images?: GalleryImage[]
  videos?: GalleryVideo[]
}

interface GalleryFilters {
  category?: string
  location?: string
  featured?: boolean
  search?: string
  page?: number
  limit?: number
  mediaType?: 'images' | 'videos' | 'all'
}

interface GalleryResponse {
  galleries?: Gallery[]
  images?: GalleryImage[]
  videos?: GalleryVideo[]
  media?: (GalleryImage | GalleryVideo)[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
    totalImages?: number
    totalVideos?: number
  }
  success: boolean
  error?: string
  type?: string
}

interface GalleryCategory {
  id: number
  name: string
  slug: string
  description: string | null
  color: string
  imageCount: number
  videoCount: number
}

interface GalleryLocation {
  id: number
  name: string
  slug: string
  description: string | null
  country: string | null
  region: string | null
  coordinates?: {
    lat: number
    lng: number
  } | null
  imageCount: number
  videoCount: number
}

// Custom error types
export class GalleryServiceError extends Error {
  public type: string
  public statusCode: number

  constructor(message: string, type: string = 'UNKNOWN_ERROR', statusCode: number = 500) {
    super(message)
    this.name = 'GalleryServiceError'
    this.type = type
    this.statusCode = statusCode
  }
}

export class DatabaseConnectionError extends GalleryServiceError {
  constructor(message: string = 'Database connection failed. Please check if the database server is running.') {
    super(message, 'CONNECTION_ERROR', 503)
  }
}

class GalleryService {
  // Get all galleries with optional filtering
  async getGalleries(filters: GalleryFilters = {}): Promise<GalleryResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters.category) params.append('category', filters.category)
      if (filters.location) params.append('location', filters.location)
      if (filters.featured !== undefined) params.append('featured', filters.featured.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/gallery?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        this.handleApiError(data, response.status)
      }
      
      // Return empty results if no galleries found (not an error)
      return {
        galleries: data.galleries || [],
        pagination: data.pagination || { total: 0, page: 1, pageSize: 20, totalPages: 0 },
        success: true
      }
    } catch (error) {
      if (error instanceof GalleryServiceError) {
        throw error
      }
      throw new GalleryServiceError('Failed to fetch galleries')
    }
  }

  // Get all gallery images with optional filtering
  async getGalleryImages(filters: GalleryFilters = {}): Promise<GalleryResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters.category) params.append('category', filters.category)
      if (filters.location) params.append('location', filters.location)
      if (filters.featured !== undefined) params.append('featured', filters.featured.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/gallery/images?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        this.handleApiError(data, response.status)
      }
      
      // Return empty results if no images found (not an error)
      return {
        images: data.images || [],
        pagination: data.pagination || { total: 0, page: 1, pageSize: 20, totalPages: 0 },
        success: true
      }
    } catch (error) {
      if (error instanceof GalleryServiceError) {
        throw error
      }
      throw new GalleryServiceError('Failed to fetch gallery images')
    }
  }

  // Get all gallery videos with optional filtering
  async getGalleryVideos(filters: GalleryFilters = {}): Promise<GalleryResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters.category) params.append('category', filters.category)
      if (filters.location) params.append('location', filters.location)
      if (filters.featured !== undefined) params.append('featured', filters.featured.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/gallery/videos?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        this.handleApiError(data, response.status)
      }
      
      // Return empty results if no videos found (not an error)
      return {
        videos: data.videos || [],
        pagination: data.pagination || { total: 0, page: 1, pageSize: 20, totalPages: 0 },
        success: true
      }
    } catch (error) {
      if (error instanceof GalleryServiceError) {
        throw error
      }
      throw new GalleryServiceError('Failed to fetch gallery videos')
    }
  }

  // Get mixed media (images and videos) with optional filtering
  async getGalleryMedia(filters: GalleryFilters = {}): Promise<GalleryResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters.category) params.append('category', filters.category)
      if (filters.location) params.append('location', filters.location)
      if (filters.featured !== undefined) params.append('featured', filters.featured.toString())
      if (filters.search) params.append('search', filters.search)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      if (filters.mediaType) params.append('mediaType', filters.mediaType)

      const response = await fetch(`/api/admin/gallery/images?${params}`)
      const data = await response.json()
      
      if (!response.ok) {
        this.handleApiError(data, response.status)
      }
      
      return {
        images: data.images || [],
        videos: data.videos || [],
        media: data.media || [],
        pagination: data.pagination || { total: 0, page: 1, pageSize: 20, totalPages: 0 },
        success: true
      }
    } catch (error) {
      if (error instanceof GalleryServiceError) {
        throw error
      }
      throw new GalleryServiceError('Failed to fetch gallery media')
    }
  }

  // Get gallery categories
  async getCategories(): Promise<GalleryCategory[]> {
    try {
      const response = await fetch('/api/gallery/categories')
      const data = await response.json()
      
      if (!response.ok) {
        this.handleApiError(data, response.status)
      }
      
      return data.categories || []
    } catch (error) {
      if (error instanceof GalleryServiceError) {
        throw error
      }
      // Return empty array for categories if fetch fails - not critical
      console.warn('Failed to fetch gallery categories:', error)
      return []
    }
  }

  // Get gallery locations
  async getLocations(): Promise<GalleryLocation[]> {
    try {
      const response = await fetch('/api/gallery/locations')
      const data = await response.json()
      
      if (!response.ok) {
        this.handleApiError(data, response.status)
      }
      
      return data.locations || []
    } catch (error) {
      if (error instanceof GalleryServiceError) {
        throw error
      }
      // Return empty array for locations if fetch fails - not critical
      console.warn('Failed to fetch gallery locations:', error)
      return []
    }
  }

  // Handle API errors consistently
  private handleApiError(data: any, statusCode: number): never {
    const errorMessage = data.error || 'An unexpected error occurred'
    const errorType = data.type || 'UNKNOWN_ERROR'
    
    if (errorType === 'CONNECTION_ERROR') {
      throw new DatabaseConnectionError(errorMessage)
    }
    
    throw new GalleryServiceError(errorMessage, errorType, statusCode)
  }

  // Convert image data to URL for display
  getImageUrl(image: GalleryImage): string {
    if (!image.imageData || !image.imageType) {
      return ''
    }
    return `data:${image.imageType};base64,${image.imageData}`
  }

  // Get thumbnail URL for gallery
  getThumbnailUrl(gallery: Gallery): string {
    if (!gallery.thumbnail || !gallery.thumbnail.data || !gallery.thumbnail.type) {
      return ''
    }
    return `data:${gallery.thumbnail.type};base64,${gallery.thumbnail.data}`
  }

  // Get video thumbnail URL
  getVideoThumbnailUrl(video: GalleryVideo): string {
    if (!video.thumbnail || !video.thumbnail.data || !video.thumbnail.type) {
      return ''
    }
    return `data:${video.thumbnail.type};base64,${video.thumbnail.data}`
  }

  // Track image view
  async trackImageView(imageId: number): Promise<void> {
    try {
      const visitorId = this.getVisitorId()
      await fetch(`/api/gallery/${imageId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${visitorId}`
        }
      })
    } catch (error) {
      console.error('Failed to track image view:', error)
    }
  }

  // Track video view
  async trackVideoView(videoId: number): Promise<void> {
    try {
      const visitorId = this.getVisitorId()
      await fetch(`/api/gallery/videos/${videoId}/view`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${visitorId}`
        }
      })
    } catch (error) {
      console.error('Failed to track video view:', error)
    }
  }

  // Like/unlike image
  async toggleImageLike(imageId: number): Promise<{ liked: boolean; likes: number }> {
    const visitorId = this.getVisitorId()
    const response = await fetch(`/api/gallery/${imageId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${visitorId}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to toggle image like')
    }
    
    return response.json()
  }

  // Like/unlike video
  async toggleVideoLike(videoId: number): Promise<{ liked: boolean; likes: number }> {
    const visitorId = this.getVisitorId()
    const response = await fetch(`/api/gallery/videos/${videoId}/like`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${visitorId}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to toggle video like')
    }
    
    return response.json()
  }

  // Get visitor ID
  private getVisitorId(): string {
    if (typeof window === 'undefined') {
      return `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    // Try to get from localStorage first
    let visitorId = localStorage.getItem('visitor_id')
    
    if (!visitorId) {
      // Try to get from cookies
      visitorId = this.getCookie('visitor_id')
    }
    
    if (!visitorId) {
      // Generate new visitor ID
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Store in localStorage and cookies
      localStorage.setItem('visitor_id', visitorId)
      this.setCookie('visitor_id', visitorId, 365)
    }
    
    return visitorId
  }

  // Cookie utilities
  private setCookie(name: string, value: string, days: number): void {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + "="
    const ca = document.cookie.split(';')
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) === ' ') c = c.substring(1, c.length)
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
    }
    return null
  }

  // Get images for lightbox/carousel
  transformForLightbox(images: GalleryImage[]) {
    return images.map(image => ({
      id: image.id,
      src: this.getImageUrl(image),
      alt: image.alt || image.title || 'Gallery Image',
      title: image.title || '',
      description: image.description || '',
      category: image.category?.name || '',
      location: image.location?.name || '',
      photographer: image.photographer || '',
      date: image.date || '',
      likes: image.likes,
      views: image.views,
      aspectRatio: this.calculateAspectRatio(image)
    }))
  }

  // Calculate aspect ratio for grid layout
  private calculateAspectRatio(image: GalleryImage): string {
    // Default aspect ratio if no size info
    return "4:3"
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Format date
  formatDate(date: string | null): string {
    if (!date) return ''
    return new Date(date).toLocaleDateString()
  }

  // Format duration for videos
  formatDuration(duration: string | number | null): string {
    if (!duration) return '0:00'
    
    // If it's a string and already formatted (MM:SS), return as is
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration
    }
    
    // Convert to number (either from string or if already number)
    const seconds = typeof duration === 'string' ? parseInt(duration) : duration
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Get category color
  getCategoryColor(category: GalleryCategory | null): string {
    return category?.color || '#10B981'
  }

  // Group images by category
  groupImagesByCategory(images: GalleryImage[]): Record<string, GalleryImage[]> {
    return images.reduce((groups, image) => {
      const categoryName = image.category?.name || 'Uncategorized'
      if (!groups[categoryName]) {
        groups[categoryName] = []
      }
      groups[categoryName].push(image)
      return groups
    }, {} as Record<string, GalleryImage[]>)
  }

  // Group videos by category
  groupVideosByCategory(videos: GalleryVideo[]): Record<string, GalleryVideo[]> {
    return videos.reduce((groups, video) => {
      const categoryName = video.category?.name || 'Uncategorized'
      if (!groups[categoryName]) {
        groups[categoryName] = []
      }
      groups[categoryName].push(video)
      return groups
    }, {} as Record<string, GalleryVideo[]>)
  }

  // Group images by location
  groupImagesByLocation(images: GalleryImage[]): Record<string, GalleryImage[]> {
    return images.reduce((groups, image) => {
      const locationName = image.location?.name || 'Unknown Location'
      if (!groups[locationName]) {
        groups[locationName] = []
      }
      groups[locationName].push(image)
      return groups
    }, {} as Record<string, GalleryImage[]>)
  }

  // Group videos by location
  groupVideosByLocation(videos: GalleryVideo[]): Record<string, GalleryVideo[]> {
    return videos.reduce((groups, video) => {
      const locationName = video.location?.name || 'Unknown Location'
      if (!groups[locationName]) {
        groups[locationName] = []
      }
      groups[locationName].push(video)
      return groups
    }, {} as Record<string, GalleryVideo[]>)
  }

  // Search images
  searchImages(images: GalleryImage[], query: string): GalleryImage[] {
    const searchTerm = query.toLowerCase()
    return images.filter(image =>
      image.title?.toLowerCase().includes(searchTerm) ||
      image.description?.toLowerCase().includes(searchTerm) ||
      image.alt?.toLowerCase().includes(searchTerm) ||
      image.photographer?.toLowerCase().includes(searchTerm) ||
      image.category?.name.toLowerCase().includes(searchTerm) ||
      image.location?.name.toLowerCase().includes(searchTerm)
    )
  }

  // Search videos
  searchVideos(videos: GalleryVideo[], query: string): GalleryVideo[] {
    const searchTerm = query.toLowerCase()
    return videos.filter(video =>
      video.title?.toLowerCase().includes(searchTerm) ||
      video.description?.toLowerCase().includes(searchTerm) ||
      video.photographer?.toLowerCase().includes(searchTerm) ||
      video.category?.name.toLowerCase().includes(searchTerm) ||
      video.location?.name.toLowerCase().includes(searchTerm)
    )
  }

  // Filter images by criteria
  filterImages(images: GalleryImage[], filters: {
    category?: string
    location?: string
    featured?: boolean
    photographer?: string
  }): GalleryImage[] {
    return images.filter(image => {
      if (filters.category && image.category?.slug !== filters.category) {
        return false
      }
      if (filters.location && image.location?.slug !== filters.location) {
        return false
      }
      if (filters.featured !== undefined && image.featured !== filters.featured) {
        return false
      }
      if (filters.photographer && image.photographer !== filters.photographer) {
        return false
      }
      return true
    })
  }

  // Filter videos by criteria
  filterVideos(videos: GalleryVideo[], filters: {
    category?: string
    location?: string
    featured?: boolean
    photographer?: string
  }): GalleryVideo[] {
    return videos.filter(video => {
      if (filters.category && video.category?.slug !== filters.category) {
        return false
      }
      if (filters.location && video.location?.slug !== filters.location) {
        return false
      }
      if (filters.featured !== undefined && video.featured !== filters.featured) {
        return false
      }
      if (filters.photographer && video.photographer !== filters.photographer) {
        return false
      }
      return true
    })
  }

  // Sort images
  sortImages(images: GalleryImage[], sortBy: 'date' | 'likes' | 'views' | 'title' | 'order', direction: 'asc' | 'desc' = 'desc'): GalleryImage[] {
    return [...images].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'likes':
          comparison = a.likes - b.likes
          break
        case 'views':
          comparison = a.views - b.views
          break
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '')
          break
        case 'order':
          comparison = a.displayOrder - b.displayOrder
          break
      }
      
      return direction === 'desc' ? -comparison : comparison
    })
  }

  // Sort videos
  sortVideos(videos: GalleryVideo[], sortBy: 'date' | 'likes' | 'views' | 'title' | 'order', direction: 'asc' | 'desc' = 'desc'): GalleryVideo[] {
    return [...videos].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'likes':
          comparison = a.likes - b.likes
          break
        case 'views':
          comparison = a.views - b.views
          break
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '')
          break
        case 'order':
          comparison = a.displayOrder - b.displayOrder
          break
      }
      
      return direction === 'desc' ? -comparison : comparison
    })
  }
}

// Export singleton instance
export const galleryService = new GalleryService()

// Export types
export type {
  GalleryImage,
  GalleryVideo,
  Gallery,
  GalleryFilters,
  GalleryResponse,
  GalleryCategory,
  GalleryLocation
} 
