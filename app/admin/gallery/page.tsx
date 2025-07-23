"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Edit, Trash2, Image as ImageIcon, Search, Upload, Database, RefreshCw, AlertCircle, Video, FileImage, Play, Clock, Eye, X } from "lucide-react"
import LoadingSpinner from "@/components/ui/loading-spinner"

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
}

interface GalleryStats {
  overview: {
    totalGalleries: number
    totalImages: number
    totalVideos: number
    featuredImages: number
    featuredGalleries: number
    storageUsedMB: number
  }
  categoryStats: Array<{
    id: number
    name: string
    slug: string
    color: string
    imageCount: number
    videoCount: number
    totalCount: number
  }>
  locationStats: Array<{
    id: number
    name: string
    slug: string
    country: string | null
    region: string | null
    imageCount: number
    videoCount: number
    totalCount: number
  }>
}

interface MediaCategory {
  id: number
  name: string
  slug: string
  description: string | null
  color: string
  imageCount: number
  videoCount: number
  createdAt: string
  updatedAt: string
}

interface MediaLocation {
  id: number
  name: string
  slug: string
  description: string | null
  country: string | null
  region: string | null
  coordinates: {
    lat: number
    lng: number
  } | null
  imageCount: number
  videoCount: number
  createdAt: string
  updatedAt: string
}

interface EditImageData {
  id: number
  title: string
  alt: string
  description: string
  photographer: string
  date: string
  featured: boolean
  categoryId: number | null
  locationId: number | null
  displayOrder: number | null
  likes: number
  views: number
}

interface EditVideoData {
  id: number
  title: string
  description: string
  duration: string
  photographer: string
  featured: boolean
  categoryId: number | null
  locationId: number | null
  displayOrder: number | null
  thumbnailFile: File | null
  removeThumbnail: boolean
  likes: number
  views: number
  currentThumbnail: string | null
}

