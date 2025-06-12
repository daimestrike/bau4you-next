'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn, getCurrentUser } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [userCheckDone, setUserCheckDone] = useState(false)
  const [checkInProgress, setCheckInProgress] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Фикс гидратации - устанавливаем mounted на клиенте
  useEffect(() => {
    setMounted(true)
  }, [])

  // Проверяем, не авторизован ли уже пользователь (только на клиенте)
  useEffect(() => {
    if (!mounted || userCheckDone || checkInProgress) return

    const checkUser = async () => {
      setCheckInProgress(true)
      try {
        console.log('[Login] Проверка текущего пользователя...')
        const { user } = await getCurrentUser()
        if (user) {
          console.log('[Login] Пользователь уже авторизован:', user.email)
          // Middleware должен обработать перенаправление, но на всякий случай:
          const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/dashboard'
          console.log('[Login] Перенаправление на:', redirectTo)
          
          // Используем window.location для более надежного перенаправления
          window.location.href = redirectTo
          return
        } else {
          console.log('[Login] Пользователь не авторизован')
        }
      } catch (error) {
        console.error('[Login] Ошибка проверки пользователя:', error)
      } finally {
        setUserCheckDone(true)
        setCheckInProgress(false)
      }
    }
    
    // Добавляем небольшую задержку чтобы избежать race conditions
    const timeoutId = setTimeout(checkUser, 100)
    return () => clearTimeout(timeoutId)
  }, [mounted])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log('[Login] Попытка входа с email:', formData.email)
      const { data, error } = await signIn(formData.email, formData.password)
      
      console.log('[Login] Результат входа:', { data: !!data, error: error?.message })
      
      if (error) {
        console.error('[Login] Ошибка входа:', error)
        throw error
      }

      if (data?.user) {
        console.log('[Login] Пользователь успешно вошел:', data.user.email)
        const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/dashboard'
        console.log('[Login] Перенаправление на:', redirectTo)
        
        // Перенаправляем на дашборд
        router.push(redirectTo)
        router.refresh()
      } else {
        throw new Error('Не удалось получить данные пользователя')
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error('[Login] Ошибка при входе:', error)
      setError(error.message || 'Произошла ошибка при входе')
    } finally {
      setIsLoading(false)
    }
  }

  // Предотвращаем рендеринг до монтирования на клиенте
  if (!mounted || (!userCheckDone && !error)) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600">
            {checkInProgress ? 'Проверка авторизации...' : 'Загрузка...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-blue-600">Bau4You</h1>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Вход в аккаунт
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Или{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            создайте новый аккаунт
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Тестовые кнопки для отладки - показываем только в режиме разработки */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-700 mb-2">
                🔧 Режим разработки - отладочные кнопки:
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    console.log('[Login] Ручной переход на дашборд...')
                    window.location.href = '/dashboard'
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 text-sm"
                >
                  🔗 Прямой переход на дашборд
                </button>
                <button
                  onClick={() => {
                    console.log('[Login] Переход через router...')
                    router.push('/dashboard')
                  }}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-sm"
                >
                  🚀 Router.push на дашборд
                </button>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email адрес
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Введите ваш email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Введите ваш пароль"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Запомнить меня
                </label>
              </div>

              <div className="text-sm">
                <Link href="/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Забыли пароль?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Или войдите с помощью</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Войти через Google</span>
                  Google
                </button>

                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Войти через GitHub</span>
                  GitHub
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}