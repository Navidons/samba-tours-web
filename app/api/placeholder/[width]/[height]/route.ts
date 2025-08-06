import { NextRequest, NextResponse } from "next/server"

// Simple placeholder image generator
export async function GET(
  request: NextRequest,
  { params }: { params: { width: string; height: string } }
) {
  try {
    const width = parseInt(params.width) || 400
    const height = parseInt(params.height) || 300
    const searchParams = new URL(request.url).searchParams
    const text = searchParams.get('text') || 'No Image'
    const bgColor = searchParams.get('bg') || 'e5e7eb' // gray-200
    const textColor = searchParams.get('color') || '6b7280' // gray-500

    // Create SVG placeholder
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#${bgColor}"/>
        <text 
          x="50%" 
          y="50%" 
          dominant-baseline="central" 
          text-anchor="middle" 
          font-family="Arial, sans-serif" 
          font-size="${Math.min(width, height) * 0.1}" 
          fill="#${textColor}"
        >
          ${text.replace(/\+/g, ' ')}
        </text>
      </svg>
    `

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error generating placeholder:', error)
    
    // Return a minimal SVG
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e5e7eb"/>
        <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-family="Arial" font-size="16" fill="#6b7280">
          No Image
        </text>
      </svg>
    `
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    })
  }
}
