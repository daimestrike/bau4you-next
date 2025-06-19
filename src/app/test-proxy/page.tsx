'use client'
import { useState } from 'react'

export default function TestProxyPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testDirectConnection = async () => {
    setLoading(true)
    try {
      console.log('🧪 Testing direct Supabase connection...')
      const response = await fetch('https://gcbwqqwmqjolxxrvfbzz.supabase.co/rest/v1/commercial_proposals?limit=1', {
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjYndxcXdtcWpvbHh4cnZmYnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODA2OTUsImV4cCI6MjA2NDQ1NjY5NX0.l4MmmUaF6YmNRRcorzdx_YdgQZerqqoS86N_T3TX7io',
          'authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjYndxcXdtcWpvbHh4cnZmYnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODA2OTUsImV4cCI6MjA2NDQ1NjY5NX0.l4MmmUaF6YmNRRcorzdx_YdgQZerqqoS86N_T3TX7io',
          'content-type': 'application/json'
        }
      })
      
      const data = await response.json()
      setResult({ type: 'direct', success: response.ok, data, status: response.status })
      console.log('✅ Direct connection result:', { success: response.ok, data, status: response.status })
    } catch (error) {
      console.error('❌ Direct connection error:', error)
      setResult({ type: 'direct', success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading(false)
  }

  const testProxyConnection = async () => {
    setLoading(true)
    try {
      console.log('🧪 Testing proxy connection...')
      const response = await fetch('/api/sb/rest/v1/commercial_proposals?limit=1', {
        headers: {
          'content-type': 'application/json'
        }
      })
      
      const data = await response.json()
      setResult({ type: 'proxy', success: response.ok, data, status: response.status })
      console.log('✅ Proxy connection result:', { success: response.ok, data, status: response.status })
    } catch (error) {
      console.error('❌ Proxy connection error:', error)
      setResult({ type: 'proxy', success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading(false)
  }

  const testVPSProxy = async () => {
    setLoading(true)
    try {
      console.log('🧪 Testing VPS proxy connection...')
      const response = await fetch('https://api.bau4you.co/api/sb/rest/v1/commercial_proposals?limit=1', {
        headers: {
          'content-type': 'application/json'
        }
      })
      
      const data = await response.json()
      setResult({ type: 'vps-proxy', success: response.ok, data, status: response.status })
      console.log('✅ VPS Proxy connection result:', { success: response.ok, data, status: response.status })
    } catch (error) {
      console.error('❌ VPS Proxy connection error:', error)
      setResult({ type: 'vps-proxy', success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">🧪 Тест Supabase Proxy</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testDirectConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Тестирую...' : 'Тест прямого подключения'}
        </button>
        
        <button
          onClick={testProxyConnection}
          disabled={loading}
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          {loading ? 'Тестирую...' : 'Тест локального прокси'}
        </button>

        <button
          onClick={testVPSProxy}
          disabled={loading}
          className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 disabled:opacity-50 ml-4"
        >
          {loading ? 'Тестирую...' : 'Тест VPS прокси'}
        </button>
      </div>

      {result && (
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">
            📊 Результат теста: {result.type}
          </h2>
          
          <div className={`p-3 rounded mb-4 ${result.success ? 'bg-green-100 border border-green-300' : 'bg-red-100 border border-red-300'}`}>
            <div className="font-semibold">
              {result.success ? '✅ Успешно' : '❌ Ошибка'}
            </div>
            <div className="text-sm">
              Статус: {result.status || 'N/A'}
            </div>
          </div>
          
          <pre className="bg-white p-4 rounded border overflow-auto max-h-96 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">ℹ️ Информация о тестах:</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li><strong>Прямое подключение:</strong> Обращение напрямую к Supabase API</li>
          <li><strong>Локальный прокси:</strong> Через `/api/sb/` роут в Next.js</li>
          <li><strong>VPS прокси:</strong> Через ваш домен api.bau4you.co</li>
        </ul>
      </div>
    </div>
  )
} 