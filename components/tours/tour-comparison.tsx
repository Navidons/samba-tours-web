"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  X,
  Star,
  Clock,
  Users,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowRight,
  Scale,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Tour } from "@/lib/data"

interface TourComparisonProps {
  tours: Tour[]
  onRemoveTour: (tourId: string) => void
  onClearAll: () => void
}

export default function TourComparison({ tours, onRemoveTour, onClearAll }: TourComparisonProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (tours.length === 0) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-lg"
          size="lg"
        >
          <Scale className="h-5 w-5 mr-2" />
          Compare Tours ({tours.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Tour Comparison ({tours.length} tours)
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearAll}
              className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 bg-transparent"
            >
              Clear All
            </Button>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {tours.map((tour) => (
            <Card key={tour.id} className="relative border-emerald-100 shadow-lg">
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-2 right-2 z-10 h-8 w-8 p-0 hover:bg-emerald-100"
                onClick={() => onRemoveTour(tour.id)}
              >
                <X className="h-4 w-4 text-emerald-600" />
              </Button>

              <div className="relative">
                <Image
                  src={tour.images[0]}
                  alt={tour.title}
                  width={300}
                  height={200}
                  className="w-full h-40 object-cover rounded-t-lg"
                />
                <Badge className="absolute top-3 left-3 bg-emerald-600 text-white">{tour.category}</Badge>
              </div>

              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{tour.title}</h3>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>
                      {tour.location.region}, {tour.location.country}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium">{tour.rating}</span>
                  </div>
                  <span className="text-sm text-gray-600">({tour.reviewCount} reviews)</span>
                </div>

                {/* Key Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Duration</span>
                    </div>
                    <span className="font-medium">{tour.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Group Size</span>
                    </div>
                    <span className="font-medium">{tour.groupSize}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>Price</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-gray-900">${tour.price}</span>
                      {tour.originalPrice && (
                        <div className="text-xs text-gray-500 line-through">${tour.originalPrice}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Difficulty</span>
                    <Badge
                      variant="outline"
                      className={
                        tour.difficulty === "Easy"
                          ? "border-emerald-200 text-emerald-700"
                          : tour.difficulty === "Moderate"
                            ? "border-green-200 text-green-700"
                            : "border-yellow-200 text-yellow-700"
                      }
                    >
                      {tour.difficulty}
                    </Badge>
                  </div>
                </div>

                {/* Highlights */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Highlights</h4>
                  <div className="space-y-1">
                    {tour.highlights.slice(0, 4).map((highlight, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <CheckCircle className="h-3 w-3 text-emerald-600 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </div>
                    ))}
                    {tour.highlights.length > 4 && (
                      <div className="text-xs text-gray-500">+{tour.highlights.length - 4} more highlights</div>
                    )}
                  </div>
                </div>

                {/* What's Included/Excluded Preview */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <h5 className="font-medium text-emerald-700 mb-1">Included</h5>
                    <div className="space-y-1">
                      {tour.included.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="h-3 w-3 text-emerald-600 mr-1 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 leading-tight">{item}</span>
                        </div>
                      ))}
                      {tour.included.length > 3 && (
                        <div className="text-gray-500">+{tour.included.length - 3} more</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h5 className="font-medium text-red-700 mb-1">Excluded</h5>
                    <div className="space-y-1">
                      {tour.excluded.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-start">
                          <XCircle className="h-3 w-3 text-red-600 mr-1 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600 leading-tight">{item}</span>
                        </div>
                      ))}
                      {tour.excluded.length > 3 && (
                        <div className="text-gray-500">+{tour.excluded.length - 3} more</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                    asChild
                  >
                    <Link href={`/tours/${tour.slug}`}>
                      View Details
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Summary */}
        {tours.length > 1 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
            <h3 className="font-semibold text-lg text-gray-900 mb-4">Quick Comparison</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Price Range:</span>
                <div className="font-medium">
                  ${Math.min(...tours.map((t) => t.price))} - ${Math.max(...tours.map((t) => t.price))}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Duration Range:</span>
                <div className="font-medium">{tours.map((t) => t.duration).join(", ")}</div>
              </div>
              <div>
                <span className="text-gray-600">Avg Rating:</span>
                <div className="font-medium flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  {(tours.reduce((sum, t) => sum + t.rating, 0) / tours.length).toFixed(1)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Categories:</span>
                <div className="font-medium">{[...new Set(tours.map((t) => t.category))].join(", ")}</div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
