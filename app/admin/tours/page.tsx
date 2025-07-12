"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, Edit, Trash2, Eye, Star, Users, Calendar, MapPin, DollarSign, TrendingUp, Award, RefreshCw, Image, X, Save, FileText, Route, Info, Camera, List, Clock, Mountain, Globe, Tag, Settings, BookOpen, CheckCircle, XCircle, ChevronLeft, ChevronRight, HardDrive } from "lucide-react"
import Link from "next/link"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"

interface Tour {
  id: number
  title: string
  slug: string
  description: string
  shortDescription: string
  category: {
    id: number
    name: string
    slug: string
    description: string | null
  } | null
  duration: string
  groupSize: string
  maxGroupSize: number
  price: number
  originalPrice: number | null
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  locationCountry: string
  locationRegion: string | null
  locationCoordinates: {
    lat: number
    lng: number
  } | null
  featuredImage: {
    data: string
    name: string | null
    type: string | null
    size: number | null
  } | null
  images: {
    id: number
    data: string | null
    name: string | null
    type: string | null
    size: number | null
    altText: string | null
    title: string | null
    description: string | null
    isFeatured: boolean
    displayOrder: number
    createdAt: string
  }[]
  highlights: {
    id: number
    highlight: string
    icon: string | null
    displayOrder: number
  }[]
  inclusions: {
    id: number
    item: string
    category: string
    displayOrder: number
  }[]
  exclusions: {
    id: number
    item: string
    displayOrder: number
  }[]
  itineraries: {
    id: number
    day: number
    title: string
    description: string
    location: string | null
    activities: any
    accommodation: string | null
    meals: any
    displayOrder: number
  }[]
  bestTimes: {
    id: number
    bestTimeItem: string
    description: string | null
    displayOrder: number
  }[]
  physicalReqs: {
    id: number
    requirement: string
    category: string
    displayOrder: number
  }[]
  reviews: {
    id: number
    rating: number
    comment: string
    status: string
    createdAt: string
    reviewerName: string
    reviewerEmail: string | null
    title: string | null
    user: {
      id: number
      email: string
      profile: {
        firstName: string | null
        lastName: string | null
        fullName: string | null
      } | null
    } | null
  }[]
  bookings: {
    id: number
    status: string
    totalAmount: number
    createdAt: string
    customerName: string
    customerEmail: string
    customer: {
      name: string
      email: string
    } | null
  }[]
  status: 'active' | 'inactive' | 'draft'
  featured: boolean
  popular: boolean
  isNew: boolean
  rating: number
  reviewCount: number
  viewCount: number
  bookingCount: number
  bestTime: any
  physicalRequirements: string | null
  whatToBring: any
  createdBy: {
    id: number
    email: string
    profile: {
      fullName: string | null
      firstName: string | null
      lastName: string | null
    } | null
  } | null
  createdAt: string
  updatedAt: string
  counts: {
    bookings: number
    reviews: number
    images: number
    highlights: number
    inclusions: number
    exclusions: number
    itineraries: number
  }
}

interface TourCategory {
  id: number
  name: string
  slug: string
  tourCount: number
}

