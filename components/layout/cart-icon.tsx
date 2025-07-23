"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

export default function CartIcon() {
  const { getItemCount } = useCart()
  const itemCount = getItemCount()

  return (
    <Link href="/cart" className="relative">
      <ShoppingCart className="h-6 w-6 text-gray-700 hover:text-green-600 transition-colors" />
      {itemCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center p-0">
          {itemCount}
        </Badge>
      )}
    </Link>
  )
} 
