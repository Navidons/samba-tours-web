import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding blog comments...')

  // Get the first blog post to add comments to
  const blogPost = await prisma.blogPost.findFirst({
    where: { status: 'published' },
    select: { id: true, title: true }
  })

  if (!blogPost) {
    console.log('No published blog posts found. Please create a blog post first.')
    return
  }

  console.log(`Adding comments to blog post: ${blogPost.title}`)

  // Create sample comments
  const comments = [
    {
      postId: blogPost.id,
      authorName: "Sarah Johnson",
      authorEmail: "sarah.johnson@example.com",
      content: "This guide is incredibly helpful! We're planning our gorilla trekking trip for next month and this answered all our questions. Thank you for the detailed preparation tips.",
      status: "approved" as const,
      likes: 12,
    },
    {
      postId: blogPost.id,
      authorName: "Michael Chen",
      authorEmail: "michael.chen@example.com",
      content: "Just returned from our gorilla trek with Samba Tours. Everything mentioned in this article is spot on. The experience was absolutely magical!",
      status: "approved" as const,
      likes: 8,
    },
    {
      postId: blogPost.id,
      authorName: "Emma Rodriguez",
      authorEmail: "emma.rodriguez@example.com",
      content: "I'm so excited to visit Uganda! This article has given me so much confidence about planning our trip. The tips about what to pack are especially useful.",
      status: "approved" as const,
      likes: 5,
    },
    {
      postId: blogPost.id,
      authorName: "David Thompson",
      authorEmail: "david.thompson@example.com",
      content: "Great article! I've been to Uganda twice and can confirm that the information here is accurate. The wildlife is truly spectacular.",
      status: "approved" as const,
      likes: 15,
    },
    {
      postId: blogPost.id,
      authorName: "Lisa Wang",
      authorEmail: "lisa.wang@example.com",
      content: "This is exactly what I needed! Planning a solo trip and was worried about safety, but this guide has put my mind at ease.",
      status: "approved" as const,
      likes: 7,
    }
  ]

  // Insert comments
  for (const commentData of comments) {
    const comment = await prisma.blogComment.create({
      data: commentData
    })
    console.log(`Created comment: ${comment.authorName}`)
  }

  // Create some replies
  const firstComment = await prisma.blogComment.findFirst({
    where: { authorName: "Sarah Johnson" }
  })

  if (firstComment) {
    const replies = [
      {
        postId: blogPost.id,
        authorName: "James Okello",
        authorEmail: "james.okello@sambatours.com",
        content: "Thank you Sarah! Feel free to reach out if you have any other questions. We're here to help make your gorilla trekking experience unforgettable.",
        status: "approved" as const,
        likes: 5,
        parentCommentId: firstComment.id,
      },
      {
        postId: blogPost.id,
        authorName: "Maria Garcia",
        authorEmail: "maria.garcia@example.com",
        content: "I had the same questions! This article really helped me prepare for my trip last year. You're going to love it!",
        status: "approved" as const,
        likes: 3,
        parentCommentId: firstComment.id,
      }
    ]

    for (const replyData of replies) {
      const reply = await prisma.blogComment.create({
        data: replyData
      })
      console.log(`Created reply from: ${reply.authorName}`)
    }
  }

  // Create a reply to Michael's comment
  const michaelComment = await prisma.blogComment.findFirst({
    where: { authorName: "Michael Chen" }
  })

  if (michaelComment) {
    const reply = await prisma.blogComment.create({
      data: {
        postId: blogPost.id,
        authorName: "Anna Smith",
        authorEmail: "anna.smith@example.com",
        content: "That's amazing! I'm planning to go next year. Any specific tips you'd add to this guide?",
        status: "approved" as const,
        likes: 2,
        parentCommentId: michaelComment.id,
      }
    })
    console.log(`Created reply from: ${reply.authorName}`)
  }

  // Update comment count on the blog post
  const commentCount = await prisma.blogComment.count({
    where: { 
      postId: blogPost.id,
      status: 'approved'
    }
  })

  await prisma.blogPost.update({
    where: { id: blogPost.id },
    data: { commentCount }
  })

  console.log(`✅ Seeded ${commentCount} comments for blog post: ${blogPost.title}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 