export default function ToursManagement() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tours, setTours] = useState<Tour[]>([])
  const [categories, setCategories] = useState<TourCategory[]>([])
  const [filteredTours, setFilteredTours] = useState<Tour[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<string>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTours, setTotalTours] = useState(0)
  const [selectedTab, setSelectedTab] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const pageSize = 10

  useEffect(() => {
    loadTours()
    loadCategories()
  }, [currentPage, statusFilter, categoryFilter, difficultyFilter, sortBy, sortOrder])

  useEffect(() => {
    applyFilters()
  }, [tours, searchTerm, selectedTab])

  const loadTours = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sortBy,
        sortOrder
      })

      if (statusFilter !== "all") params.append("status", statusFilter)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (difficultyFilter !== "all") params.append("difficulty", difficultyFilter)

      const response = await fetch(`/api/admin/tours?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setTours(data.tours)
        setTotalPages(data.pagination.totalPages)
        setTotalTours(data.pagination.total)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load tours",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error loading tours:", error)
      toast({
        title: "Error",
        description: "Failed to load tours. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/tours/categories')
      const data = await response.json()

      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const applyFilters = () => {
    let filtered = tours

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tour => 
        tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.locationCountry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.locationRegion?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply tab filter
    if (selectedTab === "featured") {
      filtered = filtered.filter(tour => tour.featured)
    } else if (selectedTab === "popular") {
      filtered = filtered.filter(tour => tour.popular)
    } else if (selectedTab === "new") {
      filtered = filtered.filter(tour => tour.isNew)
    } else if (selectedTab === "draft") {
      filtered = filtered.filter(tour => tour.status === "draft")
    }

    setFilteredTours(filtered)
  }

  const handleDelete = async (tourId: number, tourTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${tourTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/tours/${tourId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message
        })
        loadTours()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete tour",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting tour:", error)
      toast({
        title: "Error",
        description: "Failed to delete tour. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadTours()
    setRefreshing(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800'
      case 'Moderate': return 'bg-yellow-100 text-yellow-800'
      case 'Challenging': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'draft': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  const openGallery = (tour: Tour) => {
    console.log('Opening gallery for tour:', tour.title)
    console.log('Tour images:', tour.images)
    console.log('First image data:', tour.images?.[0])
    
    if (!tour.images || tour.images.length === 0) {
      toast({
        title: "No Images",
        description: "This tour doesn't have any images in its gallery.",
        variant: "destructive"
      })
      return
    }
    
    setSelectedTour(tour)
    setSelectedImageIndex(0)
    setGalleryOpen(true)
  }

  const closeGallery = () => {
    setGalleryOpen(false)
    setSelectedTour(null)
    setSelectedImageIndex(0)
  }

  const nextImage = () => {
    if (selectedTour && selectedTour.images?.length) {
      setSelectedImageIndex((prev) => 
        prev === selectedTour.images.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (selectedTour && selectedTour.images?.length) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? selectedTour.images.length - 1 : prev - 1
      )
    }
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!galleryOpen) return
    
    switch (e.key) {
      case 'Escape':
        closeGallery()
        break
      case 'ArrowRight':
        nextImage()
        break
      case 'ArrowLeft':
        prevImage()
        break
    }
  }

  useEffect(() => {
    if (galleryOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [galleryOpen, selectedTour])

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="section-padding">
        <div className="container-max">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-earth-900 mb-2">Tour Management</h1>
              <p className="text-earth-600">Manage your tour packages and itineraries</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/tours/categories">
                  <Tag className="h-4 w-4 mr-2" />
                  Manage Categories
                </Link>
              </Button>
              <Button asChild className="bg-forest-600 hover:bg-forest-700">
                <Link href="/admin/tours/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Tour
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-earth-600">Total Tours</p>
                    <p className="text-2xl font-bold text-earth-900">{totalTours}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-earth-600">Featured Tours</p>
                    <p className="text-2xl font-bold text-earth-900">{tours.filter(t => t.featured).length}</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-earth-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-earth-900">
                      {tours.reduce((acc, tour) => acc + tour.bookingCount, 0)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-earth-600">Avg. Rating</p>
                    <p className="text-2xl font-bold text-earth-900">
                      {tours.length > 0 ? (tours.reduce((acc, tour) => acc + tour.rating, 0) / tours.length).toFixed(1) : '0.0'}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search tours..."
                      className="pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Challenging">Challenging</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Created</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="popularity">Popularity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tours Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All Tours</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="draft">Draft</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              {/* Tours Grid */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-48 w-full mb-4" />
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredTours.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTours.map((tour) => (
                    <Card key={tour.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        {/* Tour Image */}
                        <div className="relative mb-4">
                          {tour.featuredImage && tour.featuredImage.data ? (
                            <img
                              src={`data:${tour.featuredImage.type || 'image/jpeg'};base64,${tour.featuredImage.data}`}
                              alt={tour.title}
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                              <MapPin className="h-12 w-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1">
                            {tour.featured && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                            )}
                            {tour.popular && (
                              <Badge className="bg-green-100 text-green-800">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                            {tour.isNew && (
                              <Badge className="bg-blue-100 text-blue-800">
                                New
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Tour Info */}
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-earth-900 mb-1">{tour.title}</h3>
                            <p className="text-sm text-earth-600 line-clamp-2">{tour.shortDescription}</p>
                          </div>

                          {/* Tour Details */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-earth-500" />
                              <span className="text-earth-600">{tour.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-earth-500" />
                              <span className="text-earth-600">{tour.groupSize}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-earth-500" />
                              <span className="text-earth-600">{tour.locationRegion || tour.locationCountry}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4 text-earth-500" />
                              <span className="text-earth-600">{tour.rating.toFixed(1)} ({tour.reviewCount})</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Image className="h-4 w-4 text-earth-500" />
                              <span className="text-earth-600">{tour.images?.length || 0} images</span>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex gap-2">
                            <Badge className={getStatusColor(tour.status)}>
                              {tour.status}
                            </Badge>
                            <Badge className={getDifficultyColor(tour.difficulty)}>
                              {tour.difficulty}
                            </Badge>
                            {tour.category && (
                              <Badge variant="outline">
                                {tour.category.name}
                              </Badge>
                            )}
                          </div>

                          {/* Price */}
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="text-2xl font-bold text-earth-900">
                                {formatPrice(tour.price)}
                              </span>
                              {tour.originalPrice && tour.originalPrice > tour.price && (
                                <span className="text-sm text-earth-500 line-through ml-2">
                                  {formatPrice(tour.originalPrice)}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-earth-600">
                              {tour.bookingCount} bookings
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <Button 
                              asChild
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                            >
                              <Link href={`/admin/tours/${tour.id}/edit`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <Button 
                              asChild
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                            >
                              <Link href={`/admin/tours/${tour.id}/edit`}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Link>
                            </Button>
                            {tour.images?.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openGallery(tour)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Image className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(tour.id, tour.title)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-earth-900 mb-2">No tours found</h3>
                  <p className="text-earth-600 mb-4">
                    {searchTerm ? 'No tours match your search criteria.' : 'Get started by creating your first tour.'}
                  </p>
                  <Button asChild className="bg-forest-600 hover:bg-forest-700">
                    <Link href="/admin/tours/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Tour
                    </Link>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-earth-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Modal */}
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="text-lg font-semibold">{selectedTour?.title} - Gallery</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeGallery}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          {selectedTour && selectedTour.images?.length > 0 ? (
            (() => {
              const validImages = selectedTour.images.filter(img => img.data && img.data.length > 0)
              const hasValidImages = validImages.length > 0
              
              return hasValidImages ? (
                <div className="relative space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                    {validImages[selectedImageIndex]?.data ? (
                      <img
                        src={`data:${validImages[selectedImageIndex].type || 'image/jpeg'};base64,${validImages[selectedImageIndex].data}`}
                        alt={validImages[selectedImageIndex].altText || selectedTour.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error('Image failed to load:', e)
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    
                    {/* Fallback for missing image */}
                    <div className={`absolute inset-0 flex items-center justify-center ${validImages[selectedImageIndex]?.data ? 'hidden' : ''}`}>
                      <div className="text-center">
                        <Image className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Image not available</p>
                        <p className="text-xs text-gray-400 mt-1">
                          This image may not have been uploaded properly
                        </p>
                      </div>
                    </div>
                    
                    {/* Navigation Buttons */}
                    {validImages.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </>
                    )}
                    
                    {/* Image Counter */}
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                      {selectedImageIndex + 1} / {validImages.length}
                    </div>
                  </div>
                  
                  {/* Image Info */}
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {validImages[selectedImageIndex]?.title || `Image ${selectedImageIndex + 1}`}
                    </h4>
                    {validImages[selectedImageIndex]?.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {validImages[selectedImageIndex].description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      {validImages[selectedImageIndex]?.name && (
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {validImages[selectedImageIndex].name}
                        </span>
                      )}
                      {validImages[selectedImageIndex]?.size && (
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {(validImages[selectedImageIndex].size! / 1024 / 1024).toFixed(1)} MB
                        </span>
                      )}
                      {validImages[selectedImageIndex]?.isFeatured && (
                        <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-800">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Thumbnail Grid */}
                  {validImages.length > 1 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-3">All Images ({validImages.length})</h5>
                      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                        {validImages.map((image, index) => (
                          <button
                            key={image.id || index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 ${
                              index === selectedImageIndex 
                                ? 'border-blue-500 ring-2 ring-blue-200' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {image.data ? (
                              <img
                                src={`data:${image.type || 'image/jpeg'};base64,${image.data}`}
                                alt={image.altText || `Image ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            
                            {/* Fallback for thumbnail */}
                            <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${image.data ? 'hidden' : ''}`}>
                              <Image className="h-6 w-6 text-gray-400" />
                            </div>
                            
                            {/* Featured indicator */}
                            {image.isFeatured && (
                              <div className="absolute top-1 right-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Images Not Loading</h3>
                  <p className="text-gray-600 mb-4">
                    The images in this tour's gallery appear to be empty or not properly uploaded.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="outline" 
                      asChild
                      className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
                    >
                      <Link href={`/admin/tours/${selectedTour?.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Re-upload Images
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })()
          ) : (
            <div className="text-center py-12">
              <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Images Available</h3>
              <p className="text-gray-600 mb-4">
                This tour doesn't have any images in its gallery yet.
              </p>
              <Button 
                variant="outline" 
                asChild
                className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300"
              >
                <Link href={`/admin/tours/${selectedTour?.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Add Images
                </Link>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
