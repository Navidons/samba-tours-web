import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Bookmark, Twitter, Facebook, Linkedin } from "lucide-react"

interface BlogPost {
  id: number
  title: string
  content: string
  tags: string[]
  likes: number
}

interface BlogPostContentProps {
  post: BlogPost
}

export default function BlogPostContent({ post }: BlogPostContentProps) {
  // Convert any h1 tags to h2 tags in the content
  const sanitizedContent = post.content.replace(/<h1/g, '<h2').replace(/<\/h1>/g, '</h2>')

  return (
    <article className="bg-white rounded-lg shadow-sm p-8 lg:p-12 mb-8">
      {/* Article Content */}
      <div
        className="prose prose-lg max-w-none prose-headings:font-playfair prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-li:text-gray-700 prose-blockquote:border-emerald-500 prose-blockquote:text-gray-600"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />

      {/* Tags */}
      <div className="mt-10 pt-8 border-t border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-4">Tags:</h4>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="hover:bg-emerald-100 cursor-pointer text-sm px-3 py-1">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Social Actions */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Like ({post.likes})
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Save for later
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 mr-3">Share this article:</span>
            <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50 rounded-full">
              <Twitter className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-blue-800 hover:bg-blue-50 rounded-full">
              <Facebook className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-blue-700 hover:bg-blue-50 rounded-full">
              <Linkedin className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
