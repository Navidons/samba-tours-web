"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, User, Eye, Heart, Facebook, Twitter, Linkedin, LinkIcon, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"

interface Post {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  contentHtml: string | null
  status: string
  publishDate: string | null
  readTimeMinutes: number | null
  viewCount: number
  likeCount: number
  commentCount: number
  featured: boolean
  thumbnail: string | null
  category: {
    id: number
    name: string
    slug: string
  } | null
  author: {
    id: number
    name: string
    email: string | null
    bio: string | null
  } | null
  tags: Array<{
    id: number
    name: string
    slug: string
    color: string
  }>
  createdAt: string
  updatedAt: string
}

interface BlogPostHeaderProps {
  post: Post
}

export default function BlogPostHeader({ post }: BlogPostHeaderProps) {
  const [shareUrl, setShareUrl] = useState("")
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    // Ensure window is defined before using it
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href)
    }
  }, [])

  const handleShare = (platform: "facebook" | "twitter" | "linkedin") => {
    if (!shareUrl) return

    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(post.title)
    const encodedExcerpt = encodeURIComponent(post.excerpt)

    let url = ""
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`
        break
      case "linkedin":
        url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedExcerpt}`
        break
    }
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleCopyLink = () => {
    if (!shareUrl) return

    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        setIsCopied(true)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch((err) => {
        console.error("Failed to copy: ", err)
        toast.error("Failed to copy link.")
      })
  }

  return (
    <header className="relative bg-gray-800 text-white py-20 md:py-32">
      <div className="absolute inset-0">
        {post.thumbnail ? (
          <Image src={post.thumbnail} alt={post.title} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-emerald-200 to-green-100 flex items-center justify-center">
            <span className="text-4xl font-bold text-emerald-700 opacity-60">{post.title}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent" />
      </div>

      <div className="container-max relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {post.category && (
            <Link href={`/blog/category/${post.category.slug}`}>
              <Badge
                variant="secondary"
                className="mb-4 bg-emerald-500/20 text-emerald-300 border-emerald-400/30 hover:bg-emerald-500/30"
              >
                {post.category.name}
              </Badge>
            </Link>
          )}
          <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-4 text-balance">{post.title}</h2>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-200 mb-8">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{post.author?.name || "Unknown Author"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>
                {post.publishDate ? new Date(post.publishDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "Not published"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTimeMinutes ? `${post.readTimeMinutes} min read` : "N/A"}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-gray-200">
                <Eye className="h-4 w-4" />
                <span className="text-xs">{(post.viewCount ?? 0).toLocaleString()} views</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-200">
                <Heart className="h-4 w-4" />
                <span className="text-xs">{(post.likeCount ?? 0).toLocaleString()} likes</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-200">Share:</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-8 w-8 bg-white/10 border-white/20 hover:bg-white/20 text-white"
                      onClick={() => handleShare("facebook")}
                    >
                      <Facebook className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share on Facebook</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-8 w-8 bg-white/10 border-white/20 hover:bg-white/20 text-white"
                      onClick={() => handleShare("twitter")}
                    >
                      <Twitter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share on Twitter</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-8 w-8 bg-white/10 border-white/20 hover:bg-white/20 text-white"
                      onClick={() => handleShare("linkedin")}
                    >
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share on LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="rounded-full h-8 w-8 bg-white/10 border-white/20 hover:bg-white/20 text-white"
                      onClick={handleCopyLink}
                    >
                      {isCopied ? <Check className="h-4 w-4 text-green-400" /> : <LinkIcon className="h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isCopied ? "Copied!" : "Copy link"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
