'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from '@/lib/supabase'

export default function SimpleLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

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
      console.log('[SimpleLogin] Попытка входа с email:', formData.email)
      const { data, error } = await signIn(formData.email, formData.password)
      
      if (error) {
        throw error
      }

      if (data?.user) {
        console.log('[SimpleLogin] Успешный вход:', data.user.email)
        const redirectTo = new URLSearchParams(window.location.search).get('redirect') || '/dashboard'
        
        // Простое перенаправление
        window.location.href = redirectTo
      } else {
        throw new Error('Не удалось получить данные пользователя')
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error('[SimpleLogin] Ошибка при входе:', error)
      setError(error.message || 'Произошла ошибка при входе')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex justify-center">
          <h1 className="text-3xl font-bold text-blue-600">Bau4You</h1>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Простой вход
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

          {/* Информация о странице */}
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700">
              ✅ Эта страница НЕ проверяет авторизацию автоматически.
              <br />
              🔧 Используйте для тестирования без redirect loops.
            </p>
          </div>

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

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Вход...' : 'Войти'}
              </button>
            </div>
          </form>

          {/* Дополнительные ссылки */}
          <div className="mt-6 text-center space-y-2">
            <div>
              <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
                ← Обычная страница входа
              </Link>
            </div>
            <div>
              <Link href="/auth-test" className="text-sm text-gray-600 hover:text-gray-800">
                🔍 Тест авторизации
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 