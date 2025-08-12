import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function xmlEscape(str: string) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sambatours.co'

  try {
    // Fetch sources in parallel
    const [galleryRes, toursRes, blogsRes] = await Promise.all([
      fetch(`${baseUrl}/api/gallery/images?limit=1000`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/api/tours?limit=1000`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/api/blog?limit=1000`, { next: { revalidate: 3600 } }),
    ])

    const [galleryData, toursData, blogsData] = await Promise.all([
      galleryRes.ok ? galleryRes.json() : Promise.resolve({ images: [] }),
      toursRes.ok ? toursRes.json() : Promise.resolve({ tours: [] }),
      blogsRes.ok ? blogsRes.json() : Promise.resolve({ posts: [] }),
    ])

    const now = new Date().toISOString()

    type UrlEntry = { loc: string; lastmod?: string; images: { loc: string; title?: string; caption?: string }[] }

    const urls: UrlEntry[] = []

    // Gallery images (each image has its own URL entry pointing to the gallery page with image loc)
    ;(galleryData.images || []).forEach((img: any) => {
      const loc = `${baseUrl}/gallery`
      const imgLoc = `${baseUrl}/api/gallery/images/${img.id}`
      urls.push({
        loc,
        lastmod: now,
        images: [{ loc: imgLoc, title: img.title || '', caption: img.description || img.alt || '' }],
      })
    })

    // Tours featured images
    ;(toursData.tours || []).forEach((t: any) => {
      const loc = `${baseUrl}/tours/${t.slug}`
      const imgLoc = t.featuredImageUrl ? `${baseUrl}${t.featuredImageUrl}` : ''
      if (imgLoc) {
        urls.push({ loc, lastmod: now, images: [{ loc: imgLoc, title: t.title, caption: t.shortDescription || '' }] })
      }
    })

    // Blog post thumbnails
    ;(blogsData.posts || []).forEach((p: any) => {
      const loc = `${baseUrl}/blog/${p.slug}`
      const imgLoc = p.thumbnail ? `${baseUrl}${p.thumbnail}` : ''
      if (imgLoc) {
        urls.push({ loc, lastmod: p.updatedAt || now, images: [{ loc: imgLoc, title: p.title, caption: p.excerpt || '' }] })
      }
    })

    // Also include images located in the public folder (file-based assets)
    try {
      const publicDir = path.join(process.cwd(), 'public')
      const includeDirs = ['photos', 'tours-attractions', 'home-hero-photos', 'logo']
      const exts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

      const walk = (dirRel: string) => {
        const abs = path.join(publicDir, dirRel)
        if (!fs.existsSync(abs)) return
        const entries = fs.readdirSync(abs, { withFileTypes: true })
        for (const entry of entries) {
          const entryRel = path.join(dirRel, entry.name).replace(/\\/g, '/')
          const entryAbs = path.join(publicDir, entryRel)
          if (entry.isDirectory()) {
            walk(entryRel)
          } else {
            const ext = path.extname(entry.name).toLowerCase()
            if (exts.has(ext)) {
              const imgLoc = `${baseUrl}/${entryRel}`
              // Attach file-based images to the gallery page URL as a catch-all
              urls.push({ loc: `${baseUrl}/gallery`, lastmod: now, images: [{ loc: imgLoc, title: path.parse(entry.name).name }] })
            }
          }
        }
      }

      for (const d of includeDirs) {
        walk(d)
      }
    } catch {}

    // Build XML
    const xmlParts: string[] = []
    xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>')
    xmlParts.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">')
    for (const u of urls) {
      xmlParts.push('<url>')
      xmlParts.push(`<loc>${xmlEscape(u.loc)}</loc>`) 
      if (u.lastmod) xmlParts.push(`<lastmod>${u.lastmod}</lastmod>`) 
      for (const im of u.images) {
        xmlParts.push('<image:image>')
        xmlParts.push(`<image:loc>${xmlEscape(im.loc)}</image:loc>`) 
        if (im.title) xmlParts.push(`<image:title>${xmlEscape(im.title)}</image:title>`) 
        if (im.caption) xmlParts.push(`<image:caption>${xmlEscape(im.caption)}</image:caption>`) 
        xmlParts.push('</image:image>')
      }
      xmlParts.push('</url>')
    }
    xmlParts.push('</urlset>')

    const xml = xmlParts.join('')
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (e) {
    return new NextResponse('Service Unavailable', { status: 503 })
  }
}


