import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Download, Eye, MessageSquare, Mail } from "lucide-react"
import LoadingSpinner from "@/components/ui/loading-spinner"
import CustomersClient from "./CustomersClient"

export const metadata = {
  title: "Customer Management - Samba Tours Admin",
  description: "Manage customer accounts and profiles.",
}

const getStatusColor = (status: "active" | "inactive" | "blocked") => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800"
    case "inactive":
      return "bg-gray-100 text-gray-800"
    case "blocked":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function CustomersManagement() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CustomersClient />
    </Suspense>
  )
}
