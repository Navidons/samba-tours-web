"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ThumbsUp, Flag, MessageCircle } from "lucide-react"
import { ReviewForm } from "./review-form"
import { ReviewFilters } from "./review-filters"

interface Review {
  id: string
  userId: string
  userName: string
  userImage: string
  rating: number
  title: string
  comment: string
  date: string
  verified: boolean
  helpful: number
  tourDate: string
  images?: string[]
  response?: {
    author: string
    date: string
    message: string
  }
}

interface TourReviewsProps {
  tourId: string
  rating: number
  reviewCount: number
  reviews: Review[]
  onAddReview?: (review: any) => void
}

export default function TourReviews({
  tourId,
  rating,
  reviewCount,
  reviews: initialReviews = [],
  onAddReview,
}: TourReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest" | "helpful">("newest")
  const [filterBy, setFilterBy] = useState<"all" | "5" | "4" | "3" | "2" | "1">("all")

  const handleAddReview = (newReview: any) => {
    const review: Review = {
      id: Date.now().toString(),
      userId: "current-user",
      userName: newReview.name,
      userImage: "/placeholder.svg?height=50&width=50",
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      date: new Date().toISOString(),
      verified: false,
      helpful: 0,
      tourDate: newReview.tourDate,
      images: newReview.images || [],
    }

    setReviews((prev) => [review, ...prev])
    setShowReviewForm(false)
    onAddReview?.(review)
  }

  const handleHelpful = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((review) => (review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review)),
    )
  }

  const filteredAndSortedReviews = reviews
    .filter((review) => filterBy === "all" || review.rating.toString() === filterBy)
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "highest":
          return b.rating - a.rating
        case "lowest":
          return a.rating - b.rating
        case "helpful":
          return b.helpful - a.helpful
        default:
          return 0
      }
    })

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0 ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 : 0,
  }))

  return (
    <Card className="border-emerald-100 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <Star className="h-6 w-6 text-emerald-600" />
            <span className="text-gray-900">Customer Reviews</span>
          </CardTitle>
          <Button onClick={() => setShowReviewForm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <MessageCircle className="h-4 w-4 mr-2" />
            Write a Review
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {/* Review Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-emerald-600 mb-2">{rating}</div>
            <div className="flex justify-center items-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${i < Math.floor(rating) ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-gray-600">{reviewCount} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="lg:col-span-2">
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 w-8">{rating}★</span>
                  <div className="flex-1 bg-emerald-100 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Review Filters */}
        <ReviewFilters
          sortBy={sortBy}
          setSortBy={setSortBy}
          filterBy={filterBy}
          setFilterBy={setFilterBy}
          reviewCount={filteredAndSortedReviews.length}
        />

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredAndSortedReviews.length > 0 ? (
            filteredAndSortedReviews.map((review) => (
              <div key={review.id} className="border-b border-emerald-100 pb-6 last:border-b-0">
                <div className="flex items-start space-x-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={review.userImage}
                      alt={review.userName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                        <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                        {review.verified && (
                          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">Verified</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {review.title && <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>}

                    <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex space-x-2 mb-3">
                        {review.images.map((image, index) => (
                          <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={image}
                              alt={`Review image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleHelpful(review.id)}
                          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-emerald-600 transition-colors"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>Helpful ({review.helpful})</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                          <Flag className="h-4 w-4" />
                          <span>Report</span>
                        </button>
                      </div>
                      <span className="text-sm text-gray-500">
                        Tour date: {new Date(review.tourDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Company Response */}
                    {review.response && (
                      <div className="mt-4 bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-500">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900">Response from {review.response.author}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(review.response.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{review.response.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No reviews found matching your filters.</p>
            </div>
          )}
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <ReviewForm
            tourId={tourId}
            onSubmit={handleAddReview}
            onClose={() => setShowReviewForm(false)}
          />
        )}
      </CardContent>
    </Card>
  )
}
