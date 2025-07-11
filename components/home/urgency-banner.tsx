"use client"

import { useState, useEffect } from "react"
import { X, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function UrgencyBanner() {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState({
    days: 7,
    hours: 12,
    minutes: 45,
    seconds: 30,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 }
        }
        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white py-3 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6 flex-1">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 animate-pulse" />
            <span className="font-bold text-lg">LIMITED TIME OFFER!</span>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm">Save 25% on Gorilla Trekking - Only</span>
            <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-3 py-1">
              <div className="text-center">
                <div className="font-bold text-lg">{timeLeft.days}</div>
                <div className="text-xs">DAYS</div>
              </div>
              <span className="text-xl">:</span>
              <div className="text-center">
                <div className="font-bold text-lg">{timeLeft.hours}</div>
                <div className="text-xs">HRS</div>
              </div>
              <span className="text-xl">:</span>
              <div className="text-center">
                <div className="font-bold text-lg">{timeLeft.minutes}</div>
                <div className="text-xs">MIN</div>
              </div>
              <span className="text-xl">:</span>
              <div className="text-center">
                <div className="font-bold text-lg">{timeLeft.seconds}</div>
                <div className="text-xs">SEC</div>
              </div>
            </div>
            <span className="text-sm">left!</span>
          </div>

          <div className="flex items-center space-x-2 bg-white/20 rounded-full px-3 py-1">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">47 people viewing</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            size="sm"
            className="bg-white text-red-600 hover:bg-gray-100 font-bold px-6 py-2 rounded-full shadow-lg"
            asChild
          >
            <Link href="/tours?category=gorilla-trekking">Claim Offer Now</Link>
          </Button>

          <button onClick={() => setIsVisible(false)} className="text-white/80 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
