'use client'

import { useState, useEffect } from 'react'
import { signIn, getCurrentUser, getCurrentSession } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function TestLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [user, setUser] = useState<any>(null)
  const [session, setSession] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkCurrentUser()
  }, [])

  const checkCurrentUser = async () => {
    const { user } = await getCurrentUser()
    const { session } = await getCurrentSession()
    setUser(user)
    setSession(session)
    setStatus(`Текущий пользователь: ${user?.email || 'не авторизован'}`)
  }

  const handleLogin = async () => {
    setStatus('Попытка входа...')
    
    try {
      const result = await signIn(email, password)
      console.log('Результат входа:', result)
      
      if (result.error) {
        setStatus(`Ошибка: ${result.error.message}`)
        return
      }
      
      if (result.data?.user) {
        setStatus(`Успешный вход: ${result.data.user.email}`)
        await checkCurrentUser()
        
        // Пробуем перенаправить
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        setStatus('Ошибка: данные пользователя не получены')
      }
    } catch (error) {
      console.error('Исключение при входе:', error)
      setStatus(`Исключение: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Тест входа</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="test@example.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="password"
            />
          </div>
          
          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Войти
          </button>
          
          <button
            onClick={checkCurrentUser}
            className="w-full bg-gray-600 text-white p-2 rounded hover:bg-gray-700"
          >
            Проверить текущего пользователя
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="font-medium mb-2">Статус:</h3>
          <p className="text-sm">{status}</p>
          
          {user && (
            <div className="mt-2">
              <h4 className="font-medium">Пользователь:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
          
          {session && (
            <div className="mt-2">
              <h4 className="font-medium">Сессия:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                {JSON.stringify({ 
                  access_token: session.access_token ? 'есть' : 'нет',
                  expires_at: session.expires_at,
                  user: session.user?.email 
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <button
            onClick={() => router.push('/login')}
            className="text-blue-600 hover:underline"
          >
            ← Назад к обычному входу
          </button>
        </div>
      </div>
    </div>
  )
} 