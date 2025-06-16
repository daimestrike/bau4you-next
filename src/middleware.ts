import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Пропускаем все служебные запросы
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/.well-known') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  console.log(`[Middleware] Processing: ${pathname}`)

  // Создаем серверный клиент Supabase
  let supabase
  try {
    supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set() {
            // Middleware не может устанавливать куки
          },
          remove() {
            // Middleware не может удалять куки
          },
        },
      }
    )
  } catch (error) {
    console.error('[Middleware] Supabase client creation failed:', error)
    return NextResponse.next()
  }

  // Проверяем текущую сессию
  let user = null
  try {
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    user = currentUser
    console.log(`[Middleware] User check: ${user ? user.email : 'not authenticated'}`)
  } catch (error) {
    console.error('[Middleware] Auth check failed:', error)
  }

  // Проверяем защищенные маршруты
  const isProtectedPath = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedPath && !user) {
    console.log(`[Middleware] Redirecting to login: ${pathname}`)
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Перенаправляем авторизованных пользователей с логина на дашборд
  if ((pathname === '/login' || pathname === '/register') && user) {
    console.log(`[Middleware] Redirecting authenticated user to dashboard`)
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

// 🚧 MIDDLEWARE ОТКЛЮЧЕН ДЛЯ РАЗРАБОТКИ 🚧
// 
// TODO: Включить middleware перед деплоем в продакшн
// 
// Что нужно будет сделать:
// 1. Убрать комментарии с функции middleware
// 2. Восстановить matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
// 3. Протестировать все защищенные маршруты
// 4. Проверить правильность редиректов
//
// Преимущества отключенного middleware во время разработки:
// ✅ Быстрая навигация без проверок
// ✅ Легкое тестирование всех страниц
// ✅ Нет конфликтов с hot reload
// ✅ Можно сосредоточиться на основной функциональности

export const config = {
  matcher: [] // Middleware временно отключен
} 