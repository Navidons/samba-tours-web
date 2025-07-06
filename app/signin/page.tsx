import type { Metadata } from "next"
import SignInForm from "@/components/auth/signin-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sign In - Samba Tours & Travel",
  description: "Sign in to your Samba Tours account",
}

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">ST</span>
            </div>
            <div>
              <h1 className="font-playfair text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Samba Tours
              </h1>
              <p className="text-sm text-orange-600">& Travel</p>
            </div>
          </div>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Sign in to your account to continue your adventure</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10 border border-orange-100">
          <SignInForm />
        </div>
      </div>
    </div>
  )
}
