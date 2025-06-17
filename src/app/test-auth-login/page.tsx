'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, getCurrentUser, supabase } from '@/lib/supabase'

export default function TestAuthLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [testEmails] = useState([
    'ivan@example.com',
    'irina@example.com',
    'vladimir@example.com'
  ])

  useEffect(() => {
    checkCurrentUser()
  }, [])

  const checkCurrentUser = async () => {
    try {
      const { user, error } = await getCurrentUser()
      if (user) {
        setCurrentUser(user)
        console.log('✅ Текущий пользователь:', user.email)
      } else {
        console.log('❌ Пользователь не авторизован')
      }
    } catch (err) {
      console.error('Ошибка проверки пользователя:', err)
    }
  }

  const handleTestLogin = async (email: string) => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('🔍 Попытка входа с email:', email)
      const { data, error } = await signIn(email, 'password123')
      
      if (error) {
        throw error
      }

      if (data?.user) {
        console.log('✅ Успешный вход:', data.user.email)
        setCurrentUser(data.user)
        // Перенаправляем на favorites
        router.push('/favorites')
      } else {
        throw new Error('Не удалось получить данные пользователя')
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error('❌ Ошибка при входе:', error)
      setError(error.message || 'Произошла ошибка при входе')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setCurrentUser(null)
      console.log('✅ Выход выполнен')
    } catch (err) {
      console.error('❌ Ошибка выхода:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Тестовая авторизация
        </h2>
        
        {currentUser && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
            <p className="text-green-700">
              ✅ Авторизован как: {currentUser.email}
            </p>
            <button
              onClick={handleLogout}
              className="mt-2 text-sm text-red-600 hover:text-red-800"
            >
              Выйти
            </button>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Быстрый вход тестовыми пользователями:
            </h3>
            
            {testEmails.map((email) => (
              <button
                key={email}
                onClick={() => handleTestLogin(email)}
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isLoading ? 'Вход...' : `Войти как ${email}`}
              </button>
            ))}
            
            <div className="mt-6 border-t border-gray-200 pt-6">
              <button
                onClick={() => router.push('/favorites')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Перейти к избранным компаниям
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}