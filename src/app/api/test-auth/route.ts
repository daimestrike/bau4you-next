import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  console.log('🔍 Test Auth API called')
  
  // Получаем cookies и headers из запроса
  const cookieHeader = request.headers.get('cookie')
  const authHeader = request.headers.get('authorization')
  console.log('🍪 Cookie header:', cookieHeader ? 'present' : 'missing')
  console.log('🔑 Auth header:', authHeader ? 'present' : 'missing')
  
  // Создаем серверный клиент Supabase
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
          console.log(`🍪 Attempted to set cookie ${name}`)
        },
        remove(name: string, options: any) {
          console.log(`🍪 Attempted to remove cookie ${name}`)
        },
      },
    }
  )
  
  // Проверяем авторизацию
  console.log('🔐 Checking authentication...')
  const { user, error } = await supabase.auth.getUser()
  
  console.log('👤 Supabase User:', user ? `${user.id} (${user.email})` : 'null')
  console.log('❌ Supabase Auth error:', error)
  
  return NextResponse.json({
    user: user ? { id: user.id, email: user.email } : null,
    error: error?.message || null,
    authHeader: authHeader ? 'present' : 'missing',
    cookieHeader: cookieHeader ? 'present' : 'missing'
  })
}