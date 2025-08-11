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
  featured: boolean
  views: number
  createdAt: string
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
  duration: number | null
  featured: boolean
  views: number
  createdAt: string
  thumbnail: {
    data: string
    name: string | null
    type: string | null
  } | null
  videoUrl: string
  videoProvider: string | null
  videoId: string | null
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
    // Always prefer streaming endpoint by id to avoid large payloads
    return `/api/gallery/images/${image.id}`
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

  // Transform images for lightbox
  transformForLightbox(images: GalleryImage[]) {
    return images.map(image => ({
      src: this.getImageUrl(image),
      alt: image.alt || image.title || 'Gallery Image',
      title: image.title || '',
      description: image.description || '',
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

  // Search images
  searchImages(images: GalleryImage[], query: string): GalleryImage[] {
    const searchTerm = query.toLowerCase()
    return images.filter(image =>
      image.title?.toLowerCase().includes(searchTerm) ||
      image.description?.toLowerCase().includes(searchTerm) ||
      image.alt?.toLowerCase().includes(searchTerm)
    )
  }

  // Search videos
  searchVideos(videos: GalleryVideo[], query: string): GalleryVideo[] {
    const searchTerm = query.toLowerCase()
    return videos.filter(video =>
      video.title?.toLowerCase().includes(searchTerm) ||
      video.description?.toLowerCase().includes(searchTerm)
    )
  }

  // Filter images
  filterImages(images: GalleryImage[], filters: {
    featured?: boolean
  }): GalleryImage[] {
    return images.filter(image => {
      if (filters.featured !== undefined && image.featured !== filters.featured) {
        return false
      }
      return true
    })
  }

  // Filter videos
  filterVideos(videos: GalleryVideo[], filters: {
    featured?: boolean
  }): GalleryVideo[] {
    return videos.filter(video => {
      if (filters.featured !== undefined && video.featured !== filters.featured) {
        return false
      }
      return true
    })
  }

  // Sort images
  sortImages(images: GalleryImage[], sortBy: 'date' | 'views' | 'title', direction: 'asc' | 'desc' = 'desc'): GalleryImage[] {
    return [...images].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'views':
          comparison = (a.views || 0) - (b.views || 0)
          break
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '')
          break
      }
      
      return direction === 'asc' ? comparison : -comparison
    })
  }

  // Sort videos
  sortVideos(videos: GalleryVideo[], sortBy: 'date' | 'views' | 'title', direction: 'asc' | 'desc' = 'desc'): GalleryVideo[] {
    return [...videos].sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'views':
          comparison = (a.views || 0) - (b.views || 0)
          break
        case 'title':
          comparison = (a.title || '').localeCompare(b.title || '')
          break
      }
      
      return direction === 'asc' ? comparison : -comparison
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
  GalleryResponse
} 
