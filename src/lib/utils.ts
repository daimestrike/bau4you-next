import { useState, useEffect } from 'react'

// Утилита для предотвращения ошибок гидратации
export const isBrowser = () => typeof window !== 'undefined'

// Проверка наличия браузерных расширений
export const hasBrowserExtensions = () => {
  if (!isBrowser()) return false
  
  // Проверяем общие атрибуты, добавляемые расширениями
  const body = document.body
  if (!body) return false
  
  const hasExtensionAttributes = 
    body.hasAttribute('bis_skin_checked') ||
    body.hasAttribute('cz-shortcut-listen') ||
    body.hasAttribute('data-new-gr-c-s-check-loaded') ||
    body.hasAttribute('data-bitwarden-watching') ||
    body.hasAttribute('data-lastpass-watching')
  
  return hasExtensionAttributes
}

// Утилита для безопасного получения данных только на клиенте
export const getClientSideData = <T>(getData: () => T, fallback: T): T => {
  if (!isBrowser()) return fallback
  
  try {
    return getData()
  } catch {
    return fallback
  }
}

// Утилита для задержки рендеринга до монтирования компонента
export const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false)
  
  useEffect(() => {
    setHasMounted(true)
  }, [])
  
  return hasMounted
} 