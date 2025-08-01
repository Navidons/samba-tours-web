"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { Upload, Image as ImageIcon, Video, X, Trash2, Eye, Plus, FolderPlus } from "lucide-react"
import LoadingSpinner from "@/components/ui/loading-spinner"
import Image from "next/image"
import ErrorBoundary from "@/components/ui/error-boundary"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

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
  duration?: number
  thumbnailData?: string
  thumbnailName?: string
  thumbnailType?: string
}

export default function AdminGalleryPage() {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [mediaList, setMediaList] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [mediaLoading, setMediaLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedGallery, setSelectedGallery] = useState<number | null>(null)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [videoUrl, setVideoUrl] = useState("")
  const [imageTitle, setImageTitle] = useState("")
  const [imageDescription, setImageDescription] = useState("")
  const [videoTitle, setVideoTitle] = useState("")
  const [videoDescription, setVideoDescription] = useState("")
  const [uploadProgress, setUploadProgress] = useState({
    isUploading: false,
    progress: 0,
    currentFile: "",
    totalFiles: 0,
    completedFiles: 0
  })
  
  // Gallery creation state
  const [showCreateGallery, setShowCreateGallery] = useState(false)
  const [newGalleryData, setNewGalleryData] = useState({
    name: "",
    description: "",
    featured: false
  })
  const [isCreatingGallery, setIsCreatingGallery] = useState(false)
  
  const { toast } = useToast()

  useEffect(() => {
    loadGalleries()
  }, [])

  useEffect(() => {
    if (selectedGallery) {
    loadMedia()
    } else {
      setMediaList([])
    }
  }, [selectedGallery])

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

  const loadMedia = useCallback(async () => {
    if (!selectedGallery) return
    
    try {
      setMediaLoading(true)
      
      const params = new URLSearchParams({
        galleryId: selectedGallery.toString()
      })

      const response = await fetch(`/api/admin/gallery/images?${params}`)
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to load media')
        return
      }

      setMediaList(data.media || [])
    } catch (err) {
      console.error('Error loading media:', err)
      setError('Failed to load media')
    } finally {
      setMediaLoading(false)
    }
  }, [selectedGallery])

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
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to create gallery",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Gallery created successfully",
      })

      // Reset form and close dialog
      setNewGalleryData({ name: "", description: "", featured: false })
      setShowCreateGallery(false)
      
      // Reload galleries
      await loadGalleries()
      
      // Select the new gallery
      if (data.gallery) {
        setSelectedGallery(data.gallery.id)
      }
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
    if (!selectedGallery || uploadFiles.length === 0) return

    try {
      setUploadProgress({
        isUploading: true,
        progress: 0,
        currentFile: "",
        totalFiles: uploadFiles.length,
        completedFiles: 0
      })

      const formData = new FormData()
      formData.append('galleryId', selectedGallery.toString())
      formData.append('title', imageTitle)
      formData.append('description', imageDescription)
      
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

      setUploadFiles([])
      setImageTitle("")
      setImageDescription("")
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
    if (!selectedGallery || !videoUrl) return

    try {
      setUploadProgress({
        isUploading: true,
        progress: 0,
        currentFile: "Video Link",
        totalFiles: 1,
        completedFiles: 0
      })

      const formData = new FormData()
      formData.append('galleryId', selectedGallery.toString())
      formData.append('videoUrl', videoUrl)
      formData.append('videoProvider', 'youtube')
      formData.append('title', videoTitle)
      formData.append('description', videoDescription)

      const data = await uploadWithProgress('/api/admin/gallery/videos', formData, "Video Link")

      setUploadProgress(prev => ({
        ...prev,
        completedFiles: 1,
        progress: 100
      }))

      toast({
        title: "Success",
        description: "Video added successfully",
      })

      setVideoUrl("")
      setVideoTitle("")
      setVideoDescription("")
      loadMedia()
      loadGalleries()
    } catch (err) {
      console.error('Error adding video:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add video",
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

  const getMediaThumbnail = (media: MediaItem): string => {
    if (media.type === 'image' && media.imageData && media.imageType) {
      return `data:${media.imageType};base64,${media.imageData}`
    } else if (media.type === 'video' && media.thumbnailData) {
      return `data:${media.thumbnailType};base64,${media.thumbnailData}`
    } else if (media.type === 'video' && media.videoProvider === 'youtube' && media.videoId) {
      // Fallback to YouTube thumbnail URL
      return `https://img.youtube.com/vi/${media.videoId}/mqdefault.jpg`
    }
    return ''
  }

  const formatDuration = (duration: number | null): string => {
    if (!duration) return '0:00'
    const mins = Math.floor(duration / 60)
    const secs = duration % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
  return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => { setError(null); loadGalleries(); }}>
            Try Again
          </Button>
      </div>
    )
  }

  return (
    <ErrorBoundary>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
            <div>
            <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
            <p className="text-gray-600 mt-2">Upload and manage your media files</p>
      </div>

          {/* Create Gallery Button */}
          <Dialog open={showCreateGallery} onOpenChange={setShowCreateGallery}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <FolderPlus className="w-4 h-4" />
                <span>Create Gallery</span>
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
                </div>

        {/* Gallery Selector */}
        <div className="flex items-center space-x-4">
          <Label htmlFor="gallery-select">Select Gallery:</Label>
                      <select
            id="gallery-select"
            value={selectedGallery || ''}
            onChange={(e) => setSelectedGallery(e.target.value ? parseInt(e.target.value) : null)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Choose a gallery...</option>
            {galleries.map(gallery => (
              <option key={gallery.id} value={gallery.id}>
                {gallery.name} ({gallery.imageCount} images, {gallery.videoCount} videos)
              </option>
                        ))}
                      </select>
                  </div>

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
        ) : !selectedGallery ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ImageIcon className="w-16 h-16 mx-auto" />
                  </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Gallery</h3>
            <p className="text-gray-600">Choose a gallery from the dropdown above to start uploading media.</p>
                </div>
        ) : (
          <Tabs defaultValue="images" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="videos">Videos</TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="space-y-6">
              {/* Image Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ImageIcon className="w-5 h-5" />
                    <span>Upload Images</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
            <div className="space-y-2">
                    <Label htmlFor="image-title">Title (Optional)</Label>
              <Input
                      id="image-title"
                      type="text"
                      placeholder="Enter image title..."
                      value={imageTitle}
                      onChange={(e) => setImageTitle(e.target.value)}
                      disabled={uploadProgress.isUploading}
                    />
            </div>

            <div className="space-y-2">
                    <Label htmlFor="image-description">Description (Optional)</Label>
              <Textarea
                      id="image-description"
                      placeholder="Enter image description..."
                      value={imageDescription}
                      onChange={(e) => setImageDescription(e.target.value)}
                      disabled={uploadProgress.isUploading}
                      rows={3}
                    />
            </div>

            <div className="space-y-2">
                    <Label htmlFor="image-upload">Select Images</Label>
              <Input
                      id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setUploadFiles(Array.from(e.target.files || []))}
                      disabled={uploadProgress.isUploading}
              />
              {uploadFiles.length > 0 && (
                <p className="text-sm text-gray-600">
                  {uploadFiles.length} image(s) selected
                </p>
              )}
        </div>

            {uploadProgress.isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                        <span>Uploading {uploadProgress.currentFile}...</span>
                        <span>{uploadProgress.progress}%</span>
      </div>
                      <Progress value={uploadProgress.progress} />
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
                  Upload Images
                </>
              )}
            </Button>
                </CardContent>
              </Card>

              {/* Image Grid */}
              {mediaLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
            </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {mediaList.filter(media => media.type === 'image').map((media) => (
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
                              <span>{media.gallery?.name || 'Unknown Gallery'}</span>
                              <div className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {media.views || 0}
            </div>
            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="videos" className="space-y-6">
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
                    <Label htmlFor="video-title">Title (Optional)</Label>
              <Input
                id="video-title"
                      type="text"
                      placeholder="Enter video title..."
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      disabled={uploadProgress.isUploading}
              />
            </div>

            <div className="space-y-2">
                    <Label htmlFor="video-description">Description (Optional)</Label>
                    <Textarea
                id="video-description"
                      placeholder="Enter video description..."
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      disabled={uploadProgress.isUploading}
                      rows={3}
              />
            </div>

              <div className="space-y-2">
                    <Label htmlFor="video-url">Video URL (YouTube/Vimeo)</Label>
                <Input
                      id="video-url"
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      disabled={uploadProgress.isUploading}
                    />
                    <p className="text-sm text-muted-foreground">
                      💡 YouTube thumbnails will be automatically fetched from the video URL.
                    </p>
              </div>

            {uploadProgress.isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                        <span>Adding video...</span>
                        <span>{uploadProgress.progress}%</span>
                </div>
                      <Progress value={uploadProgress.progress} />
              </div>
            )}

            <Button 
              onClick={handleVideoUpload}
                    disabled={!videoUrl || uploadProgress.isUploading}
                    className="w-full"
            >
              {uploadProgress.isUploading ? (
                <>
                  <LoadingSpinner className="w-4 h-4 mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Add Video
                </>
              )}
            </Button>
                </CardContent>
              </Card>

              {/* Video Grid */}
              {mediaLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
            </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {mediaList.filter(media => media.type === 'video').map((media) => (
                    <Card key={`video-${media.id}`} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-3">
            <div className="space-y-2">
                          <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden">
                            <Image
                              src={getMediaThumbnail(media)}
                              alt={media.title || 'Video'}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                              quality={75}
                            />
                            
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
              <Button 
                                size="sm"
                                className="bg-white/90 text-black hover:bg-white"
                                onClick={() => window.open(media.videoUrl || '#', '_blank')}
                              >
                                <Video className="w-4 h-4" />
              </Button>
                            </div>

                            <div className="absolute top-2 right-2 flex space-x-1">
              <Button 
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMedia(media.id, 'video')}
                                className="text-red-600 hover:text-red-700 hover:bg-red-100 bg-white/90 h-6 w-6 p-0"
                              >
                                <Trash2 className="w-3 h-3" />
              </Button>
            </div>

                            {media.duration && (
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white px-1 py-0.5 rounded text-xs">
                                {formatDuration(media.duration)}
            </div>
                            )}
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
                              <span>{media.gallery?.name || 'Unknown Gallery'}</span>
                              <div className="flex items-center">
                                <Eye className="w-3 h-3 mr-1" />
                                {media.views || 0}
              </div>
              </div>
            </div>
              </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
              )}
            </TabsContent>
          </Tabs>
        )}
            </div>
    </ErrorBoundary>
  )
}
