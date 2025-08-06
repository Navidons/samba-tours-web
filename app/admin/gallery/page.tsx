"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Image as ImageIcon, Video, X, Trash2, Eye, Plus, FolderPlus, Folder, ArrowLeft, Settings } from "lucide-react"
import LoadingSpinner from "@/components/ui/loading-spinner"
import Image from "next/image"
import ErrorBoundary from "@/components/ui/error-boundary"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { formatNumber } from "@/lib/utils/number-formatting"

interface Gallery {
  id: number
  name: string
  slug: string
  description: string | null
  featured: boolean
  imageCount: number
  videoCount: number
  createdAt: string
  updatedAt: string
}

interface MediaItem {
    id: number
  type: 'image' | 'video'
  title: string
  description?: string
  alt?: string
  featured: boolean
  views: number
  createdAt: string
  gallery?: {
  id: number
  name: string
  }
  // Image specific
  imageData?: string
  imageType?: string
  imageName?: string
  // Video specific
  videoUrl?: string
  videoProvider?: string
  videoId?: string
}

interface UploadProgress {
  isUploading: boolean
  progress: number
  currentFile: string
  totalFiles: number
  completedFiles: number
}

// Validation constants
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

export default function AdminGalleryPage() {
  // State management
  const [view, setView] = useState<'galleries' | 'media'>('galleries')
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images')
  
  // Gallery state
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [selectedGallery, setSelectedGallery] = useState<Gallery | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Media state
  const [mediaList, setMediaList] = useState<MediaItem[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  
  // Upload state
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    isUploading: false,
    progress: 0,
    currentFile: '',
    totalFiles: 0,
    completedFiles: 0
  })
  
  // Form state
  const [newGalleryData, setNewGalleryData] = useState({
    name: '',
    description: '',
    featured: false
  })
  const [showCreateGallery, setShowCreateGallery] = useState(false)
  const [isCreatingGallery, setIsCreatingGallery] = useState(false)
  
  // Video form state
  const [videoData, setVideoData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    videoProvider: 'youtube',
    duration: ''
  })
  const [videoUploading, setVideoUploading] = useState(false)
  
  const { toast } = useToast()

  // File validation
  const validateFiles = (files: File[]) => {
    const valid: File[] = []
    const invalid: { file: File; error: string }[] = []

    files.forEach((file) => {
      // Check file type
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        invalid.push({
          file,
          error: `Invalid file type: ${file.type}. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`
        })
        return
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        invalid.push({
          file,
          error: `File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB`
        })
        return
      }

      // Check if file is empty
      if (file.size === 0) {
        invalid.push({
          file,
          error: 'File is empty'
        })
        return
      }

      valid.push(file)
    })

    return { valid, invalid }
  }

  // Handle file selection with validation
  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const { valid, invalid } = validateFiles(files)

    // Show errors for invalid files
    if (invalid.length > 0) {
      const errorMessages = invalid.map(item => `${item.file.name}: ${item.error}`).join('\n')
      toast({
        title: "Invalid Files",
        description: errorMessages,
        variant: "destructive",
      })
    }

    // Set only valid files
    setUploadFiles(valid)

    // Clear the input to allow selecting the same file again
    event.target.value = ''
  }

  // Load galleries
  const loadGalleries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/admin/gallery')
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to load galleries')
        return
      }

      setGalleries(data.galleries || [])
    } catch (err) {
      console.error('Error loading galleries:', err)
      setError('Failed to load galleries')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load media for selected gallery
  const loadMedia = useCallback(async () => {
    if (!selectedGallery) return
    
    try {
      setMediaLoading(true)
      
      const params = new URLSearchParams({
        galleryId: selectedGallery.id.toString()
      })

      const response = await fetch(`/api/admin/gallery/images?${params}`)
      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || 'Failed to load media',
          variant: "destructive",
        })
        return
      }

      setMediaList(data.media || [])
    } catch (err) {
      console.error('Error loading media:', err)
      toast({
        title: "Error",
        description: 'Failed to load media',
        variant: "destructive",
      })
    } finally {
      setMediaLoading(false)
    }
  }, [selectedGallery, toast])

  // Select gallery and switch to media view
  const selectGallery = (gallery: Gallery) => {
    setSelectedGallery(gallery)
    setView('media')
    // Reset to images tab when selecting a new gallery
    setActiveTab('images')
  }

  // Go back to galleries view
  const goBackToGalleries = () => {
    setView('galleries')
    setSelectedGallery(null)
    setMediaList([])
  }

  // Create new gallery
  const createGallery = async () => {
    if (!newGalleryData.name.trim()) {
        toast({
          title: "Error",
        description: "Gallery name is required",
          variant: "destructive",
        })
        return
      }

    try {
      setIsCreatingGallery(true)

      const formData = new FormData()
      formData.append('name', newGalleryData.name.trim())
      formData.append('description', newGalleryData.description.trim())
      formData.append('featured', newGalleryData.featured.toString())

      const response = await fetch('/api/admin/gallery', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || 'Failed to create gallery',
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Gallery created successfully",
      })

      // Reset form and close dialog
      setNewGalleryData({ name: '', description: '', featured: false })
      setShowCreateGallery(false)
      
      // Refresh galleries list
      await loadGalleries()
      
    } catch (err) {
      console.error('Error creating gallery:', err)
      toast({
        title: "Error",
        description: "Failed to create gallery",
        variant: "destructive",
      })
    } finally {
      setIsCreatingGallery(false)
    }
  }

  // Handle image upload with better error handling
  const handleImageUpload = async () => {
    if (!selectedGallery || uploadFiles.length === 0) return

    try {
      // Show initial upload state
      setUploadProgress({
        isUploading: true,
        progress: 10,
        currentFile: `Preparing ${uploadFiles.length} file${uploadFiles.length > 1 ? 's' : ''}...`,
        totalFiles: uploadFiles.length,
        completedFiles: 0
      })

      const formData = new FormData()
      formData.append('galleryId', selectedGallery.id.toString())
      
      uploadFiles.forEach((file, index) => {
        formData.append('images', file)
        console.log(`📁 Added to upload queue: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      })

      // Update progress during upload
      setUploadProgress(prev => ({
        ...prev,
        progress: 30,
        currentFile: 'Uploading files...'
      }))

      const response = await fetch('/api/admin/gallery/images', {
        method: 'POST',
        body: formData,
      })

      // Update progress after response
      setUploadProgress(prev => ({
        ...prev,
        progress: 80,
        currentFile: 'Processing uploaded files...'
      }))

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Upload Failed",
          description: data.error || 'Failed to upload images',
          variant: "destructive",
        })
        return
      }

      // Show results with enhanced feedback (API returns 'images' as uploaded)
      const { images: uploaded, failed } = data
      
      if (uploaded.length > 0) {
        toast({
          title: "🎉 Upload Successful!",
          description: `Successfully uploaded ${uploaded.length} image${uploaded.length > 1 ? 's' : ''}. ${uploaded.length > 1 ? 'Images are' : 'Image is'} now visible in your gallery.`,
          duration: 5000,
        })
      }

      if (failed.length > 0) {
        const failedNames = failed.map((f: any) => f.name).join(', ')
        toast({
          title: "⚠️ Some uploads failed",
          description: `Failed to upload: ${failedNames}`,
          variant: "destructive",
          duration: 6000,
        })
      }

      // Clear files and refresh media
      setUploadFiles([])
      
      // Update progress to completion
      setUploadProgress(prev => ({
        ...prev,
        progress: 95,
        currentFile: 'Refreshing gallery...'
      }))

      // Force refresh media list to show new images
      console.log('🔄 Refreshing gallery after upload...')
      await Promise.all([
        loadMedia(),
        loadGalleries() // Refresh gallery counts
      ])
      
      // Complete progress
      setUploadProgress(prev => ({
        ...prev,
        progress: 100,
        currentFile: 'Upload complete!'
      }))
      
      console.log(`✅ Gallery refreshed. New images are now visible!`)
      
      // Show completion for a moment before resetting
      setTimeout(() => {
        setUploadProgress({
          isUploading: false,
          progress: 0,
          currentFile: '',
          totalFiles: 0,
          completedFiles: 0
        })
      }, 1000)

    } catch (err) {
      console.error('Error uploading images:', err)
      toast({
        title: "Upload Error",
        description: "An error occurred during upload",
        variant: "destructive",
      })
    } finally {
      // Progress reset is now handled in success case with timeout
      // Only reset immediately on error
      if (uploadProgress.progress < 100) {
      setUploadProgress({
        isUploading: false,
        progress: 0,
          currentFile: '',
        totalFiles: 0,
        completedFiles: 0
      })
      }
    }
  }

  // Handle video upload
  const handleVideoUpload = async () => {
    if (!selectedGallery || !videoData.videoUrl.trim()) {
      toast({
        title: "Error",
        description: "Gallery and video URL are required",
        variant: "destructive",
      })
      return
    }

    try {
      setVideoUploading(true)

      const formData = new FormData()
      formData.append('galleryId', selectedGallery.id.toString())
      formData.append('videoUrl', videoData.videoUrl.trim())
      formData.append('videoProvider', videoData.videoProvider)
      if (videoData.title.trim()) formData.append('title', videoData.title.trim())
      if (videoData.description.trim()) formData.append('description', videoData.description.trim())
      if (videoData.duration.trim()) formData.append('duration', videoData.duration.trim())

      const response = await fetch('/api/admin/gallery/videos', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
      toast({
          title: "Error",
          description: data.error || 'Failed to add video',
          variant: "destructive",
        })
        return
      }

      toast({
        title: "🎬 Video Added Successfully!",
        description: "Your video has been added to the gallery and is now visible.",
        duration: 5000,
      })

      // Reset form and refresh
      setVideoData({
        title: '',
        description: '',
        videoUrl: '',
        videoProvider: 'youtube',
        duration: ''
      })
      
      // Stay on current tab (videos) instead of switching
      console.log('🔄 Refreshing gallery after video upload...')
      await Promise.all([
        loadMedia(),
      loadGalleries()
      ])
      
      console.log(`✅ Gallery refreshed with new video`)

    } catch (err) {
      console.error('Error adding video:', err)
      toast({
        title: "Error",
        description: "Failed to add video",
        variant: "destructive",
      })
    } finally {
      setVideoUploading(false)
    }
  }

  // Delete media item
  const handleDeleteMedia = async (mediaId: number, type: 'image' | 'video') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return

    try {
      const endpoint = type === 'image' 
        ? `/api/admin/gallery/images/${mediaId}`
        : `/api/admin/gallery/videos/${mediaId}`

      const response = await fetch(endpoint, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || `Failed to delete ${type}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: `${type} deleted successfully`,
      })

      // Stay on current tab and refresh
      await loadMedia()
      await loadGalleries()

    } catch (err) {
      console.error(`Error deleting ${type}:`, err)
      toast({
        title: "Error",
        description: `Failed to delete ${type}`,
        variant: "destructive",
      })
    }
  }

  // Get media thumbnail with fallback handling
  const getMediaThumbnail = (media: MediaItem) => {
    if (media.type === 'image') {
      return `/api/admin/gallery/images/${media.id}`
    } else {
      // For videos, use provider thumbnail or default
      if (media.videoProvider === 'youtube' && media.videoId) {
      return `https://img.youtube.com/vi/${media.videoId}/mqdefault.jpg`
    }
      return '/placeholder-video.jpg'
    }
  }

  // Handle image load errors
  const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    // Set a fallback placeholder
    img.src = '/api/placeholder/400/300?text=Image+Not+Available'
  }

  // Handle video thumbnail errors
  const handleVideoThumbnailError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget
    // Set a fallback placeholder for videos
    img.src = '/api/placeholder/400/300?text=Video+Thumbnail+Not+Available'
  }

  // Filter media by current tab
  const getFilteredMedia = () => {
    return mediaList.filter(media => media.type === activeTab.slice(0, -1) as 'image' | 'video')
  }

  // Effects
  useEffect(() => {
    loadGalleries()
  }, [loadGalleries])

  useEffect(() => {
    if (selectedGallery && view === 'media') {
      loadMedia()
    }
  }, [selectedGallery, view, loadMedia])

  if (loading) {
  return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
      <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {view === 'media' && (
              <Button 
                variant="ghost" 
                onClick={goBackToGalleries}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Galleries</span>
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {view === 'galleries' ? 'Gallery Management' : `${selectedGallery?.name}`}
              </h1>
              <p className="text-gray-600">
                {view === 'galleries' 
                  ? 'Manage your image and video galleries'
                  : `Manage images and videos in this gallery`
                }
              </p>
            </div>
      </div>

          {view === 'galleries' && (
          <Dialog open={showCreateGallery} onOpenChange={setShowCreateGallery}>
            <DialogTrigger asChild>
                <Button>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  Create Gallery
            </Button>
            </DialogTrigger>
            <DialogContent>
          <DialogHeader>
                <DialogTitle>Create New Gallery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
                <div>
                  <Label htmlFor="gallery-name">Gallery Name *</Label>
                  <Input
                    id="gallery-name"
                    value={newGalleryData.name}
                    onChange={(e) => setNewGalleryData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter gallery name"
                  />
                  </div>
                <div>
                  <Label htmlFor="gallery-description">Description</Label>
                  <Textarea
                    id="gallery-description"
                    value={newGalleryData.description}
                    onChange={(e) => setNewGalleryData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter gallery description (optional)"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={newGalleryData.featured}
                    onChange={(e) => setNewGalleryData(prev => ({ ...prev, featured: e.target.checked }))}
                  />
                  <Label htmlFor="featured">Featured Gallery</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateGallery(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={createGallery}
                    disabled={isCreatingGallery || !newGalleryData.name.trim()}
                  >
                    {isCreatingGallery ? (
                      <>
                        <LoadingSpinner className="w-4 h-4 mr-2" />
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
          )}
                </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-200">
            <CardContent className="p-4">
              <div className="text-red-600">{error}</div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadGalleries}
                className="mt-2"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Galleries View */}
        {view === 'galleries' && (
          <div>
        {galleries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <FolderPlus className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Galleries Found</h3>
            <p className="text-gray-600 mb-4">Create your first gallery to start uploading media.</p>
            <Button onClick={() => setShowCreateGallery(true)}>
              <FolderPlus className="w-4 h-4 mr-2" />
              Create Your First Gallery
                      </Button>
                    </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {galleries.map(gallery => (
                  <Card 
                    key={gallery.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => selectGallery(gallery)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Folder className="w-8 h-8 text-emerald-600" />
                        {gallery.featured && (
                          <Badge variant="secondary">Featured</Badge>
                        )}
                  </div>
                      
                      <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                        {gallery.name}
                      </h3>
                      
                      {gallery.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {gallery.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <ImageIcon className="w-4 h-4" />
                            <span>{formatNumber(gallery.imageCount)}</span>
                </div>
                          <div className="flex items-center space-x-1">
                            <Video className="w-4 h-4" />
                            <span>{formatNumber(gallery.videoCount)}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="p-1">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Media View */}
        {view === 'media' && selectedGallery && (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center space-x-1 border-b">
              <Button
                variant={activeTab === 'images' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('images')}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Images ({selectedGallery.imageCount})
              </Button>
              <Button
                variant={activeTab === 'videos' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('videos')}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500"
              >
                <Video className="w-4 h-4 mr-2" />
                Videos ({selectedGallery.videoCount})
              </Button>
            </div>

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="space-y-6">
              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                      <Upload className="w-5 h-5" />
                    <span>Upload Images</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                    <Label htmlFor="image-upload">Select Images</Label>
              <Input
                      id="image-upload"
                type="file"
                multiple
                        accept={ALLOWED_IMAGE_TYPES.join(',')}
                onChange={handleFileSelection}
                        className="mt-1"
              />
                      <p className="text-sm text-gray-600 mt-1">
                        Max {(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB per file. Supported: JPG, PNG, WebP, GIF
                </p>
        </div>

                    {uploadFiles.length > 0 && (
                      <div className="space-y-2">
                        <Label>Selected Files ({uploadFiles.length})</Label>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {uploadFiles.map((file, index) => (
                            <div key={index} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                              <span className="truncate">{file.name}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-500">
                                  {(file.size / 1024 / 1024).toFixed(2)}MB
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setUploadFiles(files => files.filter((_, i) => i !== index))
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                                {uploadProgress.isUploading && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate">{uploadProgress.currentFile}</span>
                          <span className="font-medium">{uploadProgress.progress}%</span>
                        </div>
                        <Progress value={uploadProgress.progress} className="h-2" />
                        {uploadProgress.totalFiles > 0 && (
                          <div className="text-xs text-gray-500 text-center">
                            {uploadProgress.totalFiles} file{uploadProgress.totalFiles > 1 ? 's' : ''} selected
                          </div>
                        )}
                      </div>
                    )}

            <Button 
              onClick={handleImageUpload}
                    disabled={uploadFiles.length === 0 || uploadProgress.isUploading}
                    className="w-full"
            >
              {uploadProgress.isUploading ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                          Upload {uploadFiles.length} Image{uploadFiles.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
                </CardContent>
              </Card>

                {/* Images Grid */}
              {mediaLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
            </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {getFilteredMedia().map((media) => (
                    <Card key={`image-${media.id}`} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-3">
            <div className="space-y-2">
                          <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                            <Image
                              src={getMediaThumbnail(media)}
                              alt={media.title || media.alt || 'Image'}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                              quality={75}
                                onError={handleImageError}
                            />
                            
                            <div className="absolute top-2 right-2 flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMedia(media.id, 'image')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-100 bg-white/90 h-6 w-6 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
            </div>
            
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {media.title || 'Untitled'}
                            </h4>
                            {media.description && (
                              <p className="text-xs text-gray-600 line-clamp-2">
                                {media.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{media.featured ? 'Featured' : 'Regular'}</span>
                              <div className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                  {formatNumber(media.views || 0)}
            </div>
            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              </div>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <div className="space-y-6">
              {/* Video Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Video className="w-5 h-5" />
                    <span>Add Video</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
            <div className="space-y-2">
                      <Label htmlFor="video-url">Video URL *</Label>
              <Input
                        id="video-url"
                        type="url"
                        value={videoData.videoUrl}
                        onChange={(e) => setVideoData(prev => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                        <Label htmlFor="video-title">Title (Optional)</Label>
                        <Input
                          id="video-title"
                          value={videoData.title}
                          onChange={(e) => setVideoData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Video title"
              />
            </div>

              <div className="space-y-2">
                        <Label htmlFor="video-duration">Duration (Optional)</Label>
                <Input
                          id="video-duration"
                          value={videoData.duration}
                          onChange={(e) => setVideoData(prev => ({ ...prev, duration: e.target.value }))}
                          placeholder="e.g., 5:30"
                        />
                      </div>
              </div>

              <div className="space-y-2">
                      <Label htmlFor="video-description">Description (Optional)</Label>
                      <Textarea
                        id="video-description"
                        value={videoData.description}
                        onChange={(e) => setVideoData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Video description"
                        rows={3}
                      />
                </div>

            <Button 
              onClick={handleVideoUpload}
                      disabled={!videoData.videoUrl.trim() || videoUploading}
                    className="w-full"
            >
                      {videoUploading ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                          Adding Video...
                </>
              ) : (
                <>
                          <Plus className="w-4 h-4 mr-2" />
                  Add Video
                </>
              )}
            </Button>
                </CardContent>
              </Card>

                {/* Videos Grid */}
              {mediaLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
            </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredMedia().map((media) => (
                    <Card key={`video-${media.id}`} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
                            <Image
                              src={getMediaThumbnail(media)}
                              alt={media.title || 'Video'}
                              fill
                              className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              quality={75}
                                onError={handleVideoThumbnailError}
                              />
                              
                              <div className="absolute top-2 right-2">
              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMedia(media.id, 'video')}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-100 bg-white/90 h-8 w-8 p-0"
                              >
                                  <Trash2 className="w-4 h-4" />
              </Button>
            </div>

                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center">
                                  <Video className="w-6 h-6 text-white" />
            </div>
                              </div>
            </div>
            
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900 line-clamp-2">
                                {media.title || 'Untitled Video'}
                            </h4>
                            {media.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                {media.description}
                              </p>
                            )}
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{media.videoProvider?.toUpperCase() || 'VIDEO'}</span>
                              <div className="flex items-center">
                                  <Eye className="w-4 h-4 mr-1" />
                                  {formatNumber(media.views || 0)}
              </div>
              </div>
            </div>
              </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              )}
              </div>
            )}

            {/* Empty State */}
            {!mediaLoading && getFilteredMedia().length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {activeTab === 'images' ? (
                    <ImageIcon className="w-16 h-16 mx-auto" />
                  ) : (
                    <Video className="w-16 h-16 mx-auto" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No {activeTab} found
                </h3>
                <p className="text-gray-600">
                  Upload your first {activeTab.slice(0, -1)} to get started.
                </p>
              </div>
            )}
          </div>
        )}
            </div>
    </ErrorBoundary>
  )
}