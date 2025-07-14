"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Star, Upload, X } from "lucide-react"
import { toast } from "sonner"

interface ReviewFormProps {
  tourId: string
  onSubmit: (review: any) => void
  onClose: () => void
}

export function ReviewForm({ tourId, onSubmit, onClose }: ReviewFormProps) {
  const pathname = usePathname()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 0,
    title: "",
    comment: "",
    tourDate: "",
    wouldRecommend: true,
  })
  const [images, setImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.rating || !formData.comment) {
      toast.error("Please fill in all required fields")
      return
    }

    if (formData.rating === 0) {
      toast.error("Please select a rating")
      return
    }

    setIsSubmitting(true)

    try {
      // Get the current tour slug from the URL
      const pathSegments = pathname.split('/')
      const tourSlug = pathSegments[pathSegments.length - 1]

      const response = await fetch(`/api/tours/${tourSlug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: formData.rating,
          title: formData.title,
          content: formData.comment,
          reviewerName: formData.name,
          reviewerEmail: formData.email,
          tourDate: formData.tourDate,
          wouldRecommend: formData.wouldRecommend,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit review')
      }

      onSubmit({
        ...formData,
        images,
      })

      toast.success("Review submitted successfully!")
    } catch (error) {
      console.error('Error submitting review:', error)
      toast.error(error instanceof Error ? error.message : "Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages((prev) => [...prev, e.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Write a Review</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name" className="text-gray-900 font-medium">
                Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gray-900 font-medium">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="mt-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Tour Date */}
          <div>
            <Label htmlFor="tourDate" className="text-gray-900 font-medium">
              When did you take this tour? *
            </Label>
            <Input
              id="tourDate"
              type="date"
              value={formData.tourDate}
              onChange={(e) => setFormData((prev) => ({ ...prev, tourDate: e.target.value }))}
              className="mt-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Rating */}
          <div>
            <Label className="text-gray-900 font-medium mb-2 block">Overall Rating *</Label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, rating }))}
                  onMouseEnter={() => setHoveredRating(rating)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      rating <= (hoveredRating || formData.rating) ? "text-yellow-500 fill-current" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-gray-600">
                {formData.rating > 0 && (
                  <>
                    {formData.rating} star{formData.rating !== 1 ? "s" : ""} -{formData.rating === 5 && " Excellent"}
                    {formData.rating === 4 && " Very Good"}
                    {formData.rating === 3 && " Good"}
                    {formData.rating === 2 && " Fair"}
                    {formData.rating === 1 && " Poor"}
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Review Title */}
          <div>
            <Label htmlFor="title" className="text-gray-900 font-medium">
              Review Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Summarize your experience"
              className="mt-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>

          {/* Review Comment */}
          <div>
            <Label htmlFor="comment" className="text-gray-900 font-medium">
              Your Review *
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="Tell others about your experience..."
              rows={5}
              className="mt-1 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Photo Upload */}
          <div>
            <Label className="text-gray-900 font-medium mb-2 block">Add Photos (Optional)</Label>
            <div className="border-2 border-dashed border-emerald-200 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <Upload className="h-8 w-8 text-emerald-400 mb-2" />
                <span className="text-gray-600">Click to upload photos</span>
                <span className="text-sm text-gray-500">PNG, JPG up to 5MB each</span>
              </label>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Upload ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendation */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="recommend"
              checked={formData.wouldRecommend}
              onChange={(e) => setFormData((prev) => ({ ...prev, wouldRecommend: e.target.checked }))}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <Label htmlFor="recommend" className="text-gray-900">
              I would recommend this tour to others
            </Label>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
