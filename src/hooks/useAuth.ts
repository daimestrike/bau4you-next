import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'

interface UseAuthOptions {
  redirectTo?: string
  redirectOnSuccess?: string
  requireAuth?: boolean
}

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth(options: UseAuthOptions = {}): UseAuthReturn {
  const { redirectTo = '/login', redirectOnSuccess, requireAuth = true } = options
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        // Получаем текущую сессию
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (error) {
          console.error('Auth error:', error)
          setUser(null)
          setIsAuthenticated(false)
        } else if (session?.user) {
          console.log('✅ Пользователь авторизован:', session.user.email)
          setUser(session.user)
          setIsAuthenticated(true)
          
          // Если пользователь авторизован и нужно перенаправить
          if (redirectOnSuccess) {
            router.push(redirectOnSuccess)
            return
          }
        } else {
          console.log('🔄 Пользователь не авторизован')
          setUser(null)
          setIsAuthenticated(false)
          
          // Если требуется авторизация, перенаправляем
          if (requireAuth) {
            router.push(`${redirectTo}?redirect=${encodeURIComponent('/companies/create')}`)
            return
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        if (mounted) {
          setUser(null)
          setIsAuthenticated(false)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    // Проверяем авторизацию с небольшой задержкой
    const timeoutId = setTimeout(checkAuth, 100)

    // Слушаем изменения состояния авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('🔄 Auth state change:', event, session?.user?.email)
        
        if (session?.user) {
          setUser(session.user)
          setIsAuthenticated(true)
          
          if (redirectOnSuccess) {
            router.push(redirectOnSuccess)
          }
        } else {
          setUser(null)
          setIsAuthenticated(false)
          
          if (event === 'SIGNED_OUT' && requireAuth) {
            router.push(`${redirectTo}?redirect=${encodeURIComponent('/companies/create')}`)
          }
        }
        
        setIsLoading(false)
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [router, redirectTo, redirectOnSuccess, requireAuth])

  return { user, isLoading, isAuthenticated }
}