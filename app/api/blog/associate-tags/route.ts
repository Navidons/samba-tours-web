import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    // Get all blog posts and tags
    const [posts, tags] = await Promise.all([
      prisma.blogPost.findMany({
        where: { status: 'published' },
        select: { id: true, title: true }
      }),
      prisma.blogTag.findMany({
        select: { id: true, name: true }
      })
    ])

    if (posts.length === 0) {
      return NextResponse.json({ error: "No published blog posts found" }, { status: 404 })
    }

    if (tags.length === 0) {
      return NextResponse.json({ error: "No tags found" }, { status: 404 })
    }

    // Associate each post with 1-3 random tags
    const associations = []
    for (const post of posts) {
      // Get 1-3 random tags for each post
      const numTags = Math.floor(Math.random() * 3) + 1
      const shuffledTags = tags.sort(() => 0.5 - Math.random())
      const selectedTags = shuffledTags.slice(0, numTags)

      for (const tag of selectedTags) {
        associations.push({
          postId: post.id,
          tagId: tag.id
        })
      }
    }

    // Insert the associations
    const result = await prisma.blogPostTagMapping.createMany({
      data: associations,
      skipDuplicates: true
    })

    return NextResponse.json({
      message: `Associated ${result.count} tags with blog posts`,
      posts: posts.length,
      tags: tags.length,
      associations: result.count
    })

  } catch (error) {
    console.error("Error associating tags:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 
