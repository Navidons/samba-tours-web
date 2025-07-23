import { NextResponse } from 'next/server'
import { SEO_CONFIG } from '@/lib/seo'

async function getBlogPosts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://sambatours.co')
    const response = await fetch(`${baseUrl}/api/blog?limit=50`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) {
      console.error('Failed to fetch blog posts for RSS')
      return []
    }
    
    const data = await response.json()
    return data.posts || []
  } catch (error) {
    console.error('Error fetching blog posts for RSS:', error)
    return []
  }
}

export async function GET() {
  const posts = await getBlogPosts()
  
  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:wfw="http://wellformedweb.org/CommentAPI/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
     xmlns:slash="http://purl.org/rss/1.0/modules/slash/">
  <channel>
    <title><![CDATA[${SEO_CONFIG.siteName} Blog]]></title>
    <description><![CDATA[Latest travel tips, safari guides, and Uganda adventure stories from ${SEO_CONFIG.siteName}]]></description>
    <link>${SEO_CONFIG.siteUrl}/blog</link>
    <atom:link href="${SEO_CONFIG.siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>en-US</language>
    <copyright><![CDATA[© ${new Date().getFullYear()} ${SEO_CONFIG.organization.name}]]></copyright>
    <managingEditor><![CDATA[${SEO_CONFIG.organization.email} (${SEO_CONFIG.organization.name})]]></managingEditor>
    <webMaster><![CDATA[${SEO_CONFIG.organization.email} (${SEO_CONFIG.organization.name})]]></webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <category><![CDATA[Travel]]></category>
    <category><![CDATA[Safari]]></category>
    <category><![CDATA[Uganda]]></category>
    <category><![CDATA[Adventure]]></category>
    <generator>Next.js</generator>
    <ttl>60</ttl>
    <image>
      <url>${SEO_CONFIG.siteUrl}/images/logo.png</url>
      <title><![CDATA[${SEO_CONFIG.siteName} Blog]]></title>
      <link>${SEO_CONFIG.siteUrl}/blog</link>
      <description><![CDATA[Latest travel tips, safari guides, and Uganda adventure stories]]></description>
      <width>144</width>
      <height>144</height>
    </image>
    ${posts.map((post: any) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt || post.metaDescription || ''}]]></description>
      <content:encoded><![CDATA[${post.content || post.excerpt || ''}]]></content:encoded>
      <link>${SEO_CONFIG.siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SEO_CONFIG.siteUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishDate || post.createdAt).toUTCString()}</pubDate>
      ${post.author?.name ? `<dc:creator><![CDATA[${post.author.name}]]></dc:creator>` : ''}
      ${post.category?.name ? `<category><![CDATA[${post.category.name}]]></category>` : ''}
      ${post.tags?.map((tag: any) => `<category><![CDATA[${tag.tag?.name || tag.name}]]></category>`).join('') || ''}
      ${post.featuredImage ? `<enclosure url="${post.featuredImage.startsWith('http') ? post.featuredImage : SEO_CONFIG.siteUrl + post.featuredImage}" type="image/jpeg" />` : ''}
    </item>`).join('')}
  </channel>
</rss>`

  return new NextResponse(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
} 
