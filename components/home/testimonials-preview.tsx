"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, ArrowRight } from "lucide-react"
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
  },
]

export default function TestimonialsPreview() {

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-green-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-72 h-72 bg-green-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-20 w-96 h-96 bg-emerald-600 rounded-full blur-3xl"></div>
      </div>

      <div className="container-max px-4 relative">
        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2"
            >
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
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
