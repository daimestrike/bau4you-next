import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gcbwqqwmqjolxxrvfbzz.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjYndxcXdtcWpvbHh4cnZmYnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODA2OTUsImV4cCI6MjA2NDQ1NjY5NX0.l4MmmUaF6YmNRRcorzdx_YdgQZerqqoS86N_T3TX7io'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjYndxcXdtcWpvbHh4cnZmYnp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg4MDY5NSwiZXhwIjoyMDY0NDU2Njk1fQ.HEFHYE0an6cEQEY4OsWQf7t-twcHFv6qtgDRxu6zpgw'

// Обработчик для всех HTTP методов
async function handleRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const resolvedParams = await params
  console.log('🔄 Supabase Proxy Request:', request.method, resolvedParams.path.join('/'))
  
  try {
    // Получаем путь из URL
    const pathSegments = resolvedParams.path
    const targetPath = pathSegments.join('/')
    
    // Строим URL для Supabase
    const targetUrl = `${SUPABASE_URL}/${targetPath}`
    
    // Получаем все заголовки из исходного запроса
    const headers = new Headers()
    
    // Копируем важные заголовки
    const importantHeaders = [
      'content-type',
      'accept',
      'user-agent',
      'accept-encoding',
      'accept-language'
    ]
    
    importantHeaders.forEach(headerName => {
      const value = request.headers.get(headerName)
      if (value) {
        headers.set(headerName, value)
      }
    })
    
    // Обрабатываем авторизацию
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      // Если есть Bearer токен от клиента, используем его
      headers.set('authorization', authHeader)
    } else {
      // Иначе используем anon key
      headers.set('authorization', `Bearer ${SUPABASE_ANON_KEY}`)
    }
    
    // Добавляем специфичные заголовки Supabase
    headers.set('apikey', SUPABASE_ANON_KEY)
    
    // Для административных операций используем service role key
    const useServiceRole = request.headers.get('x-use-service-role') === 'true'
    if (useServiceRole) {
      headers.set('authorization', `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`)
      headers.set('apikey', SUPABASE_SERVICE_ROLE_KEY)
    }
    
    // Получаем тело запроса если есть
    let body: BodyInit | undefined
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      const contentType = request.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        body = await request.text()
      } else if (contentType?.includes('multipart/form-data')) {
        body = await request.formData()
      } else {
        body = await request.arrayBuffer()
      }
    }
    
    // Получаем query параметры
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const targetUrlWithParams = new URL(targetUrl)
    searchParams.forEach((value, key) => {
      targetUrlWithParams.searchParams.set(key, value)
    })
    
    console.log('🎯 Target URL:', targetUrlWithParams.toString())
    console.log('🔑 Using Service Role:', useServiceRole)
    
    // Выполняем запрос к Supabase
    const response = await fetch(targetUrlWithParams.toString(), {
      method: request.method,
      headers,
      body,
    })
    
    console.log('📡 Supabase Response:', response.status, response.statusText)

    // Создаем ответ с теми же заголовками
    const responseHeaders = new Headers()

    // Копируем важные заголовки ответа
    const responseHeadersToKeep = [
      'content-type',
      'cache-control',
      'etag',
      'last-modified',
      'content-encoding'
    ]
    
    responseHeadersToKeep.forEach(headerName => {
      const value = response.headers.get(headerName)
      if (value) {
        responseHeaders.set(headerName, value)
      }
    })
    
    // Добавляем CORS заголовки
    responseHeaders.set('access-control-allow-origin', '*')
    responseHeaders.set('access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
    responseHeaders.set('access-control-allow-headers', 'authorization, x-client-info, apikey, content-type, x-use-service-role')
    
    // Получаем ответ
    let responseData = null
    
    // Handle 204 No Content responses properly - они не должны иметь тело
    if (response.status === 204) {
      return new NextResponse(null, {
        status: 204,
        statusText: response.statusText,
        headers: responseHeaders
      })
    } else {
      // Для всех остальных статусов читаем тело ответа
      responseData = await response.text()
    }
    
    return new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    })
    
  } catch (error) {
    console.error('❌ Supabase Proxy Error:', error)
    return NextResponse.json(
      { error: 'Proxy error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// Экспортируем обработчики для всех методов
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context)
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context)
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context)
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context)
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context)
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  // Обработка preflight запросов
  return new NextResponse(null, {
    status: 200,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type, x-use-service-role'
    }
  })
}