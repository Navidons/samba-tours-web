"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Upload, Plus, Trash2, X, MapPin, DollarSign, Users, Calendar, Star, Mountain, Clock, Camera, FileText, List, Route, Info, Image as ImageIcon, Save, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TourCategory {
  id: number
  name: string
  slug: string
  tourCount: number
}

interface UploadedImage {
  id: string
  url: string
  name: string
  type: string
  size: number
}

interface ItineraryDay {
  day: number
  title: string
  description: string
  location: string
  activities: string
  accommodation: string
  meals: string
}

// Predefined lists for better UX
const predefinedInclusions = [
  "Accommodation",
  "Meals as specified",
  "Transportation",
  "Park entrance fees",
  "Guide services",
  "Professional Guide",
  "All activities mentioned",
  "Safety equipment",
  "First aid kit",
  "Water and snacks"
]

const predefinedExclusions = [
  "International flights",
  "Visa fees",
  "Travel insurance",
  "Personal expenses",
  "Tips and gratuities",
  "Alcoholic beverages",
  "Personal equipment",
  "Optional activities",
  "Medical expenses",
  "Laundry services"
]

const predefinedHighlights = [
  "Wildlife viewing",
  "Cultural immersion",
  "Scenic landscapes",
  "Adventure activities",
  "Historical sites",
  "Photography opportunities",
  "Local cuisine",
  "Traditional villages",
  "Mountain views",
  "River experiences"
]

const predefinedBestTimes = [
  "Dry Season (June-October)",
  "Wet Season (November-May)",
  "Year-round",
  "Peak Season (December-February)",
  "Shoulder Season (March-May)",
  "Specific Months (e.g., Jan, Feb)",
  "Avoid Rainy Season",
  "Best for Wildlife",
  "Best for Photography",
  "Best for Hiking"
]

const predefinedPhysicalRequirements = [
  "Easy (suitable for all fitness levels)",
  "Moderate (some walking/light hiking involved)",
  "Challenging (requires good physical fitness)",
  "Strenuous (demands high fitness level)",
  "Ability to walk 3-5 km per day",
  "Comfortable with uneven terrain",
  "No serious health conditions",
  "Suitable for ages 12 and above",
  "Altitude considerations",
  "Swimming ability required"
]

const predefinedWhatToBring = [
  "Comfortable walking shoes",
  "Lightweight clothing",
  "Rain jacket or poncho",
  "Sunscreen and hat",
  "Camera and binoculars",
  "Personal toiletries",
  "Water bottle",
  "Insect repellent",
  "Warm layers",
  "Medication if needed"
]

const predefinedDifficulties = [
  "Easy",
  "Moderate", 
  "Challenging",
  "Strenuous"
]

