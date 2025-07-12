"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TestConfirmationPage() {
  const router = useRouter()

  useEffect(() => {
    console.log('Test confirmation page loaded')
    
    // Redirect to confirmation page with test data
    const testData = {
      reference: 'TEST123',
      name: 'Test User',
      email: 'test@example.com',
      total: '1000',
      guests: '2',
      tour: 'Test Tour',
      date: '2025-07-18',
      price: '500'
    }

    const params = new URLSearchParams(testData)
    const confirmationUrl = `/booking-confirmation?${params.toString()}`
    
    console.log('Redirecting to:', confirmationUrl)
    router.replace(confirmationUrl)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Testing Confirmation Page</h1>
        <p>Redirecting to confirmation page...</p>
      </div>
    </div>
  )
} 