export default function AdminGalleryPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [stats, setStats] = useState<GalleryStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<{ message: string; type: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewGalleryDialog, setShowNewGalleryDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null)
  const [newGalleryData, setNewGalleryData] = useState({
    name: "",
    description: "",
    featured: false,
    thumbnail: null as File | null
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1
  })
  
  // Media management state
  const [mediaList, setMediaList] = useState<any[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [selectedMediaGallery, setSelectedMediaGallery] = useState<number | null>(null)
  const [mediaType, setMediaType] = useState<'all' | 'images' | 'videos'>('all')
  const [mediaSearchTerm, setMediaSearchTerm] = useState("")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showVideoUploadDialog, setShowVideoUploadDialog] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState({
    isUploading: false,
    progress: 0,
    currentFile: "",
    totalFiles: 0,
    completedFiles: 0
  })
  const [videoUploadData, setVideoUploadData] = useState({
    galleryId: null as number | null,
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
    title: "",
    description: "",
    duration: "",
    photographer: "",
    featured: false
  })
  const [mediaPagination, setMediaPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  })
  
  // Edit functionality state
  const [showEditImageDialog, setShowEditImageDialog] = useState(false)
  const [showEditVideoDialog, setShowEditVideoDialog] = useState(false)
  const [editImageData, setEditImageData] = useState<EditImageData | null>(null)
  const [editVideoData, setEditVideoData] = useState<EditVideoData | null>(null)
  const [categories, setCategories] = useState<MediaCategory[]>([])
  const [locations, setLocations] = useState<MediaLocation[]>([])
  const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>({})
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)
  const [editThumbnailPreview, setEditThumbnailPreview] = useState<string | null>(null)
  
  // Category and Location creation state
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)
  const [showNewLocationDialog, setShowNewLocationDialog] = useState(false)
  const [newCategoryData, setNewCategoryData] = useState({
    name: "",
    description: "",
    color: "#10B981"
  })
  const [newLocationData, setNewLocationData] = useState({
    name: "",
    description: "",
    country: "",
    region: "",
    coordinates: { lat: 0, lng: 0 }
  })
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [isCreatingLocation, setIsCreatingLocation] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    loadGalleries()
    loadStats()
    loadCategories()
    loadLocations()
  }, [searchTerm, pagination.page])

  useEffect(() => {
    loadMedia()
  }, [mediaType, mediaSearchTerm, selectedMediaGallery, mediaPagination.page])

  const loadGalleries = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await fetch(`/api/admin/gallery?${params}`)
      const data = await response.json()

      if (!response.ok) {
        handleApiError(data, response.status)
        return
      }

      setGalleries(data.galleries || [])
      setPagination({
        ...pagination,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      })
    } catch (err) {
      console.error('Error loading galleries:', err)
      handleLoadError(err, 'Failed to load galleries')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/gallery/stats')
      const data = await response.json()

      if (!response.ok) {
        handleApiError(data, response.status)
        return
      }

      setStats(data)
    } catch (err) {
      console.error('Error loading stats:', err)
      // Don't show error for stats - they're not critical
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/gallery/categories')
      const data = await response.json()

      if (response.ok) {
        setCategories(data.categories || [])
      }
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const loadLocations = async () => {
    try {
      const response = await fetch('/api/admin/gallery/locations')
      const data = await response.json()

      if (response.ok) {
        setLocations(data.locations || [])
      }
    } catch (err) {
      console.error('Error loading locations:', err)
    }
  }

  const loadMedia = async () => {
    try {
      setMediaLoading(true)
      setMediaError(null)
      
      const params = new URLSearchParams({
        page: mediaPagination.page.toString(),
        limit: mediaPagination.limit.toString(),
        mediaType: mediaType,
        ...(mediaSearchTerm && { search: mediaSearchTerm }),
        ...(selectedMediaGallery && { galleryId: selectedMediaGallery.toString() })
      })

      const response = await fetch(`/api/admin/gallery/images?${params}`)
      const data = await response.json()

      if (!response.ok) {
        setMediaError(data.error || 'Failed to load media')
        return
      }

      setMediaList(data.media || [])
      setMediaPagination({
        ...mediaPagination,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages
      })
    } catch (err) {
      console.error('Error loading media:', err)
      setMediaError('Failed to load media')
    } finally {
      setMediaLoading(false)
    }
  }

  const handleEditImage = async (imageId: number) => {
    try {
      const response = await fetch(`/api/admin/gallery/images/${imageId}`)
      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to load image data",
          variant: "destructive",
        })
        return
      }

      const image = data.image
      setEditImageData({
        id: image.id,
        title: image.title || "",
        alt: image.alt || "",
        description: image.description || "",
        photographer: image.photographer || "",
        date: image.date ? new Date(image.date).toISOString().split('T')[0] : "",
        featured: image.featured || false,
        categoryId: image.category?.id || null,
        locationId: image.location?.id || null,
        displayOrder: image.displayOrder || null,
        likes: image.likes || 0,
        views: image.views || 0
      })
      setShowEditImageDialog(true)
    } catch (err) {
      console.error('Error loading image:', err)
      toast({
        title: "Error",
        description: "Failed to load image data",
        variant: "destructive",
      })
    }
  }

  const handleEditVideo = async (videoId: number) => {
    try {
      const response = await fetch(`/api/admin/gallery/videos/${videoId}`)
      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to load video data",
          variant: "destructive",
        })
        return
      }

      const video = data.video
      setEditVideoData({
        id: video.id,
        title: video.title || "",
        description: video.description || "",
        duration: formatDuration(video.duration),
        photographer: video.photographer || "",
        featured: video.featured || false,
        categoryId: video.category?.id || null,
        locationId: video.location?.id || null,
        displayOrder: video.displayOrder || null,
        thumbnailFile: null,
        removeThumbnail: false,
        likes: video.likes || 0,
        views: video.views || 0,
        currentThumbnail: video.thumbnail ? `data:${video.thumbnail.type};base64,${video.thumbnail.data}` : null
      })
      setShowEditVideoDialog(true)
    } catch (err) {
      console.error('Error loading video:', err)
      toast({
        title: "Error",
        description: "Failed to load video data",
        variant: "destructive",
      })
    }
  }

  const handleUpdateImage = async () => {
    if (!editImageData) return

    try {
      setIsEditSubmitting(true)
      setEditFormErrors({})

      const formData = new FormData()
      formData.append('title', editImageData.title)
      formData.append('alt', editImageData.alt)
      formData.append('description', editImageData.description)
      formData.append('photographer', editImageData.photographer)
      formData.append('date', editImageData.date)
      formData.append('featured', editImageData.featured.toString())
      formData.append('likes', editImageData.likes.toString())
      formData.append('views', editImageData.views.toString())
      if (editImageData.categoryId) formData.append('categoryId', editImageData.categoryId.toString())
      if (editImageData.locationId) formData.append('locationId', editImageData.locationId.toString())
      if (editImageData.displayOrder !== null) formData.append('displayOrder', editImageData.displayOrder.toString())

      const response = await fetch(`/api/admin/gallery/images/${editImageData.id}`, {
        method: 'PUT',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to update image",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Image updated successfully",
      })

      setShowEditImageDialog(false)
      setEditImageData(null)
      loadMedia()
    } catch (err) {
      console.error('Error updating image:', err)
      toast({
        title: "Error",
        description: "Failed to update image",
        variant: "destructive",
      })
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const handleUpdateVideo = async () => {
    if (!editVideoData) return

    try {
      setIsEditSubmitting(true)
      setEditFormErrors({})

      const formData = new FormData()
      formData.append('title', editVideoData.title)
      formData.append('description', editVideoData.description)
      
      // Convert duration from MM:SS to seconds
      const durationInSeconds = parseDuration(editVideoData.duration)
      formData.append('duration', durationInSeconds.toString())
      
      formData.append('photographer', editVideoData.photographer)
      formData.append('featured', editVideoData.featured.toString())
      formData.append('removeThumbnail', editVideoData.removeThumbnail.toString())
      formData.append('likes', editVideoData.likes.toString())
      formData.append('views', editVideoData.views.toString())
      
      if (editVideoData.categoryId) formData.append('categoryId', editVideoData.categoryId.toString())
      if (editVideoData.locationId) formData.append('locationId', editVideoData.locationId.toString())
      if (editVideoData.displayOrder !== null) formData.append('displayOrder', editVideoData.displayOrder.toString())
      if (editVideoData.thumbnailFile) formData.append('thumbnail', editVideoData.thumbnailFile)

      const response = await fetch(`/api/admin/gallery/videos/${editVideoData.id}`, {
        method: 'PUT',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to update video",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Video updated successfully",
      })

      setShowEditVideoDialog(false)
      setEditVideoData(null)
      setEditThumbnailPreview(null)
      loadMedia()
    } catch (err) {
      console.error('Error updating video:', err)
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive",
      })
    } finally {
      setIsEditSubmitting(false)
    }
  }

  const parseDuration = (duration: string): number => {
    if (!duration) return 0
    if (duration.includes(':')) {
      const [mins, secs] = duration.split(':').map(Number)
      return (mins * 60) + secs
    }
    return parseInt(duration) || 0
  }

  const handleEditThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && editVideoData) {
      setEditVideoData({ ...editVideoData, thumbnailFile: file, removeThumbnail: false })
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setEditThumbnailPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetEditForm = () => {
    setEditImageData(null)
    setEditVideoData(null)
    setEditFormErrors({})
    setEditThumbnailPreview(null)
  }

  // Custom upload function with progress tracking
  const uploadWithProgress = (url: string, formData: FormData, fileName: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100
          setUploadProgress(prev => ({
            ...prev,
            progress: Math.round(percentComplete),
            currentFile: fileName
          }))
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response)
          } catch (err) {
            reject(new Error('Invalid JSON response'))
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText)
            reject(new Error(error.error || 'Upload failed'))
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.open('POST', url)
      xhr.send(formData)
    })
  }

  const handleImageUpload = async () => {
    if (!selectedMediaGallery || uploadFiles.length === 0) return

    try {
      setUploadProgress({
        isUploading: true,
        progress: 0,
        currentFile: "",
        totalFiles: uploadFiles.length,
        completedFiles: 0
      })

      const formData = new FormData()
      formData.append('galleryId', selectedMediaGallery.toString())
      
      uploadFiles.forEach(file => {
        formData.append('images', file)
      })

      const fileName = uploadFiles.length === 1 ? uploadFiles[0].name : `${uploadFiles.length} images`
      const data = await uploadWithProgress('/api/admin/gallery/images', formData, fileName)

      setUploadProgress(prev => ({
        ...prev,
        completedFiles: uploadFiles.length,
        progress: 100
      }))

      toast({
        title: "Success",
        description: `Successfully uploaded ${data.images?.length || uploadFiles.length} images`,
      })

      setShowUploadDialog(false)
      setUploadFiles([])
      setSelectedMediaGallery(null)
      loadMedia()
      loadGalleries()
    } catch (err) {
      console.error('Error uploading images:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to upload images",
        variant: "destructive",
      })
    } finally {
      setUploadProgress({
        isUploading: false,
        progress: 0,
        currentFile: "",
        totalFiles: 0,
        completedFiles: 0
      })
    }
  }

  const handleVideoUpload = async () => {
    if (!videoUploadData.galleryId || !videoUploadData.videoFile) return

    try {
      setUploadProgress({
        isUploading: true,
        progress: 0,
        currentFile: videoUploadData.videoFile.name,
        totalFiles: 1,
        completedFiles: 0
      })

      const formData = new FormData()
      formData.append('galleryId', videoUploadData.galleryId.toString())
      formData.append('video', videoUploadData.videoFile)
      
      if (videoUploadData.thumbnailFile) {
        formData.append('thumbnail', videoUploadData.thumbnailFile)
      }
      
      if (videoUploadData.title) formData.append('title', videoUploadData.title)
      if (videoUploadData.description) formData.append('description', videoUploadData.description)
      if (videoUploadData.duration) formData.append('duration', videoUploadData.duration)
      if (videoUploadData.photographer) formData.append('photographer', videoUploadData.photographer)
      formData.append('featured', videoUploadData.featured.toString())

      const data = await uploadWithProgress('/api/admin/gallery/videos', formData, videoUploadData.videoFile.name)

      setUploadProgress(prev => ({
        ...prev,
        completedFiles: 1,
        progress: 100
      }))

      toast({
        title: "Success",
        description: "Video uploaded successfully",
      })

      setShowVideoUploadDialog(false)
      setVideoUploadData({
        galleryId: null,
        videoFile: null,
        thumbnailFile: null,
        title: "",
        description: "",
        duration: "",
        photographer: "",
        featured: false
      })
      loadMedia()
      loadGalleries()
    } catch (err) {
      console.error('Error uploading video:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to upload video",
        variant: "destructive",
      })
    } finally {
      setUploadProgress({
        isUploading: false,
        progress: 0,
        currentFile: "",
        totalFiles: 0,
        completedFiles: 0
      })
    }
  }

  const handleDeleteMedia = async (mediaId: number, mediaType: string) => {
    if (!confirm(`Are you sure you want to delete this ${mediaType}?`)) return

    try {
      const endpoint = mediaType === 'image' ? 
        `/api/admin/gallery/images/${mediaId}` : 
        `/api/admin/gallery/videos/${mediaId}`

      const response = await fetch(endpoint, {
        method: 'DELETE'
      })

      if (!response.ok) {
        toast({
          title: "Error",
          description: `Failed to delete ${mediaType}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: `${mediaType} deleted successfully`,
      })

      loadMedia()
      loadGalleries()
    } catch (err) {
      console.error(`Error deleting ${mediaType}:`, err)
      toast({
        title: "Error",
        description: `Failed to delete ${mediaType}`,
        variant: "destructive",
      })
    }
  }

  const formatDuration = (duration: string | number | null): string => {
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

  const getMediaThumbnail = (media: any): string => {
    if (media.type === 'image') {
      return `data:${media.imageType};base64,${media.imageData}`
    } else if (media.type === 'video' && media.thumbnail) {
      return `data:${media.thumbnail.type};base64,${media.thumbnail.data}`
    }
    return ''
  }

  const handleApiError = (data: any, statusCode: number) => {
    const errorMessage = data.error || 'An unexpected error occurred'
    const errorType = data.type || 'UNKNOWN_ERROR'
    
    if (errorType === 'CONNECTION_ERROR') {
      setError({
        message: 'Unable to connect to the database. The database server may be offline. Please try again later.',
        type: 'CONNECTION_ERROR'
      })
    } else {
      setError({
        message: errorMessage,
        type: errorType
      })
    }
  }

  const handleLoadError = (err: any, fallbackMessage: string) => {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      setError({
        message: 'Unable to connect to the server. Please check your internet connection.',
        type: 'NETWORK_ERROR'
      })
    } else {
      setError({
        message: fallbackMessage,
        type: 'UNKNOWN_ERROR'
      })
    }
  }

  const handleRetry = () => {
    setError(null)
    loadGalleries()
    loadStats()
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!newGalleryData.name.trim()) {
      errors.name = "Gallery name is required"
    } else if (newGalleryData.name.length > 255) {
      errors.name = "Gallery name must be less than 255 characters"
    }
    
    if (newGalleryData.description && newGalleryData.description.length > 5000) {
      errors.description = "Description must be less than 5000 characters"
    }
    
    if (newGalleryData.thumbnail && newGalleryData.thumbnail.size > 10 * 1024 * 1024) {
      errors.thumbnail = "Thumbnail must be less than 10MB"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setNewGalleryData(prev => ({ ...prev, thumbnail: file }))
    
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setThumbnailPreview(null)
    }
  }

  const resetForm = () => {
    setNewGalleryData({
      name: "",
      description: "",
      featured: false,
      thumbnail: null
    })
    setFormErrors({})
    setThumbnailPreview(null)
    setIsSubmitting(false)
  }

  const handleCreateGallery = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      
      const formData = new FormData()
      formData.append('name', newGalleryData.name.trim())
      formData.append('description', newGalleryData.description.trim())
      formData.append('featured', newGalleryData.featured.toString())
      
      if (newGalleryData.thumbnail) {
        formData.append('thumbnail', newGalleryData.thumbnail)
      }

      const response = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.type === 'CONNECTION_ERROR') {
          toast({
            title: "Database Connection Error",
            description: "Unable to connect to the database. Please check if the database server is running.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to create gallery",
            variant: "destructive",
          })
        }
        return
      }

      setGalleries([data.gallery, ...galleries])
      setShowNewGalleryDialog(false)
      resetForm()
      
      toast({
        title: "Success",
        description: "Gallery created successfully",
      })
      
      // Refresh stats
      loadStats()
    } catch (err) {
      console.error('Error creating gallery:', err)
      toast({
        title: "Error",
        description: "Failed to create gallery. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteGallery = async (galleryId: number) => {
    if (!confirm('Are you sure you want to delete this gallery? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/gallery/${galleryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const data = await response.json()
        if (data.type === 'CONNECTION_ERROR') {
          toast({
            title: "Database Connection Error",
            description: "Unable to connect to the database. Please check if the database server is running.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: "Failed to delete gallery",
            variant: "destructive",
          })
        }
        return
      }

      setGalleries(galleries.filter(g => g.id !== galleryId))
      toast({
        title: "Success",
        description: "Gallery deleted successfully",
      })
      
      // Refresh stats
      loadStats()
    } catch (err) {
      console.error('Error deleting gallery:', err)
      toast({
        title: "Error",
        description: "Failed to delete gallery. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getThumbnailUrl = (gallery: Gallery): string => {
    if (!gallery.thumbnail || !gallery.thumbnail.data || !gallery.thumbnail.type) {
      return ''
    }
    return `data:${gallery.thumbnail.type};base64,${gallery.thumbnail.data}`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleCreateCategory = async () => {
    try {
      setIsCreatingCategory(true)
      
      const response = await fetch('/api/admin/gallery/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategoryData)
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to create category",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Category created successfully",
      })

      // Refresh categories and select the new one
      await loadCategories()
      setShowNewCategoryDialog(false)
      setNewCategoryData({ name: "", description: "", color: "#10B981" })
      
      // Auto-select the new category
      if (editImageData) {
        setEditImageData({ ...editImageData, categoryId: data.category.id })
      }
      if (editVideoData) {
        setEditVideoData({ ...editVideoData, categoryId: data.category.id })
      }
    } catch (err) {
      console.error('Error creating category:', err)
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      })
    } finally {
      setIsCreatingCategory(false)
    }
  }

  const handleCreateLocation = async () => {
    try {
      setIsCreatingLocation(true)
      
      const response = await fetch('/api/admin/gallery/locations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLocationData)
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to create location",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Location created successfully",
      })

      // Refresh locations and select the new one
      await loadLocations()
      setShowNewLocationDialog(false)
      setNewLocationData({ name: "", description: "", country: "", region: "", coordinates: { lat: 0, lng: 0 } })
      
      // Auto-select the new location
      if (editImageData) {
        setEditImageData({ ...editImageData, locationId: data.location.id })
      }
      if (editVideoData) {
        setEditVideoData({ ...editVideoData, locationId: data.location.id })
      }
    } catch (err) {
      console.error('Error creating location:', err)
      toast({
        title: "Error",
        description: "Failed to create location",
        variant: "destructive",
      })
    } finally {
      setIsCreatingLocation(false)
    }
  }

  // Show connection error state
  if (error?.type === 'CONNECTION_ERROR') {
  return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <Database className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-earth-900 mb-4">Database Connection Error</h2>
          <p className="text-earth-600 mb-6">{error.message}</p>
          <Button onClick={handleRetry} className="bg-orange-600 hover:bg-orange-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <p className="text-sm text-earth-500 mt-4">
            If this problem persists, please contact your system administrator.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
            <div>
          <h1 className="text-3xl font-bold text-earth-900">Gallery Management</h1>
          <p className="text-earth-600 mt-2">Manage your gallery collections and images</p>
            </div>
        <Button onClick={() => setShowNewGalleryDialog(true)} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
                New Gallery
              </Button>
      </div>

      {/* Show other types of errors */}
      {error && error.type !== 'CONNECTION_ERROR' && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {error.message}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRetry}
              className="ml-4 text-orange-600 hover:text-orange-700 hover:bg-orange-100"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="galleries" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="galleries">Galleries</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="galleries" className="space-y-6">
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search galleries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading && galleries.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-earth-600">Loading galleries...</p>
              </div>
            </div>
          ) : galleries.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ImageIcon className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No galleries found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 
                  "No galleries match your search criteria." :
                  "No galleries have been created yet."
                }
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowNewGalleryDialog(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Gallery
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleries.map((gallery) => (
                  <Card key={gallery.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-lg">{gallery.name}</CardTitle>
                          {gallery.featured && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedGallery(gallery)
                              setShowEditDialog(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGallery(gallery.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{gallery.description || 'No description'}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={getThumbnailUrl(gallery)}
                            alt={gallery.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{gallery.imageCount} images</span>
                          <span>{gallery.videoCount} videos</span>
                          <span>{formatDate(gallery.createdAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          {/* Media Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              {/* Gallery Filter */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="gallery-filter">Gallery:</Label>
                <select
                  id="gallery-filter"
                  value={selectedMediaGallery || ''}
                  onChange={(e) => setSelectedMediaGallery(e.target.value ? parseInt(e.target.value) : null)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Galleries</option>
                  {galleries.map(gallery => (
                    <option key={gallery.id} value={gallery.id}>{gallery.name}</option>
                  ))}
                </select>
              </div>

              {/* Media Type Filter */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="media-type">Type:</Label>
                <select
                  id="media-type"
                  value={mediaType}
                  onChange={(e) => setMediaType(e.target.value as 'all' | 'images' | 'videos')}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Media</option>
                  <option value="images">Images Only</option>
                  <option value="videos">Videos Only</option>
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search media..."
                  value={mediaSearchTerm}
                  onChange={(e) => setMediaSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>

            {/* Upload Buttons */}
            <div className="flex items-center space-x-2">
              <Button 
                onClick={() => setShowUploadDialog(true)}
                variant="outline"
                className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                <FileImage className="w-4 h-4 mr-2" />
                Upload Images
              </Button>
              <Button 
                onClick={() => setShowVideoUploadDialog(true)}
                variant="outline"
                className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
              >
                <Video className="w-4 h-4 mr-2" />
                Upload Video
              </Button>
            </div>
          </div>

          {/* Media Grid */}
          {mediaError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {mediaError}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={loadMedia}
                  className="ml-4 text-red-600 hover:text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {mediaLoading && mediaList.length === 0 ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <LoadingSpinner />
                <p className="mt-4 text-earth-600">Loading media...</p>
              </div>
            </div>
          ) : mediaList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {mediaType === 'videos' ? <Video className="w-16 h-16 mx-auto" /> : 
                 mediaType === 'images' ? <FileImage className="w-16 h-16 mx-auto" /> :
                 <ImageIcon className="w-16 h-16 mx-auto" />}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {mediaType === 'all' ? 'media' : mediaType} found
              </h3>
              <p className="text-gray-600 mb-4">
                {mediaSearchTerm ? 
                  `No ${mediaType === 'all' ? 'media' : mediaType} match your search criteria.` :
                  selectedMediaGallery ?
                  `No ${mediaType === 'all' ? 'media' : mediaType} in selected gallery.` :
                  `No ${mediaType === 'all' ? 'media' : mediaType} uploaded yet.`
                }
              </p>
              <div className="flex justify-center space-x-2">
                <Button onClick={() => setShowUploadDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                  <FileImage className="w-4 h-4 mr-2" />
                  Upload Images
                </Button>
                <Button onClick={() => setShowVideoUploadDialog(true)} className="bg-purple-600 hover:bg-purple-700">
                  <Video className="w-4 h-4 mr-2" />
                  Upload Video
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Media Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {mediaList.map((media) => (
                  <Card key={`${media.type}-${media.id}`} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={getMediaThumbnail(media)}
                            alt={media.title || media.alt || 'Media'}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Media Type Badge */}
                          <div className="absolute top-2 left-2">
                            <Badge 
                              variant="secondary" 
                              className={media.type === 'video' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}
                            >
                              {media.type === 'video' ? <Video className="w-3 h-3 mr-1" /> : <FileImage className="w-3 h-3 mr-1" />}
                              {media.type === 'video' ? 'Video' : 'Image'}
                            </Badge>
                          </div>

                          {/* Video Duration */}
                          {media.type === 'video' && media.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-1 py-0.5 rounded text-xs flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDuration(media.duration)}
                            </div>
                          )}

                          {/* Play Button for Videos */}
                          {media.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                              <Button
                                size="sm"
                                className="bg-white/90 text-black hover:bg-white"
                                onClick={() => window.open(media.videoUrl || `/api/admin/gallery/videos/${media.id}/stream`, '_blank')}
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="absolute top-2 right-2 flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => media.type === 'image' ? handleEditImage(media.id) : handleEditVideo(media.id)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 bg-white/90 h-6 w-6 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMedia(media.id, media.type)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-100 bg-white/90 h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Media Info */}
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {media.title || media.alt || (media.type === 'video' ? media.videoName : media.imageName) || 'Untitled'}
                          </h4>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{media.gallery?.name || 'Unknown Gallery'}</span>
                            <div className="flex items-center space-x-2">
                              <span className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {media.views || 0}
                              </span>
                              {media.featured && (
                                <Badge variant="outline" className="text-xs">Featured</Badge>
                              )}
                            </div>
                          </div>
                          {media.category && (
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ borderColor: media.category.color, color: media.category.color }}
                            >
                              {media.category.name}
                            </Badge>
                          )}
                        </div>
                      </div>
              </CardContent>
            </Card>
                ))}
              </div>

              {/* Media Pagination */}
              {mediaPagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => setMediaPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={mediaPagination.page === 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Page {mediaPagination.page} of {mediaPagination.totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => setMediaPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={mediaPagination.page === mediaPagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {stats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Galleries</span>
                    <span className="font-semibold">{stats.overview.totalGalleries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Images</span>
                    <span className="font-semibold">{stats.overview.totalImages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Videos</span>
                    <span className="font-semibold">{stats.overview.totalVideos}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Featured Items</span>
                    <span className="font-semibold">{stats.overview.featuredImages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Storage Used</span>
                    <span className="font-semibold">{stats.overview.storageUsedMB} MB</span>
                  </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.categoryStats.length === 0 ? (
                    <p className="text-gray-500 text-sm">No categories yet</p>
                  ) : (
                    stats.categoryStats.slice(0, 5).map((category) => (
                      <div key={category.id} className="flex justify-between">
                        <span className="text-gray-600">{category.name}</span>
                        <span className="font-semibold">{category.totalCount}</span>
                      </div>
                    ))
                  )}
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Locations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.locationStats.length === 0 ? (
                    <p className="text-gray-500 text-sm">No locations yet</p>
                  ) : (
                    stats.locationStats.slice(0, 5).map((location) => (
                      <div key={location.id} className="flex justify-between">
                        <span className="text-gray-600">{location.name}</span>
                        <span className="font-semibold">{location.totalCount}</span>
                      </div>
                    ))
                  )}
              </CardContent>
            </Card>
          </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">Statistics not available</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Image Dialog */}
      <Dialog 
        open={showEditImageDialog} 
        onOpenChange={(open) => {
          setShowEditImageDialog(open)
          if (!open) {
            resetEditForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editImageData && (
              <>
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="edit-image-title">Title</Label>
                  <Input
                    id="edit-image-title"
                    placeholder="Enter image title"
                    value={editImageData.title}
                    onChange={(e) => setEditImageData({ ...editImageData, title: e.target.value })}
                    disabled={isEditSubmitting}
                  />
                  </div>

                {/* Alt Text */}
                <div className="space-y-2">
                  <Label htmlFor="edit-image-alt">Alt Text</Label>
                  <Input
                    id="edit-image-alt"
                    placeholder="Enter alt text for accessibility"
                    value={editImageData.alt}
                    onChange={(e) => setEditImageData({ ...editImageData, alt: e.target.value })}
                    disabled={isEditSubmitting}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="edit-image-description">Description</Label>
                  <Textarea
                    id="edit-image-description"
                    placeholder="Enter image description"
                    value={editImageData.description}
                    onChange={(e) => setEditImageData({ ...editImageData, description: e.target.value })}
                    className="min-h-[100px]"
                    disabled={isEditSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Photographer */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-image-photographer">Photographer</Label>
                    <Input
                      id="edit-image-photographer"
                      placeholder="Enter photographer name"
                      value={editImageData.photographer}
                      onChange={(e) => setEditImageData({ ...editImageData, photographer: e.target.value })}
                      disabled={isEditSubmitting}
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-image-date">Date</Label>
                    <Input
                      id="edit-image-date"
                      type="date"
                      value={editImageData.date}
                      onChange={(e) => setEditImageData({ ...editImageData, date: e.target.value })}
                      disabled={isEditSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-image-category">Category</Label>
                    <div className="flex gap-2">
                      <select
                        id="edit-image-category"
                        value={editImageData.categoryId || ''}
                        onChange={(e) => setEditImageData({ ...editImageData, categoryId: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        disabled={isEditSubmitting}
                      >
                        <option value="">Select category...</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewCategoryDialog(true)}
                        disabled={isEditSubmitting}
                        className="px-2"
                      >
                        <Plus className="w-4 h-4" />
                </Button>
              </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-image-location">Location</Label>
                    <div className="flex gap-2">
                      <select
                        id="edit-image-location"
                        value={editImageData.locationId || ''}
                        onChange={(e) => setEditImageData({ ...editImageData, locationId: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        disabled={isEditSubmitting}
                      >
                        <option value="">Select location...</option>
                        {locations.map(location => (
                          <option key={location.id} value={location.id}>{location.name}</option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewLocationDialog(true)}
                        disabled={isEditSubmitting}
                        className="px-2"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Display Order */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-image-order">Display Order</Label>
                    <Input
                      id="edit-image-order"
                      type="number"
                      placeholder="e.g., 1, 2, 3..."
                      value={editImageData.displayOrder || ''}
                      onChange={(e) => setEditImageData({ ...editImageData, displayOrder: e.target.value ? parseInt(e.target.value) : null })}
                      disabled={isEditSubmitting}
                    />
                    <p className="text-xs text-gray-500">
                      Controls the order media appears in galleries (1 = first, 2 = second, etc.)
                    </p>
                  </div>

                  {/* Likes */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-image-likes">Likes</Label>
                    <Input
                      id="edit-image-likes"
                      type="number"
                      min="0"
                      value={editImageData.likes}
                      onChange={(e) => setEditImageData({ ...editImageData, likes: parseInt(e.target.value) || 0 })}
                      disabled={isEditSubmitting}
                    />
                  </div>

                  {/* Views */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-image-views">Views</Label>
                    <Input
                      id="edit-image-views"
                      type="number"
                      min="0"
                      value={editImageData.views}
                      onChange={(e) => setEditImageData({ ...editImageData, views: parseInt(e.target.value) || 0 })}
                      disabled={isEditSubmitting}
                    />
                  </div>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-image-featured"
                    checked={editImageData.featured}
                    onCheckedChange={(checked) => setEditImageData({ ...editImageData, featured: checked })}
                    disabled={isEditSubmitting}
                  />
                  <Label htmlFor="edit-image-featured">Featured Image</Label>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-2 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setShowEditImageDialog(false)}
                    className="flex-1"
                    disabled={isEditSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdateImage}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={isEditSubmitting}
                  >
                    {isEditSubmitting ? (
                      <>
                        <LoadingSpinner className="mr-2 h-4 w-4" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Update Image
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Video Dialog */}
      <Dialog 
        open={showEditVideoDialog} 
        onOpenChange={(open) => {
          setShowEditVideoDialog(open)
          if (!open) {
            resetEditForm()
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editVideoData && (
              <>
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="edit-video-title">Title</Label>
                  <Input
                    id="edit-video-title"
                    placeholder="Enter video title"
                    value={editVideoData.title}
                    onChange={(e) => setEditVideoData({ ...editVideoData, title: e.target.value })}
                    disabled={isEditSubmitting}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="edit-video-description">Description</Label>
                  <Textarea
                    id="edit-video-description"
                    placeholder="Enter video description"
                    value={editVideoData.description}
                    onChange={(e) => setEditVideoData({ ...editVideoData, description: e.target.value })}
                    className="min-h-[100px]"
                    disabled={isEditSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-video-duration">Duration (MM:SS)</Label>
                    <Input
                      id="edit-video-duration"
                      placeholder="5:30"
                      value={editVideoData.duration}
                      onChange={(e) => setEditVideoData({ ...editVideoData, duration: e.target.value })}
                      disabled={isEditSubmitting}
                    />
                  </div>

                  {/* Photographer */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-video-photographer">Photographer/Videographer</Label>
                    <Input
                      id="edit-video-photographer"
                      placeholder="Enter photographer name"
                      value={editVideoData.photographer}
                      onChange={(e) => setEditVideoData({ ...editVideoData, photographer: e.target.value })}
                      disabled={isEditSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-video-category">Category</Label>
                    <div className="flex gap-2">
                      <select
                        id="edit-video-category"
                        value={editVideoData.categoryId || ''}
                        onChange={(e) => setEditVideoData({ ...editVideoData, categoryId: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        disabled={isEditSubmitting}
                      >
                        <option value="">Select category...</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewCategoryDialog(true)}
                        disabled={isEditSubmitting}
                        className="px-2"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-video-location">Location</Label>
                    <div className="flex gap-2">
                      <select
                        id="edit-video-location"
                        value={editVideoData.locationId || ''}
                        onChange={(e) => setEditVideoData({ ...editVideoData, locationId: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        disabled={isEditSubmitting}
                      >
                        <option value="">Select location...</option>
                        {locations.map(location => (
                          <option key={location.id} value={location.id}>{location.name}</option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowNewLocationDialog(true)}
                        disabled={isEditSubmitting}
                        className="px-2"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {/* Display Order */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-video-order">Display Order</Label>
                    <Input
                      id="edit-video-order"
                      type="number"
                      placeholder="e.g., 1, 2, 3..."
                      value={editVideoData.displayOrder || ''}
                      onChange={(e) => setEditVideoData({ ...editVideoData, displayOrder: e.target.value ? parseInt(e.target.value) : null })}
                      disabled={isEditSubmitting}
                    />
                    <p className="text-xs text-gray-500">
                      Controls the order media appears in galleries (1 = first, 2 = second, etc.)
                    </p>
                  </div>

                  {/* Likes */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-video-likes">Likes</Label>
                    <Input
                      id="edit-video-likes"
                      type="number"
                      min="0"
                      value={editVideoData.likes}
                      onChange={(e) => setEditVideoData({ ...editVideoData, likes: parseInt(e.target.value) || 0 })}
                      disabled={isEditSubmitting}
                    />
                  </div>

                  {/* Views */}
                  <div className="space-y-2">
                    <Label htmlFor="edit-video-views">Views</Label>
                    <Input
                      id="edit-video-views"
                      type="number"
                      min="0"
                      value={editVideoData.views}
                      onChange={(e) => setEditVideoData({ ...editVideoData, views: parseInt(e.target.value) || 0 })}
                      disabled={isEditSubmitting}
                    />
                  </div>
                </div>

                {/* Current Thumbnail */}
                {editVideoData.currentThumbnail && (
                  <div className="space-y-2">
                    <Label>Current Thumbnail</Label>
                    <div className="relative w-full h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                      <img
                        src={editVideoData.currentThumbnail}
                        alt="Current thumbnail"
                      className="w-full h-full object-cover"
                    />
                      <div className="absolute top-2 left-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        Current
                      </div>
                    </div>
                  </div>
                )}

                {/* Thumbnail Update */}
                <div className="space-y-2">
                  <Label htmlFor="edit-video-thumbnail">Update Thumbnail (Optional)</Label>
                  <Input
                    id="edit-video-thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleEditThumbnailChange}
                    disabled={isEditSubmitting}
                  />
                  {editThumbnailPreview && (
                    <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden mt-2">
                      <img
                        src={editThumbnailPreview}
                        alt="New thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        New
                  </div>
                      <button
                        type="button"
                        onClick={() => {
                          setEditThumbnailPreview(null)
                          setEditVideoData({ ...editVideoData, thumbnailFile: null })
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        disabled={isEditSubmitting}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      </div>
                  )}
                    </div>

                {/* Remove Thumbnail Option */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-video-remove-thumbnail"
                    checked={editVideoData.removeThumbnail}
                    onCheckedChange={(checked) => setEditVideoData({ ...editVideoData, removeThumbnail: checked })}
                    disabled={isEditSubmitting}
                  />
                  <Label htmlFor="edit-video-remove-thumbnail">Remove Current Thumbnail</Label>
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-video-featured"
                    checked={editVideoData.featured}
                    onCheckedChange={(checked) => setEditVideoData({ ...editVideoData, featured: checked })}
                    disabled={isEditSubmitting}
                  />
                  <Label htmlFor="edit-video-featured">Featured Video</Label>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-2 pt-4">
                  <Button 
                    variant="outline"
                    onClick={() => setShowEditVideoDialog(false)}
                    className="flex-1"
                    disabled={isEditSubmitting}
                  >
                    Cancel
                      </Button>
                  <Button 
                    onClick={handleUpdateVideo}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                    disabled={isEditSubmitting}
                  >
                    {isEditSubmitting ? (
                      <>
                        <LoadingSpinner className="mr-2 h-4 w-4" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Update Video
                      </>
                    )}
                      </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Gallery Dialog */}
      <Dialog open={showNewGalleryDialog} onOpenChange={(open) => {
        setShowNewGalleryDialog(open)
        if (!open) {
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Gallery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Gallery Name */}
            <div className="space-y-2">
              <Label htmlFor="gallery-name">
                Gallery Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="gallery-name"
                placeholder="Enter gallery name"
                value={newGalleryData.name}
                onChange={(e) => setNewGalleryData(prev => ({ ...prev, name: e.target.value }))}
                className={formErrors.name ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm">{formErrors.name}</p>
              )}
              <p className="text-gray-500 text-sm">
                {newGalleryData.name.length}/255 characters
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="gallery-description">Description</Label>
              <Textarea
                id="gallery-description"
                placeholder="Enter gallery description (optional)"
                value={newGalleryData.description}
                onChange={(e) => setNewGalleryData(prev => ({ ...prev, description: e.target.value }))}
                className={`min-h-[100px] ${formErrors.description ? 'border-red-500' : ''}`}
                disabled={isSubmitting}
              />
              {formErrors.description && (
                <p className="text-red-500 text-sm">{formErrors.description}</p>
              )}
              <p className="text-gray-500 text-sm">
                {newGalleryData.description.length}/5000 characters
              </p>
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="gallery-featured"
                checked={newGalleryData.featured}
                onCheckedChange={(checked) => setNewGalleryData(prev => ({ ...prev, featured: checked }))}
                disabled={isSubmitting}
              />
              <Label htmlFor="gallery-featured">Featured Gallery</Label>
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2">
              <Label htmlFor="gallery-thumbnail">Thumbnail Image</Label>
              <Input
                id="gallery-thumbnail"
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className={formErrors.thumbnail ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {formErrors.thumbnail && (
                <p className="text-red-500 text-sm">{formErrors.thumbnail}</p>
              )}
              <p className="text-gray-500 text-sm">
                Recommended: 400x300px, max 10MB
              </p>
              
              {/* Thumbnail Preview */}
              {thumbnailPreview && (
                <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setThumbnailPreview(null)
                      setNewGalleryData(prev => ({ ...prev, thumbnail: null }))
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex space-x-2 pt-4">
              <Button 
                variant="outline"
                onClick={() => setShowNewGalleryDialog(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateGallery}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                disabled={!newGalleryData.name.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Gallery
                  </>
                )}
                      </Button>
                    </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog 
        open={showUploadDialog} 
        onOpenChange={(open) => {
          if (!uploadProgress.isUploading) {
            setShowUploadDialog(open)
          }
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Images</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="upload-gallery">Select Gallery</Label>
              <select
                id="upload-gallery"
                value={selectedMediaGallery || ''}
                onChange={(e) => setSelectedMediaGallery(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a gallery...</option>
                {galleries.map(gallery => (
                  <option key={gallery.id} value={gallery.id}>{gallery.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="upload-images">Select Images</Label>
              <Input
                id="upload-images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
              />
              {uploadFiles.length > 0 && (
                <p className="text-sm text-gray-600">
                  {uploadFiles.length} image(s) selected
                </p>
              )}
        </div>
            {/* Progress Indicator */}
            {uploadProgress.isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uploading {uploadProgress.currentFile}...</span>
                  <span className="font-medium">{uploadProgress.progress}%</span>
      </div>
                <Progress value={uploadProgress.progress} className="w-full" />
                <div className="text-xs text-gray-500 text-center">
                  {uploadProgress.completedFiles} of {uploadProgress.totalFiles} files uploaded
                </div>
              </div>
            )}

            <Button 
              onClick={handleImageUpload}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!selectedMediaGallery || uploadFiles.length === 0 || uploadProgress.isUploading}
            >
              {uploadProgress.isUploading ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video Upload Dialog */}
      <Dialog 
        open={showVideoUploadDialog} 
        onOpenChange={(open) => {
          if (!uploadProgress.isUploading) {
            setShowVideoUploadDialog(open)
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-gallery">Select Gallery</Label>
              <select
                id="video-gallery"
                value={videoUploadData.galleryId || ''}
                onChange={(e) => setVideoUploadData(prev => ({ 
                  ...prev, 
                  galleryId: e.target.value ? parseInt(e.target.value) : null 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a gallery...</option>
                {galleries.map(gallery => (
                  <option key={gallery.id} value={gallery.id}>{gallery.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="video-file">Video File</Label>
              <Input
                id="video-file"
                type="file"
                accept="video/*"
                onChange={(e) => setVideoUploadData(prev => ({ 
                  ...prev, 
                  videoFile: e.target.files?.[0] || null 
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-thumbnail">Thumbnail (Optional)</Label>
              <Input
                id="video-thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => setVideoUploadData(prev => ({ 
                  ...prev, 
                  thumbnailFile: e.target.files?.[0] || null 
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-title">Title</Label>
              <Input
                id="video-title"
                placeholder="Enter video title"
                value={videoUploadData.title}
                onChange={(e) => setVideoUploadData(prev => ({ 
                  ...prev, 
                  title: e.target.value 
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video-description">Description</Label>
              <Input
                id="video-description"
                placeholder="Enter video description"
                value={videoUploadData.description}
                onChange={(e) => setVideoUploadData(prev => ({ 
                  ...prev, 
                  description: e.target.value 
                }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="video-duration">Duration (e.g., 5:30)</Label>
                <Input
                  id="video-duration"
                  placeholder="MM:SS"
                  value={videoUploadData.duration}
                  onChange={(e) => setVideoUploadData(prev => ({ 
                    ...prev, 
                    duration: e.target.value 
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="video-photographer">Photographer</Label>
                <Input
                  id="video-photographer"
                  placeholder="Enter photographer name"
                  value={videoUploadData.photographer}
                  onChange={(e) => setVideoUploadData(prev => ({ 
                    ...prev, 
                    photographer: e.target.value 
                  }))}
                />
              </div>
            </div>



            <div className="flex items-center space-x-2">
              <Switch
                id="video-featured"
                checked={videoUploadData.featured}
                onCheckedChange={(checked) => setVideoUploadData(prev => ({ 
                  ...prev, 
                  featured: checked 
                }))}
              />
              <Label htmlFor="video-featured">Featured Video</Label>
            </div>

            {/* Progress Indicator */}
            {uploadProgress.isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uploading {uploadProgress.currentFile}...</span>
                  <span className="font-medium">{uploadProgress.progress}%</span>
                </div>
                <Progress value={uploadProgress.progress} className="w-full" />
                <div className="text-xs text-gray-500 text-center">
                  {uploadProgress.completedFiles} of {uploadProgress.totalFiles} files uploaded
                </div>
              </div>
            )}

            <Button 
              onClick={handleVideoUpload}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={!videoUploadData.galleryId || !videoUploadData.videoFile || uploadProgress.isUploading}
            >
              {uploadProgress.isUploading ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Video
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Category Dialog */}
      <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-category-name">Category Name *</Label>
              <Input
                id="new-category-name"
                placeholder="Enter category name"
                value={newCategoryData.name}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                disabled={isCreatingCategory}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-category-description">Description</Label>
              <Textarea
                id="new-category-description"
                placeholder="Enter category description (optional)"
                value={newCategoryData.description}
                onChange={(e) => setNewCategoryData({ ...newCategoryData, description: e.target.value })}
                disabled={isCreatingCategory}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-category-color">Color</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="new-category-color"
                  type="color"
                  value={newCategoryData.color}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, color: e.target.value })}
                  disabled={isCreatingCategory}
                  className="w-16 h-10"
                />
                <span className="text-sm text-gray-600">{newCategoryData.color}</span>
              </div>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button 
                variant="outline"
                onClick={() => setShowNewCategoryDialog(false)}
                className="flex-1"
                disabled={isCreatingCategory}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateCategory}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!newCategoryData.name.trim() || isCreatingCategory}
              >
                {isCreatingCategory ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Category
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Location Dialog */}
      <Dialog open={showNewLocationDialog} onOpenChange={setShowNewLocationDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Location</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-location-name">Location Name *</Label>
              <Input
                id="new-location-name"
                placeholder="Enter location name"
                value={newLocationData.name}
                onChange={(e) => setNewLocationData({ ...newLocationData, name: e.target.value })}
                disabled={isCreatingLocation}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-location-description">Description</Label>
              <Textarea
                id="new-location-description"
                placeholder="Enter location description (optional)"
                value={newLocationData.description}
                onChange={(e) => setNewLocationData({ ...newLocationData, description: e.target.value })}
                disabled={isCreatingLocation}
                className="min-h-[80px]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-location-country">Country</Label>
                <Input
                  id="new-location-country"
                  placeholder="Enter country"
                  value={newLocationData.country}
                  onChange={(e) => setNewLocationData({ ...newLocationData, country: e.target.value })}
                  disabled={isCreatingLocation}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-location-region">Region</Label>
                <Input
                  id="new-location-region"
                  placeholder="Enter region/state"
                  value={newLocationData.region}
                  onChange={(e) => setNewLocationData({ ...newLocationData, region: e.target.value })}
                  disabled={isCreatingLocation}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="new-location-lat">Latitude (Optional)</Label>
                <Input
                  id="new-location-lat"
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 0.347596"
                  value={newLocationData.coordinates.lat || ''}
                  onChange={(e) => setNewLocationData({ 
                    ...newLocationData, 
                    coordinates: { 
                      ...newLocationData.coordinates, 
                      lat: parseFloat(e.target.value) || 0 
                    }
                  })}
                  disabled={isCreatingLocation}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-location-lng">Longitude (Optional)</Label>
                <Input
                  id="new-location-lng"
                  type="number"
                  step="0.000001"
                  placeholder="e.g., 32.582520"
                  value={newLocationData.coordinates.lng || ''}
                  onChange={(e) => setNewLocationData({ 
                    ...newLocationData, 
                    coordinates: { 
                      ...newLocationData.coordinates, 
                      lng: parseFloat(e.target.value) || 0 
                    }
                  })}
                  disabled={isCreatingLocation}
                />
              </div>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button 
                variant="outline"
                onClick={() => setShowNewLocationDialog(false)}
                className="flex-1"
                disabled={isCreatingLocation}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateLocation}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={!newLocationData.name.trim() || isCreatingLocation}
              >
                {isCreatingLocation ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Location
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
