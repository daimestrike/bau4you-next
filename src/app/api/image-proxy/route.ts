import { NextRequest, NextResponse } from 'next/server'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400, headers: corsHeaders }
      )
    }

    // Проверяем, что URL принадлежит нашему S3 bucket
    const allowedDomains = [
      '5e559db6-b49dc67b-2ab0-4413-9567-c6e34e6a5bd4.s3.timeweb.cloud',
      's3.timeweb.cloud'
    ]
    
    const urlObj = new URL(imageUrl)
    const isAllowed = allowedDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith(`.${domain}`)
    )

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'URL not allowed' },
        { status: 403, headers: corsHeaders }
      )
    }

    // Получаем изображение с S3
    const response = await fetch(imageUrl)
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: response.status, headers: corsHeaders }
      )
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Возвращаем изображение с CORS заголовками
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Кэшируем на год
      },
    })
  } catch (error) {
    console.error('Image proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders }
    )
  }
}