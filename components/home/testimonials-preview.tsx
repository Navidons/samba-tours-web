"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Quote, ArrowLeft, ArrowRight, Play, Heart } from "lucide-react"
import Link from "next/link"

const testimonials = [
  {
    id: 1,
    name: "Sarah & Michael Johnson",
    location: "California, USA",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
    tour: "Gorilla Trekking Adventure",
    date: "March 2024",
    text: "The most incredible experience of our lives! Meeting the mountain gorillas face-to-face was absolutely magical. David and his team made everything perfect - from the comfortable accommodations to the expert guidance. We felt completely safe and well-cared for throughout our journey.",
    highlight: "Life-changing experience",
    videoUrl: "/videos/testimonial-1.mp4",
  },
  {
    id: 2,
    name: "Emma Thompson",
    location: "London, UK",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
    tour: "Queen Elizabeth Wildlife Safari",
    date: "February 2024",
    text: "Samba Tours exceeded all expectations! The wildlife viewing was spectacular - we saw tree-climbing lions, elephants, hippos, and so much more. Our guide James was incredibly knowledgeable and passionate. The attention to detail and personalized service made this trip unforgettable.",
    highlight: "Exceeded all expectations",
    videoUrl: "/videos/testimonial-2.mp4",
  },
  {
    id: 3,
    name: "Hans & Greta Mueller",
    location: "Berlin, Germany",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
    tour: "Cultural Heritage Experience",
    date: "January 2024",
    text: "We wanted an authentic cultural experience and Samba Tours delivered beyond our dreams. The community visits were respectful and genuine, the traditional performances were captivating, and we learned so much about Ugandan culture. Highly recommend for anyone seeking meaningful travel.",
    highlight: "Authentic and respectful",
    videoUrl: "/videos/testimonial-3.mp4",
  },
  {
    id: 4,
    name: "Robert & Lisa Chen",
    location: "Sydney, Australia",
    image: "/placeholder.svg?height=100&width=100",
    rating: 5,
    tour: "Murchison Falls Safari",
    date: "December 2023",
    text: "From the moment we arrived until our departure, everything was flawlessly organized. The Murchison Falls were breathtaking, the boat safari was incredible, and seeing the Big Five was a dream come true. The team's professionalism and warmth made us feel like family.",
    highlight: "Flawlessly organized",
    videoUrl: "/videos/testimonial-4.mp4",
  },
]

const stats = [
  { value: "4.9/5", label: "Average Rating", icon: Star },
  { value: "2,847", label: "Reviews", icon: Quote },
  { value: "98%", label: "Recommend Us", icon: Heart },
]

export default function TestimonialsPreview() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
    setIsAutoPlaying(false)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-green-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-emerald-600 rounded-full blur-3xl"></div>
      </div>

      <div className="container-max px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-6 py-3 rounded-full text-sm font-bold mb-6 border border-green-200">
            <Quote className="h-4 w-4 mr-2" />
            What Our Travelers Say
          </div>

          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-6">
            Stories from
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Happy Adventurers
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Don't just take our word for it. Hear from thousands of travelers who have experienced the magic of Uganda
            with Samba Tours.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Testimonial Display */}
        <div className="max-w-6xl mx-auto mb-12">
          <Card className="bg-white border-0 shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Left Side - Testimonial Content */}
                <div className="p-12 flex flex-col justify-center">
                  <div className="mb-6">
                    <Quote className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-6 font-medium">
                      "{currentTestimonial.text}"
                    </p>

                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 mb-6">
                      <p className="text-green-800 font-bold text-lg">"{currentTestimonial.highlight}"</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-green-200">
                        <img
                          src={currentTestimonial.image || "/placeholder.svg"}
                          alt={currentTestimonial.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{currentTestimonial.name}</h4>
                        <p className="text-gray-600">{currentTestimonial.location}</p>
                        <p className="text-green-600 font-medium text-sm">{currentTestimonial.tour}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm">{currentTestimonial.date}</p>
                    </div>
                  </div>
                </div>

                {/* Right Side - Video/Image */}
                <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center min-h-[400px]">
                  <div className="absolute inset-0 bg-black/20"></div>
                  <div className="relative text-center text-white">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 hover:bg-white/30 transition-colors cursor-pointer group">
                      <Play className="h-12 w-12 text-white group-hover:scale-110 transition-transform" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Watch Their Story</h3>
                    <p className="text-green-100">See their amazing journey</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center space-x-6 mb-12">
          <Button
            variant="outline"
            size="lg"
            onClick={prevTestimonial}
            className="w-14 h-14 rounded-full border-2 border-green-300 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-300 bg-transparent"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>

          <div className="flex space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsAutoPlaying(false)
                }}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 w-12 h-4"
                    : "bg-gray-300 hover:bg-gray-400 w-4 h-4"
                }`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="lg"
            onClick={nextTestimonial}
            className="w-14 h-14 rounded-full border-2 border-green-300 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all duration-300 bg-transparent"
          >
            <ArrowRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Testimonial Grid Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 ${
                index === currentIndex ? "ring-2 ring-green-500 shadow-xl" : ""
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 line-clamp-3">{testimonial.text}</p>
                <div className="flex items-center justify-between">
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-green-600 text-sm font-medium">{testimonial.date}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-6 text-lg font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            asChild
          >
            <Link href="/reviews">
              Read More Reviews
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
