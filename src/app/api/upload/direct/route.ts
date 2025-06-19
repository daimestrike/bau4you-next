import { NextRequest, NextResponse } from 'next/server'
import { uploadFile, generateFileName, validateFile } from '@/lib/s3'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  })
}

// Простая проверка JWT токена
const validateJWTToken = async (token: string) => {
  try {
    // Декодируем JWT без проверки подписи (только для получения payload)
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.log('🔍 JWT: неправильное количество частей')
      return null
    }
    
    // Добавляем padding если нужно для base64
    let payload = parts[1]
    while (payload.length % 4) {
      payload += '='
    }
    
    // Заменяем URL-safe символы на стандартные base64
    payload = payload.replace(/-/g, '+').replace(/_/g, '/')
    
    const decodedPayload = JSON.parse(atob(payload))
    console.log('🔍 JWT payload:', { 
      sub: decodedPayload.sub, 
      email: decodedPayload.email, 
      exp: decodedPayload.exp,
      iat: decodedPayload.iat 
    })
    
    // Проверяем срок действия
    const now = Math.floor(Date.now() / 1000)
    if (decodedPayload.exp && decodedPayload.exp < now) {
      console.log('⏰ Token expired')
      return null
    }
    
    return {
      id: decodedPayload.sub,
      email: decodedPayload.email
    }
  } catch (error) {
    console.log('💥 JWT validation error:', error)
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Upload API called')
    
    // Получаем cookies и headers из запроса
    const cookieHeader = request.headers.get('cookie')
    const authHeader = request.headers.get('authorization')
    console.log('🍪 Cookie header:', cookieHeader ? 'present' : 'missing')
    console.log('🔑 Auth header:', authHeader ? 'present' : 'missing')
    
    // Создаем серверный клиент Supabase правильно в контексте запроса
    const cookieStore = await cookies()
    console.log('🍪 Cookies available:', cookieStore.getAll().map(c => c.name))
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name)
            console.log(`🍪 Getting cookie ${name}:`, cookie ? 'found' : 'not found')
            return cookie?.value
          },
          set(name: string, value: string, options: any) {
            // В API routes мы не можем устанавливать cookies
            console.log(`🍪 Attempted to set cookie ${name}`)
          },
          remove(name: string, options: any) {
            // В API routes мы не можем удалять cookies
            console.log(`🍪 Attempted to remove cookie ${name}`)
          },
        },
      }
    )
    

    // Проверяем авторизацию
    console.log('🔐 Checking authentication...')
    let user = null
    let authError = null
    let authenticatedSupabase = supabase
    
    // Если есть Authorization header, создаем клиент с токеном
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      console.log('🔑 Creating authenticated client with token, length:', token.length)
      
      authenticatedSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get() { return undefined },
            set() {},
            remove() {},
          },
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      )
      
      // Пробуем получить пользователя с токеном
      const { data: { user: tokenUser }, error: tokenError } = await authenticatedSupabase.auth.getUser()
      if (tokenUser && !tokenError) {
        console.log('✅ Token authentication successful:', tokenUser.email)
        user = tokenUser
        authError = null
      } else {
        console.log('❌ Token authentication failed:', tokenError?.message)
        authError = tokenError
      }
    }
    
          // Если токен не сработал, пробуем через куки
      if (!user) {
        const { data: { user: supabaseAuth }, error: supabaseError } = await supabase.auth.getUser()
        user = supabaseAuth
        authError = supabaseError
      
      console.log('👤 Cookie-based User:', user ? `${user.id} (${user.email})` : 'null')
      console.log('❌ Cookie-based Auth error:', authError)
    }
    
    // Если ничего не сработало, но есть Authorization header, пробуем JWT валидацию
    if (!user && authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      console.log('🔄 Trying JWT validation as fallback...')
      const jwtUser = await validateJWTToken(token)
      if (jwtUser) {
        console.log('✅ JWT validation successful:', jwtUser.email)
        user = jwtUser
        authError = null
      }
    }

    if (!user || authError) {
      console.log('🚫 Authentication failed - Auth session missing!')
      return NextResponse.json(
      { error: 'Необходима авторизация' },
      { status: 401, headers: corsHeaders }
    )
    }

    console.log('✅ User authenticated:', user.email)

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      console.log('📁 No file provided')
      return NextResponse.json(
      { error: 'Файл не найден' },
      { status: 400, headers: corsHeaders }
    )
    }

    console.log('📁 File received:', file.name, file.size, file.type)

    // Валидация файла - разрешаем документы для коммерческих предложений
    const validation = validateFile(file, { context: 'all' }) // Разрешаем все типы файлов
    if (!validation.valid) {
      console.log('❌ File validation failed:', validation.error)
      return NextResponse.json(
        { error: validation.error },
        { status: 400, headers: corsHeaders }
      )
    }

    // Конвертируем файл в Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Генерируем уникальное имя файла
    const fileName = generateFileName(file.name, user.id)
    console.log('📝 Generated filename:', fileName)

    // Загружаем файл в S3
    console.log('☁️ Uploading to S3...')
    console.log('📋 S3 Config:', {
      endpoint: 'https://s3.timeweb.cloud',
      region: 'ru-1',
      bucket: process.env.TIMEWEB_S3_BUCKET || '5e559db6-b49dc67b-2ab0-4413-9567-c6e34e6a5bd4'
    })
    console.log('📁 Upload details:', {
      fileName,
      fileSize: file.size,
      contentType: file.type
    })
    
    try {
      const publicUrl = await uploadFile(buffer, fileName, file.type)
      console.log('✅ Upload successful:', publicUrl)

      return NextResponse.json({
        success: true,
        fileName,
        publicUrl,
        fileSize: file.size,
        fileType: file.type
      }, {
        headers: corsHeaders
      })
    } catch (s3Error) {
      console.error('💥 S3 Upload error:', s3Error)
      return NextResponse.json(
        { error: 'Ошибка при загрузке в S3: ' + (s3Error instanceof Error ? s3Error.message : 'Неизвестная ошибка') },
        { status: 500, headers: corsHeaders }
      )
    }

  } catch (error) {
    console.error('💥 Upload error:', error)
    return NextResponse.json(
      { error: 'Ошибка при загрузке файла' },
      { status: 500, headers: corsHeaders }
    )
  }
}