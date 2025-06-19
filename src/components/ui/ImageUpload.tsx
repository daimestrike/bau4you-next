'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ImageIcon, FileText, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  value?: string | string[]
  onChange: (value: string | string[]) => void
  multiple?: boolean
  maxFiles?: number
  className?: string
  placeholder?: string
  disabled?: boolean
}

interface UploadedFile {
  file: File
  preview: string
  uploading: boolean
  uploaded: boolean
  url?: string
  error?: string
}

export default function ImageUpload({
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
  className = '',
  placeholder = 'Перетащите изображения сюда или нажмите для выбора',
  disabled = false
}: ImageUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Получаем токен из localStorage (еще один fallback)
  const getTokenFromLocalStorage = (): string | null => {
    try {
      console.log('💾 Проверяем localStorage...')
      
      // Проверяем разные ключи, которые может использовать Supabase
      const possibleKeys = [
        'sb-gcbwqqwmqjolxxrvfbzz-auth-token',
        'supabase.auth.token',
        'sb-auth-token'
      ]
      
      for (const key of possibleKeys) {
        const item = localStorage.getItem(key)
        if (item) {
          console.log(`💾 Найден элемент в localStorage: ${key}`)
          try {
            const parsed = JSON.parse(item)
            if (parsed.access_token) {
              console.log('✅ Access token найден в localStorage!')
              return parsed.access_token
            }
          } catch (e) {
            console.log(`💾 Не удалось распарсить ${key}`)
          }
        }
      }
      
      console.log('💾 Токен в localStorage не найден')
      return null
    } catch (error) {
      console.error('💥 Ошибка при чтении localStorage:', error)
      return null
    }
  }

  // Получаем токен из куков напрямую (fallback)
  const getTokenFromCookies = (): string | null => {
    try {
      console.log('🍪 Проверяем куки напрямую...')
      const cookies = document.cookie.split(';')
      console.log('🍪 Все куки:', cookies.map(c => c.trim().split('=')[0]))
      
      // Ищем токен в разных форматах
      const tokenPatterns = [
        'sb-gcbwqqwmqjolxxrvfbzz-auth-token',
        'sb-gcbwqqwmqjolxxrvfbzz-auth-token.0',
        'sb-gcbwqqwmqjolxxrvfbzz-auth-token.1',
        'sb-gcbwqqwmqjolxxrvfbzz-auth-token.2',
        'sb-gcbwqqwmqjolxxrvfbzz-auth-token.3',
        'sb-gcbwqqwmqjolxxrvfbzz-auth-token.4'
      ]
      
      const tokenParts: string[] = []
      
      for (const pattern of tokenPatterns) {
        const cookie = cookies.find(c => c.trim().startsWith(pattern + '='))
        if (cookie) {
          const value = cookie.split('=')[1]
          if (value) {
            console.log(`🍪 Найден кусок токена: ${pattern}`)
            if (pattern.includes('.')) {
              tokenParts.push(decodeURIComponent(value))
            } else {
              // Это полный токен
              const decoded = decodeURIComponent(value)
              console.log('🍪 Полный токен найден в куках')
              try {
                const parsed = JSON.parse(decoded)
                return parsed.access_token || null
              } catch (e) {
                console.log('🍪 Не удалось распарсить токен из куков')
                return null
              }
            }
          }
        }
      }
      
      // Если нашли части токена, собираем их
      if (tokenParts.length > 0) {
        console.log(`🍪 Найдено ${tokenParts.length} частей токена`)
        const fullToken = tokenParts.join('')
        try {
          const parsed = JSON.parse(fullToken)
          return parsed.access_token || null
        } catch (e) {
          console.log('🍪 Не удалось собрать токен из частей')
          return null
        }
      }
      
      console.log('🍪 Токен в куках не найден')
      return null
    } catch (error) {
      console.error('💥 Ошибка при чтении куков:', error)
      return null
    }
  }

  // Получаем токен авторизации с таймаутом
  const getAuthToken = async (): Promise<string | null> => {
    try {
      console.log('🔍 Получаем токен авторизации...')
      
      // Сначала пробуем получить токен из куков (быстрее и надежнее)
      console.log('🍪 Пробуем получить токен из куков...')
      const cookieToken = getTokenFromCookies()
      if (cookieToken) {
        console.log('✅ Токен найден в куках!')
        return cookieToken
      }
      
      // Если в куках нет, пробуем localStorage
      console.log('💾 Пробуем получить токен из localStorage...')
      const localStorageToken = getTokenFromLocalStorage()
      if (localStorageToken) {
        console.log('✅ Токен найден в localStorage!')
        return localStorageToken
      }
      
      // Если в куках и localStorage нет, пробуем через Supabase с таймаутом
      console.log('🔄 Получаем сессию через Supabase (с таймаутом 5 сек)...')
      
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000)
      })
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise])
      
      if (error) {
        console.error('❌ Ошибка получения сессии:', error)
        return null
      }
      
      if (!session) {
        console.log('❌ Сессия не найдена через Supabase')
        return null
      }
      
      console.log('✅ Сессия найдена через Supabase:', session.user?.email)
      return session.access_token || null
      
    } catch (error) {
      if (error instanceof Error && error.message === 'Timeout') {
        console.log('⏰ Таймаут получения сессии через Supabase')
      } else {
        console.error('💥 Ошибка получения токена:', error)
      }
      
      // В случае ошибки или таймаута пробуем все fallback методы
      console.log('🔄 Fallback: пробуем все методы еще раз...')
      return getTokenFromCookies() || getTokenFromLocalStorage()
    }
  }

  // Инициализация файлов из value
  useEffect(() => {
    if (value) {
      const urls = Array.isArray(value) ? value : [value]
      const existingFiles = urls.map((url, index) => ({
        file: new File([], `existing-${index}`, { type: 'image/jpeg' }),
        preview: url,
        uploading: false,
        uploaded: true,
        url
      }))
      setFiles(existingFiles)
    } else {
      setFiles([])
    }
  }, []) // Убираем value из зависимостей

  // Обновляем значение при изменении файлов
  useEffect(() => {
    const uploadedUrls = files
      .filter(file => file.uploaded && file.url)
      .map(file => file.url!)

    if (uploadedUrls.length > 0) {
      const newValue = multiple ? uploadedUrls : uploadedUrls[0]
      
      // Проверяем, изменилось ли значение
      const currentValue = Array.isArray(value) ? value : (value ? [value] : [])
      if (JSON.stringify(uploadedUrls.sort()) !== JSON.stringify(currentValue.sort())) {
        onChange(newValue)
      }
    }
  }, [files, multiple]) // Убираем onChange и value из зависимостей

  // Загрузка файла в S3
  const uploadFile = async (file: File): Promise<string> => {
    console.log('📤 Начинаем загрузку файла:', file.name)
    
    const formData = new FormData()
    formData.append('file', file)

    // Получаем токен авторизации
    const token = await getAuthToken()
    console.log('🔑 Токен получен:', token ? 'да' : 'нет')
    if (token) {
      console.log('🔑 Токен (первые 50 символов):', token.substring(0, 50) + '...')
    }
    
    const headers: HeadersInit = {
      // Не устанавливаем Content-Type для FormData
    }
    
    // Добавляем Authorization header если есть токен
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
      console.log('✅ Authorization header добавлен')
    } else {
      console.log('❌ Токен отсутствует, Authorization header не добавлен')
    }

    console.log('📡 Отправляем запрос на /api/upload/direct')
    console.log('📋 Headers:', Object.keys(headers))
    console.log('🍪 Credentials: include')
    
    const response = await fetch('/api/upload/direct', {
      method: 'POST',
      body: formData,
      credentials: 'include', // Важно для передачи cookies
      headers
    })
    
    console.log('📊 Ответ сервера:', response.status, response.statusText)
    console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.log('❌ Ошибка сервера (raw):', errorText)
      
      try {
        const error = JSON.parse(errorText)
        console.log('❌ Ошибка сервера (parsed):', error)
        throw new Error(error.error || 'Ошибка загрузки')
      } catch (parseError) {
        console.log('❌ Не удалось распарсить ошибку:', parseError)
        throw new Error(`Ошибка загрузки: ${response.status} ${response.statusText}`)
      }
    }

    const result = await response.json()
    console.log('✅ Файл успешно загружен:', result.publicUrl)
    return result.publicUrl
  }

  // Обработка выбранных файлов
  const handleFiles = useCallback(async (selectedFiles: FileList) => {
    if (disabled) return

    const newFiles = Array.from(selectedFiles)
    const totalFiles = files.length + newFiles.length

    if (!multiple && newFiles.length > 1) {
      alert('Можно выбрать только один файл')
      return
    }

    if (multiple && totalFiles > maxFiles) {
      alert(`Максимальное количество файлов: ${maxFiles}`)
      return
    }

    // Создаем превью для новых файлов
    const filesWithPreview: UploadedFile[] = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: true,
      uploaded: false
    }))

    // Если не multiple, заменяем все файлы
    if (!multiple) {
      setFiles(filesWithPreview)
    } else {
      setFiles(prev => [...prev, ...filesWithPreview])
    }

    // Загружаем файлы
    for (let i = 0; i < filesWithPreview.length; i++) {
      const fileData = filesWithPreview[i]
      try {
        const url = await uploadFile(fileData.file)
        
        setFiles(prev => prev.map(f => 
          f.preview === fileData.preview 
            ? { ...f, uploading: false, uploaded: true, url }
            : f
        ))

        // Обновляем значение будет происходить в useEffect

      } catch (error) {
        console.error('Ошибка загрузки:', error)
        setFiles(prev => prev.map(f => 
          f.preview === fileData.preview 
            ? { ...f, uploading: false, uploaded: false, error: error instanceof Error ? error.message : 'Ошибка загрузки' }
            : f
        ))
      }
    }
  }, [files.length, multiple, maxFiles, disabled]) // Убираем onChange из зависимостей

  // Удаление файла
  const removeFile = useCallback((index: number) => {
    if (disabled) return

    setFiles(prev => prev.filter((_, i) => i !== index))
  }, [disabled])

  // Drag & Drop обработчики
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles)
    }
  }, [disabled, handleFiles])

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles) {
      handleFiles(selectedFiles)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Зона загрузки */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-600 mb-2">{placeholder}</p>
        <p className="text-sm text-gray-500">
          Поддерживаемые форматы: JPEG, PNG, WebP, GIF (до 10MB)
        </p>
        {multiple && (
          <p className="text-sm text-gray-500">
            Максимум файлов: {maxFiles}
          </p>
        )}
      </div>

      {/* Превью загруженных файлов */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((fileData, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                {fileData.preview ? (
                  <Image
                    src={fileData.preview}
                    alt={`Превью ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                {/* Оверлей с состоянием */}
                {fileData.uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  </div>
                )}
                
                {fileData.error && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-75 flex items-center justify-center p-2">
                    <p className="text-white text-xs text-center">{fileData.error}</p>
                  </div>
                )}
              </div>
              
              {/* Кнопка удаления */}
              {!disabled && (
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}