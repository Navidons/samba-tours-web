import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import LoadingSpinner from "@/components/ui/loading-spinner"
import BlogManagementClient from "./BlogManagementClient"

export const metadata = {
  title: "Blog Management - Samba Tours Admin",
  description: "Manage blog posts and content.",
}

export default function BlogManagement() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="section-padding">
        <div className="container-max">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-earth-900 mb-2">Blog Management</h1>
              <p className="text-earth-600">Manage blog posts and content</p>
            </div>
            <Button asChild className="bg-forest-600 hover:bg-forest-700">
              <Link href="/admin/blog/new">
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Link>
            </Button>
          </div>

          {/* Blog Management Client */}
          <Suspense fallback={<LoadingSpinner />}>
            <BlogManagementClient />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
