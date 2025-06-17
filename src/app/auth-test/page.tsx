'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCurrentUser, supabase } from '@/lib/supabase'

export default function AuthTestPage() {
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    checkAuth()
  }, [mounted])

  const checkAuth = async () => {
    try {
      console.log('[AuthTest] Проверяка аутентификации...')
      
      // Получаем сессию напрямую
      const { session, error: sessionError } = await supabase.auth.getSession()
      console.log('[AuthTest] Сессия:', session)
      console.log('[AuthTest] Ошибка сессии:', sessionError)
      setSession(session)

      // Получаем пользователя через getCurrentUser
      const { user: currentUser, error: userError } = await getCurrentUser()
      console.log('[AuthTest] Текущий пользователь:', currentUser)
      console.log('[AuthTest] Ошибка пользователя:', userError)
      
      if (userError) {
        setError(userError.message)
      } else {
        setUser(currentUser)
      }
    } catch (err: any) {
      console.error('[AuthTest] Ошибка проверки:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Обновляем состояние
      setUser(null)
      setSession(null)
      setError(null)
    } catch (err: any) {
      setError('Ошибка выхода: ' + err.message)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold mb-6">🔍 Диагностика аутентификации</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Проверка аутентификации...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Статус */}
            <div className="p-4 rounded-lg border-2 border-dashed">
              <h2 className="text-lg font-semibold mb-2">Статус аутентификации</h2>
              <div className="space-y-2">
                <p className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user ? '✅ Авторизован' : '❌ Не авторизован'}
                </p>
                
                {user && (
                  <div className="ml-4 text-sm text-gray-600">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Последний вход:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ru-RU') : 'Неизвестно'}</p>
                  </div>
                )}
                
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    <strong>Ошибка:</strong> {error}
                  </div>
                )}
              </div>
            </div>

            {/* Сессия */}
            <div className="p-4 rounded-lg border-2 border-dashed">
              <h2 className="text-lg font-semibold mb-2">Информация о сессии</h2>
              {session ? (
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Access Token:</strong> {session.access_token ? '✅ Есть' : '❌ Нет'}</p>
                  <p><strong>Expires At:</strong> {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString('ru-RU') : 'Неизвестно'}</p>
                  <p><strong>Provider:</strong> {session.user?.app_metadata?.provider || 'Неизвестно'}</p>
                </div>
              ) : (
                <p className="text-red-600">Сессия отсутствует</p>
              )}
            </div>

            {/* Навигационные тесты */}
            <div className="p-4 rounded-lg border-2 border-dashed">
              <h2 className="text-lg font-semibold mb-4">Тесты навигации</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Защищённые страницы:</h3>
                  <div className="space-y-1">
                    <Link href="/dashboard" className="block text-blue-600 hover:text-blue-800">
                      📊 Dashboard
                    </Link>
                    <Link href="/projects" className="block text-blue-600 hover:text-blue-800">
                      🏗️ Проекты
                    </Link>
                    <Link href="/tenders" className="block text-blue-600 hover:text-blue-800">
                      📋 Тендеры
                    </Link>
                    <Link href="/profile" className="block text-blue-600 hover:text-blue-800">
                      👤 Профиль
                    </Link>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-medium">Создание контента:</h3>
                  <div className="space-y-1">
                    <Link href="/projects/create" className="block text-blue-600 hover:text-blue-800">
                      ➕ Создать проект
                    </Link>
                    <Link href="/tenders/create" className="block text-blue-600 hover:text-blue-800">
                      ➕ Создать тендер
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Альтернативный логин */}
            <div className="p-4 rounded-lg border-2 border-dashed">
              <h2 className="text-lg font-semibold mb-4">Альтернативные страницы входа</h2>
              <div className="space-y-2">
                <Link href="/login" className="block text-orange-600 hover:text-orange-800">
                  🔄 Обычный логин (может зацикливаться)
                </Link>
                <Link href="/simple-login" className="block text-green-600 hover:text-green-800">
                  ✅ Простой логин (рекомендуется)
                </Link>
              </div>
            </div>

            {/* Действия */}
            <div className="flex space-x-4">
              <button
                onClick={checkAuth}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🔄 Обновить
              </button>
              
              {user ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🚪 Выйти
                </button>
              ) : (
                <Link
                  href="/simple-login"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block"
                >
                  🔑 Войти
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}