export default function EditTour() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tour, setTour] = useState<any>(null)
  const [categories, setCategories] = useState<TourCategory[]>([])
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null)
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string>("")
  const [currentTab, setCurrentTab] = useState("basic")
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isViewMode, setIsViewMode] = useState(false)

  // Custom input states
  const [customInclusionInput, setCustomInclusionInput] = useState('')
  const [customExclusionInput, setCustomExclusionInput] = useState('')
  const [customHighlightInput, setCustomHighlightInput] = useState('')
  const [customBestTimeInput, setCustomBestTimeInput] = useState('')
  const [customPhysicalRequirementInput, setCustomPhysicalRequirementInput] = useState('')
  const [customWhatToBringInput, setCustomWhatToBringInput] = useState('')

  // Main tour data
  const [formData, setFormData] = useState({
    title: "",
    shortDescription: "",
    description: "",
    categoryId: "",
    duration: "",
    groupSize: "1-8 people",
    maxGroupSize: "12",
    price: "",
    originalPrice: "",
    difficulty: "Moderate",
    locationCountry: "Uganda",
    locationRegion: "",
    locationCoordinatesLat: "",
    locationCoordinatesLng: "",
    physicalRequirements: "",
    status: "active",
    featured: false,
    popular: false,
    isNew: false
  })

  // Dynamic lists - now using string arrays for simplicity
  const [highlights, setHighlights] = useState<string[]>([])
  const [inclusions, setInclusions] = useState<string[]>([])
  const [exclusions, setExclusions] = useState<string[]>([])
  const [bestTimeItems, setBestTimeItems] = useState<string[]>([])
  const [whatToBringItems, setWhatToBringItems] = useState<string[]>([])
  const [physicalRequirementItems, setPhysicalRequirementItems] = useState<string[]>([])

  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([
    { day: 1, title: "", description: "", location: "", activities: "", accommodation: "", meals: "" }
  ])

  useEffect(() => {
    loadCategories()
    loadTour()
  }, [params.id])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/tours/categories')
      const data = await response.json()

      if (data.success) {
        setCategories(data.categories)
      } else {
        toast({
          title: "Warning",
          description: "Could not load categories",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error loading categories:", error)
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive"
      })
    }
  }

  const loadTour = async () => {
    if (!params.id) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/tours/${params.id}`)
      const data = await response.json()

      if (data.success && data.tour) {
        const tour = data.tour
        setTour(tour)

        // Populate form data
        setFormData({
          title: tour.title || "",
          shortDescription: tour.shortDescription || "",
          description: tour.description || "",
          categoryId: tour.category?.id?.toString() || "",
          duration: tour.duration || "",
          groupSize: tour.groupSize || "1-8 people",
          maxGroupSize: tour.maxGroupSize?.toString() || "12",
          price: tour.price?.toString() || "",
          originalPrice: tour.originalPrice?.toString() || "",
          difficulty: tour.difficulty || "Moderate",
          locationCountry: tour.locationCountry || "Uganda",
          locationRegion: tour.locationRegion || "",
          locationCoordinatesLat: tour.locationCoordinates?.lat?.toString() || "",
          locationCoordinatesLng: tour.locationCoordinates?.lng?.toString() || "",
          physicalRequirements: tour.physicalRequirements || "",
          status: tour.status || "active",
          featured: tour.featured || false,
          popular: tour.popular || false,
          isNew: tour.isNew || false
        })

        // Populate lists
        setHighlights(tour.highlights?.map((h: any) => h.highlight) || [])
        setInclusions(tour.inclusions?.map((i: any) => i.item) || [])
        setExclusions(tour.exclusions?.map((e: any) => e.item) || [])
        setBestTimeItems(tour.bestTimes?.map((b: any) => b.bestTimeItem) || [])
        setWhatToBringItems(tour.whatToBring?.map((w: any) => w.item) || [])
        setPhysicalRequirementItems(tour.physicalReqs?.map((p: any) => p.requirement) || [])

        // Populate itinerary
        if (tour.itineraries && tour.itineraries.length > 0) {
          setItineraryDays(tour.itineraries.map((it: any) => ({
            day: it.day,
            title: it.title || "",
            description: it.description || "",
            location: it.location || "",
            activities: Array.isArray(it.activities) ? it.activities.join('\n') : it.activities || "",
            accommodation: it.accommodation || "",
            meals: Array.isArray(it.meals) ? it.meals.join(', ') : it.meals || ""
          })))
        }

        // Populate images
        if (tour.featuredImage?.data) {
          setFeaturedImagePreview(`data:${tour.featuredImage.type};base64,${tour.featuredImage.data}`)
        }

        if (tour.images && tour.images.length > 0) {
          const imageUrls = tour.images
            .filter((img: any) => img.data)
            .map((img: any) => `data:${img.type};base64,${img.data}`)
          setImagePreviews(imageUrls)
        }

      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to load tour",
          variant: "destructive"
        })
        router.push("/admin/tours")
      }
    } catch (error) {
      console.error("Error loading tour:", error)
      toast({
        title: "Error",
        description: "Failed to load tour",
        variant: "destructive"
      })
      router.push("/admin/tours")
    } finally {
      setLoading(false)
    }
  }

  const createNewCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a category name",
        variant: "destructive"
      })
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', newCategoryName.trim())
      formData.append('isActive', 'true')

      const response = await fetch('/api/admin/tours/categories', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Category created successfully!"
        })
        setCategories(prev => [...prev, data.category])
        setFormData(prev => ({ ...prev, categoryId: data.category.id.toString() }))
        setNewCategoryName("")
        setShowNewCategoryModal(false)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create category",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating category:", error)
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleFeaturedImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFeaturedImageFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setFeaturedImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFeaturedImage = () => {
    setFeaturedImageFile(null)
    setFeaturedImagePreview("")
  }

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setSelectedImages((prev) => [...prev, ...files])

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeGalleryImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
  }

  // Checkbox handlers for predefined lists
  const handleCheckboxChange = (type: "highlights" | "inclusions" | "exclusions" | "bestTimeItems" | "whatToBringItems" | "physicalRequirementItems", item: string, checked: boolean) => {
    const setterMap = {
      highlights: setHighlights,
      inclusions: setInclusions,
      exclusions: setExclusions,
      bestTimeItems: setBestTimeItems,
      whatToBringItems: setWhatToBringItems,
      physicalRequirementItems: setPhysicalRequirementItems
    }

    const setter = setterMap[type]
    if (checked) {
      setter(prev => prev.includes(item) ? prev : [...prev, item])
    } else {
      setter(prev => prev.filter(i => i !== item))
    }
  }

  // Custom input handlers
  const handleAddCustomInclusion = () => {
    if (customInclusionInput.trim() !== '') {
      setInclusions(prev => [...prev, customInclusionInput.trim()])
      setCustomInclusionInput('')
    }
  }

  const handleAddCustomExclusion = () => {
    if (customExclusionInput.trim() !== '') {
      setExclusions(prev => [...prev, customExclusionInput.trim()])
      setCustomExclusionInput('')
    }
  }

  const handleAddCustomHighlight = () => {
    if (customHighlightInput.trim() !== '') {
      setHighlights(prev => [...prev, customHighlightInput.trim()])
      setCustomHighlightInput('')
    }
  }

  const handleAddCustomBestTime = () => {
    if (customBestTimeInput.trim() !== '') {
      setBestTimeItems(prev => [...prev, customBestTimeInput.trim()])
      setCustomBestTimeInput('')
    }
  }

  const handleAddCustomWhatToBring = () => {
    if (customWhatToBringInput.trim() !== '') {
      setWhatToBringItems(prev => [...prev, customWhatToBringInput.trim()])
      setCustomWhatToBringInput('')
    }
  }

  const handleAddCustomPhysicalRequirement = () => {
    if (customPhysicalRequirementInput.trim() !== '') {
      setPhysicalRequirementItems(prev => [...prev, customPhysicalRequirementInput.trim()])
      setCustomPhysicalRequirementInput('')
    }
  }

  const addItineraryDay = () => {
    const newDay = itineraryDays.length + 1
    setItineraryDays([...itineraryDays, { day: newDay, title: "", description: "", location: "", activities: "", accommodation: "", meals: "" }])
  }

  const updateItineraryDay = (dayIndex: number, field: keyof ItineraryDay, value: string | number) => {
    setItineraryDays(itineraryDays.map((day, index) => index === dayIndex ? { ...day, [field]: value } : day))
  }

  const removeItineraryDay = (dayIndex: number) => {
    setItineraryDays(itineraryDays.filter((_, index) => index !== dayIndex).map((day, index) => ({ ...day, day: index + 1 })))
  }

  const validateForm = () => {
    const required = ["title", "description", "categoryId", "duration", "price"]
    const missing = required.filter(field => !formData[field as keyof typeof formData])
    
    if (missing.length > 0) {
      toast({
        title: "Validation Error",
        description: `Missing required fields: ${missing.join(", ")}`,
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setSaving(true)

    try {
      // Create FormData for file uploads
      const submitData = new FormData()

      // Add basic form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          submitData.append(key, value.toString())
        }
      })

      // Add featured image
      if (featuredImageFile) {
        submitData.append('featuredImage', featuredImageFile)
      }

      // Add gallery images
      selectedImages.forEach((file) => {
        submitData.append('galleryImages', file)
      })

      // Add structured data as JSON - convert string arrays to objects for API compatibility
      if (highlights.length > 0) {
        const highlightsData = highlights.map(h => ({ highlight: h, icon: "" }))
        submitData.append('highlights', JSON.stringify(highlightsData))
      }
      if (inclusions.length > 0) {
        const inclusionsData = inclusions.map(i => ({ item: i, category: "general" }))
        submitData.append('inclusions', JSON.stringify(inclusionsData))
      }
      if (exclusions.length > 0) {
        const exclusionsData = exclusions.map(e => ({ item: e }))
        submitData.append('exclusions', JSON.stringify(exclusionsData))
      }
      if (itineraryDays.filter(day => day.title.trim() || day.description.trim()).length > 0) {
        submitData.append('itineraries', JSON.stringify(itineraryDays.filter(day => day.title.trim() || day.description.trim())))
      }
      
      // Handle list data as JSON
      if (bestTimeItems.length > 0) {
        const bestTimeData = bestTimeItems.map(item => ({ item }))
        submitData.append('bestTime', JSON.stringify(bestTimeData))
      }
      
      if (whatToBringItems.length > 0) {
        const whatToBringData = whatToBringItems.map(item => ({ item }))
        submitData.append('whatToBring', JSON.stringify(whatToBringData))
      }
      
      if (physicalRequirementItems.length > 0) {
        const physicalRequirementsData = physicalRequirementItems.map(item => ({ item }))
        submitData.append('physicalRequirements', JSON.stringify(physicalRequirementsData))
      }

    const response = await fetch(`/api/admin/tours/${params.id}`, {
      method: "PUT",
      body: submitData
    })

    const result = await response.json()

    if (response.ok && result.success) {
        toast({
          title: "Success",
          description: "Tour updated successfully!"
        })
      router.push("/admin/tours")
    } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update tour",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating tour:", error)
      toast({
        title: "Error",
        description: "Failed to update tour. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="section-padding">
          <div className="container-max max-w-6xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading tour...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!tour) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="section-padding">
          <div className="container-max max-w-6xl">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-600 mb-4">Tour not found</p>
                <Button asChild>
                  <Link href="/admin/tours">Back to Tours</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="section-padding">
        <div className="container-max max-w-6xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/tours">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tours
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-earth-900">
                {isViewMode ? "View Tour" : "Edit Tour"}
              </h1>
              <p className="text-earth-600">
                {isViewMode ? "Tour details" : "Update tour details"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isViewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsViewMode(true)}
                disabled={isViewMode}
              >
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
              <Button
                variant={!isViewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsViewMode(false)}
                disabled={!isViewMode}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-8">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="basic" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="pricing" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Pricing
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Media
                </TabsTrigger>
                <TabsTrigger value="features" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Features
                </TabsTrigger>
                <TabsTrigger value="itinerary" className="flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Itinerary
                </TabsTrigger>
              </TabsList>

              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Tour Title *</Label>
                        <Input
                          id="title"
                          placeholder="Enter tour title"
                          value={formData.title}
                          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                          required
                          disabled={isViewMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <div className="flex gap-2">
                          <Select
                            value={formData.categoryId}
                            onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value }))}
                            required
                            disabled={isViewMode}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name} ({category.tourCount} tours)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {!isViewMode && !formData.categoryId && (
                            <Dialog open={showNewCategoryModal} onOpenChange={setShowNewCategoryModal}>
                              <DialogTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="shrink-0"
                                  onClick={() => setShowNewCategoryModal(true)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Create New Category</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="newCategoryName">Category Name</Label>
                                    <Input
                                      id="newCategoryName"
                                      placeholder="Enter category name"
                                      value={newCategoryName}
                                      onChange={(e) => setNewCategoryName(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault()
                                          createNewCategory()
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setShowNewCategoryModal(false)
                                        setNewCategoryName("")
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={createNewCategory}>
                                      Create Category
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="short_description">Short Description</Label>
                      <Input
                        id="short_description"
                        placeholder="Brief tour summary (150 characters max)"
                        value={formData.shortDescription}
                        onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                        maxLength={150}
                        disabled={isViewMode}
                      />
                      <p className="text-xs text-gray-500">{formData.shortDescription.length}/150 characters</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Full Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter detailed tour description"
                        rows={6}
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                        required
                        disabled={isViewMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="physicalRequirements">Physical Requirements</Label>
                      <Textarea
                        id="physicalRequirements"
                        placeholder="Describe any physical requirements for this tour"
                        value={formData.physicalRequirements}
                        onChange={(e) => setFormData((prev) => ({ ...prev, physicalRequirements: e.target.value }))}
                        rows={3}
                        disabled={isViewMode}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration *</Label>
                        <Input
                          id="duration"
                          placeholder="e.g., 3 Days 2 Nights"
                          value={formData.duration}
                          onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
                          required
                          disabled={isViewMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="groupSize">Group Size</Label>
                        <Input
                          id="groupSize"
                          placeholder="e.g., 1-8 people"
                          value={formData.groupSize}
                          onChange={(e) => setFormData((prev) => ({ ...prev, groupSize: e.target.value }))}
                          disabled={isViewMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxGroupSize">Max Group Size</Label>
                        <Input
                          id="maxGroupSize"
                          type="number"
                          placeholder="12"
                          value={formData.maxGroupSize}
                          onChange={(e) => setFormData((prev) => ({ ...prev, maxGroupSize: e.target.value }))}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulty Level</Label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, difficulty: value }))}
                          disabled={isViewMode}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {predefinedDifficulties.map((difficulty) => (
                              <SelectItem key={difficulty} value={difficulty}>
                                {difficulty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                          disabled={isViewMode}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Location & Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="locationCountry">Country</Label>
                        <Input
                          id="locationCountry"
                          placeholder="Uganda"
                          value={formData.locationCountry}
                          onChange={(e) => setFormData((prev) => ({ ...prev, locationCountry: e.target.value }))}
                          disabled={isViewMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="locationRegion">Region/Park</Label>
                        <Input
                          id="locationRegion"
                          placeholder="e.g., Bwindi Impenetrable National Park"
                          value={formData.locationRegion}
                          onChange={(e) => setFormData((prev) => ({ ...prev, locationRegion: e.target.value }))}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="locationCoordinatesLat">Latitude (Optional)</Label>
                        <Input
                          id="locationCoordinatesLat"
                          type="number"
                          step="any"
                          placeholder="e.g., -1.06470"
                          value={formData.locationCoordinatesLat}
                          onChange={(e) => setFormData((prev) => ({ ...prev, locationCoordinatesLat: e.target.value }))}
                          disabled={isViewMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="locationCoordinatesLng">Longitude (Optional)</Label>
                        <Input
                          id="locationCoordinatesLng"
                          type="number"
                          step="any"
                          placeholder="e.g., 29.632220"
                          value={formData.locationCoordinatesLng}
                          onChange={(e) => setFormData((prev) => ({ ...prev, locationCoordinatesLng: e.target.value }))}
                          disabled={isViewMode}
                        />
                      </div>
                    </div>

                    {/* Physical Requirements Text Field */}
                    <div className="space-y-2">
                      <Label htmlFor="physicalRequirements">Physical Requirements</Label>
                      <Textarea
                        id="physicalRequirements"
                        placeholder="Describe any physical requirements for this tour"
                        value={formData.physicalRequirements}
                        onChange={(e) => setFormData((prev) => ({ ...prev, physicalRequirements: e.target.value }))}
                        rows={3}
                        disabled={isViewMode}
                      />
                    </div>

                    {/* Physical Requirements List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Physical Requirements List</Label>
                      </div>
                      <div className="space-y-3">
                        {[...new Set([...predefinedPhysicalRequirements, ...physicalRequirementItems])].map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={`physical-requirement-${item.replace(/\s+|\(|\)/g, '-')}`}
                              checked={physicalRequirementItems.includes(item)}
                              onCheckedChange={(checked) => handleCheckboxChange("physicalRequirementItems", item, checked === true)}
                              disabled={isViewMode}
                            />
                            <Label htmlFor={`physical-requirement-${item.replace(/\s+|\(|\)/g, '-')}`}>{item}</Label>
                          </div>
                        ))}
                      </div>
                      {!isViewMode && (
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Add custom physical requirement"
                            value={customPhysicalRequirementInput}
                            onChange={(e) => setCustomPhysicalRequirementInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customPhysicalRequirementInput.trim() !== '') {
                                handleAddCustomPhysicalRequirement()
                              }
                            }}
                          />
                          <Button type="button" onClick={handleAddCustomPhysicalRequirement}>
                            Add
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Best Time to Visit List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Best Time to Visit</Label>
                      </div>
                      <div className="space-y-3">
                        {[...new Set([...predefinedBestTimes, ...bestTimeItems])].map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={`best-time-${item.replace(/\s+|\(|\)/g, '-')}`}
                              checked={bestTimeItems.includes(item)}
                              onCheckedChange={(checked) => handleCheckboxChange("bestTimeItems", item, checked === true)}
                              disabled={isViewMode}
                            />
                            <Label htmlFor={`best-time-${item.replace(/\s+|\(|\)/g, '-')}`}>{item}</Label>
                          </div>
                        ))}
                      </div>
                      {!isViewMode && (
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Add custom best time"
                            value={customBestTimeInput}
                            onChange={(e) => setCustomBestTimeInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customBestTimeInput.trim() !== '') {
                                handleAddCustomBestTime()
                              }
                            }}
                          />
                          <Button type="button" onClick={handleAddCustomBestTime}>
                            Add
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* What to Bring List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>What to Bring</Label>
                      </div>
                      <div className="space-y-3">
                        {[...new Set([...predefinedWhatToBring, ...whatToBringItems])].map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={`what-to-bring-${item.replace(/\s+/g, '-')}`}
                              checked={whatToBringItems.includes(item)}
                              onCheckedChange={(checked) => handleCheckboxChange("whatToBringItems", item, checked === true)}
                              disabled={isViewMode}
                            />
                            <Label htmlFor={`what-to-bring-${item.replace(/\s+/g, '-')}`}>{item}</Label>
                          </div>
                        ))}
                      </div>
                      {!isViewMode && (
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Add custom item to bring"
                            value={customWhatToBringInput}
                            onChange={(e) => setCustomWhatToBringInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customWhatToBringInput.trim() !== '') {
                                handleAddCustomWhatToBring()
                              }
                            }}
                          />
                          <Button type="button" onClick={handleAddCustomWhatToBring}>
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Pricing Tab */}
              <TabsContent value="pricing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Pricing & Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="price">Current Price (USD) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          placeholder="1200"
                          value={formData.price}
                          onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                          required
                          disabled={isViewMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">Original Price (USD)</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          step="0.01"
                          placeholder="1500"
                          value={formData.originalPrice}
                          onChange={(e) => setFormData((prev) => ({ ...prev, originalPrice: e.target.value }))}
                          disabled={isViewMode}
                        />
                        <p className="text-xs text-gray-500">Leave empty if no discount</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Tour Flags</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="featured"
                            checked={formData.featured}
                            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
                            disabled={isViewMode}
                          />
                          <Label htmlFor="featured" className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Featured Tour
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="popular"
                            checked={formData.popular}
                            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, popular: checked }))}
                            disabled={isViewMode}
                          />
                          <Label htmlFor="popular" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Popular Tour
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="isNew"
                            checked={formData.isNew}
                            onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isNew: checked }))}
                            disabled={isViewMode}
                          />
                          <Label htmlFor="isNew" className="flex items-center gap-2">
                            <Badge className="h-4 w-4" />
                            New Tour
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Media Tab */}
              <TabsContent value="media" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Featured Image
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {featuredImagePreview ? (
                        <div className="relative">
                          <img
                            src={featuredImagePreview}
                            alt="Featured preview"
                            className="w-full max-w-md h-48 object-cover rounded-lg"
                          />
                          {!isViewMode && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={removeFeaturedImage}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">Upload featured image</p>
                          <p className="text-sm text-gray-500">Recommended size: 1200x630 pixels</p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFeaturedImageUpload}
                            className="hidden"
                            id="featured-image-upload"
                            disabled={isViewMode}
                          />
                          {!isViewMode && (
                            <Button
                              type="button"
                              variant="outline"
                              className="mt-4"
                              onClick={() => document.getElementById("featured-image-upload")?.click()}
                            >
                              Choose Image
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Gallery Images
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Upload gallery images</p>
                        <p className="text-sm text-gray-500">Multiple images supported</p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleGalleryImageUpload}
                          className="hidden"
                          id="gallery-upload"
                          disabled={isViewMode}
                        />
                        {!isViewMode && (
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-4"
                            onClick={() => document.getElementById("gallery-upload")?.click()}
                          >
                            Choose Images
                          </Button>
                        )}
                      </div>

                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              {!isViewMode && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  className="absolute top-1 right-1"
                                  onClick={() => removeGalleryImage(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Features Tab */}
              <TabsContent value="features" className="space-y-6">
                {/* Highlights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Tour Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[...new Set([...predefinedHighlights, ...highlights])].map((item) => (
                        <div key={item} className="flex items-center space-x-2">
                          <Checkbox
                            id={`highlight-${item.replace(/\s+/g, '-')}`}
                            checked={highlights.includes(item)}
                            onCheckedChange={(checked) => handleCheckboxChange("highlights", item, checked === true)}
                            disabled={isViewMode}
                          />
                          <Label htmlFor={`highlight-${item.replace(/\s+/g, '-')}`}>{item}</Label>
                        </div>
                      ))}
                    </div>
                    {!isViewMode && (
                      <div className="flex gap-2 items-center">
                        <Input
                          placeholder="Add custom highlight"
                          value={customHighlightInput}
                          onChange={(e) => setCustomHighlightInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && customHighlightInput.trim() !== '') {
                              handleAddCustomHighlight()
                            }
                          }}
                        />
                        <Button type="button" onClick={handleAddCustomHighlight}>
                          Add
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Inclusions & Exclusions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>What's Included</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {[...new Set([...predefinedInclusions, ...inclusions])].map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={`inclusion-${item.replace(/\s+/g, '-')}`}
                              checked={inclusions.includes(item)}
                              onCheckedChange={(checked) => handleCheckboxChange("inclusions", item, checked === true)}
                              disabled={isViewMode}
                            />
                            <Label htmlFor={`inclusion-${item.replace(/\s+/g, '-')}`}>{item}</Label>
                          </div>
                        ))}
                      </div>
                      {!isViewMode && (
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Add custom inclusion"
                            value={customInclusionInput}
                            onChange={(e) => setCustomInclusionInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customInclusionInput.trim() !== '') {
                                handleAddCustomInclusion()
                              }
                            }}
                          />
                          <Button type="button" onClick={handleAddCustomInclusion}>
                            Add
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>What's Excluded</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {[...new Set([...predefinedExclusions, ...exclusions])].map((item) => (
                          <div key={item} className="flex items-center space-x-2">
                            <Checkbox
                              id={`exclusion-${item.replace(/\s+/g, '-')}`}
                              checked={exclusions.includes(item)}
                              onCheckedChange={(checked) => handleCheckboxChange("exclusions", item, checked === true)}
                              disabled={isViewMode}
                            />
                            <Label htmlFor={`exclusion-${item.replace(/\s+/g, '-')}`}>{item}</Label>
                          </div>
                        ))}
                      </div>
                      {!isViewMode && (
                        <div className="flex gap-2 items-center">
                          <Input
                            placeholder="Add custom exclusion"
                            value={customExclusionInput}
                            onChange={(e) => setCustomExclusionInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && customExclusionInput.trim() !== '') {
                                handleAddCustomExclusion()
                              }
                            }}
                          />
                          <Button type="button" onClick={handleAddCustomExclusion}>
                            Add
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Itinerary Tab */}
              <TabsContent value="itinerary" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Daily Itinerary
                      </span>
                      {!isViewMode && (
                        <Button type="button" variant="outline" size="sm" onClick={addItineraryDay}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Day
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {itineraryDays.map((day, dayIndex) => (
                      <div key={dayIndex} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">Day {day.day}</h4>
                          {!isViewMode && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItineraryDay(dayIndex)}
                              disabled={itineraryDays.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Day Title</Label>
                            <Input
                              placeholder="Day title"
                              value={day.title}
                              onChange={(e) => updateItineraryDay(dayIndex, "title", e.target.value)}
                              disabled={isViewMode}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                              placeholder="Location"
                              value={day.location}
                              onChange={(e) => updateItineraryDay(dayIndex, "location", e.target.value)}
                              disabled={isViewMode}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            placeholder="Describe the day's overview"
                            rows={3}
                            value={day.description}
                            onChange={(e) => updateItineraryDay(dayIndex, "description", e.target.value)}
                            disabled={isViewMode}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Activities</Label>
                          <Textarea
                            placeholder="List activities for this day"
                            rows={2}
                            value={day.activities}
                            onChange={(e) => updateItineraryDay(dayIndex, "activities", e.target.value)}
                            disabled={isViewMode}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Accommodation</Label>
                            <Input
                              placeholder="Where guests will stay"
                              value={day.accommodation}
                              onChange={(e) => updateItineraryDay(dayIndex, "accommodation", e.target.value)}
                              disabled={isViewMode}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Meals</Label>
                            <Input
                              placeholder="e.g., Breakfast, Lunch, Dinner"
                              value={day.meals}
                              onChange={(e) => updateItineraryDay(dayIndex, "meals", e.target.value)}
                              disabled={isViewMode}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Submit Actions */}
              {!isViewMode && (
                <div className="flex flex-col gap-4 pt-6 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        className="bg-forest-600 hover:bg-forest-700"
                        disabled={saving}
                      >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button type="button" variant="ghost" asChild>
                <Link href="/admin/tours">Cancel</Link>
              </Button>
            </div>
                  </div>
                </div>
              )}
            </Tabs>
          </form>
        </div>
      </div>
    </main>
  )
} 