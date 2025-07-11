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
    <Card className="border-orange-100 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <CardTitle className="flex items-center space-x-2 text-2xl">
            <Star className="h-6 w-6 text-orange-600" />
            <span className="text-earth-900">Customer Reviews</span>
          </CardTitle>
          <Button onClick={() => setShowReviewForm(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
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
            <div className="text-5xl font-bold text-orange-600 mb-2">{rating}</div>
            <div className="flex justify-center items-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${i < Math.floor(rating) ? "text-yellow-500 fill-current" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-earth-600">{reviewCount} reviews</p>
          </div>

          {/* Rating Distribution */}
          <div className="lg:col-span-2">
            <div className="space-y-2">
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-earth-700 w-8">{rating}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-earth-600 w-8">{count}</span>
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
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start space-x-4">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={review.userImage || "/placeholder.svg"}
                      alt={review.userName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                        <h4 className="font-semibold text-earth-900">{review.userName}</h4>
                        {review.verified && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                          ))}
                        </div>
                        <span className="text-sm text-earth-500">{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {review.title && <h5 className="font-medium text-earth-900 mb-2">{review.title}</h5>}

                    <p className="text-earth-700 leading-relaxed mb-3">{review.comment}</p>

                    {review.images && review.images.length > 0 && (
                      <div className="flex space-x-2 mb-3">
                        {review.images.map((image, index) => (
                          <div key={index} className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={image || "/placeholder.svg"}
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
                          className="flex items-center space-x-1 text-sm text-earth-600 hover:text-orange-600 transition-colors"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>Helpful ({review.helpful})</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm text-earth-600 hover:text-red-600 transition-colors">
                          <Flag className="h-4 w-4" />
                          <span>Report</span>
                        </button>
                      </div>
                      <span className="text-sm text-earth-500">
                        Tour date: {new Date(review.tourDate).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Company Response */}
                    {review.response && (
                      <div className="mt-4 bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-earth-900">Response from {review.response.author}</span>
                          <span className="text-sm text-earth-500">
                            {new Date(review.response.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-earth-700">{review.response.message}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-earth-900 mb-2">No reviews yet</h3>
              <p className="text-earth-600 mb-4">Be the first to share your experience!</p>
              <Button onClick={() => setShowReviewForm(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
                Write the First Review
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm tourId={tourId} onSubmit={handleAddReview} onClose={() => setShowReviewForm(false)} />
      )}
    </Card>
  )
}
