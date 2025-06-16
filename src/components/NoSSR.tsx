'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

interface NoSSRProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

function NoSSRComponent({ children, fallback = null }: NoSSRProps) {
  const [hasMounted, setHasMounted] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Дополнительная проверка что мы на клиенте
    setIsClient(typeof window !== 'undefined')
    setHasMounted(true)
  }, [])

  // Если не смонтировано или не на клиенте, показываем fallback
  if (!hasMounted || !isClient) {
    return <>{fallback}</>
  }

  // Используем suppressHydrationWarning для предотвращения ошибок гидратации
  // от браузерных расширений (например, bis_skin_checked от Bitwarden)
  return (
    <div suppressHydrationWarning>
      {children}
    </div>
  )
}

// Экспортируем компонент без SSR
const NoSSR = dynamic(() => Promise.resolve(NoSSRComponent), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="glass-card rounded-2xl p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Загружаем дашборд...</p>
      </div>
    </div>
  )
})

export default NoSSR 