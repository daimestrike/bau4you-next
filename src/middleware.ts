// MIDDLEWARE ВРЕМЕННО ОТКЛЮЧЕН ДЛЯ ОТЛАДКИ АВТОРИЗАЦИИ
// 
// Проблемы которые решаем:
// 1. Бесконечные редиректы между страницами
// 2. Конфликты с client-side навигацией
// 3. Сложности с синхронизацией сессий
//
// TODO: Включить middleware после стабилизации авторизации

/*
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Публичные маршруты, доступные без авторизации
const publicRoutes = ['/', '/login', '/register', '/companies', '/products', '/tenders', '/search']

// Маршруты только для гостей (неавторизованных пользователей)
const guestOnlyRoutes = ['/login', '/register']

// Маршруты, требующие авторизации
const protectedRoutes = [
  '/profile',
  '/dashboard', 
  '/tenders/create', 
  '/products/create', 
  '/products/manage',
  '/projects',
  '/projects/create',
  '/companies/create',
  '/orders',
  '/messages'
]

// Маршруты только для администраторов
const adminRoutes = ['/admin']

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Получаем пользователя для обновления сессии
  const { data: { user } } = await supabase.auth.getUser()

  // Логируем для debugging
  console.log('🔍 Middleware - Path:', request.nextUrl.pathname)
  console.log('🔍 Middleware - User:', user ? `${user.id} (${user.email})` : 'null')

  // Защищенные маршруты
  const protectedPaths = ['/dashboard', '/commercial-proposals', '/commercial-proposal']
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Если пользователь не авторизован и пытается получить доступ к защищенному маршруту
  if (!user && isProtectedPath) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    console.log('🔒 Middleware - Redirecting to login:', redirectUrl.toString())
    return NextResponse.redirect(redirectUrl)
  }

  // Если пользователь авторизован и пытается получить доступ к странице входа
  if (user && request.nextUrl.pathname === '/login') {
    const redirectUrl = new URL('/dashboard', request.url)
    console.log('✅ Middleware - User already logged in, redirecting to dashboard')
    return NextResponse.redirect(redirectUrl)
  }

  return response
}
*/

// Пустой экспорт для Next.js
export const config = {
  // Отключаем matcher полностью
  matcher: [],
} 