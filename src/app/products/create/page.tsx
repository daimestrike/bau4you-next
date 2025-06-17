'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import ImageUpload from '@/components/ui/ImageUpload'

interface ProductFormData {
  name: string
  description: string
  price: number | ''
  discount: number | ''
  category: string
  images: string[]
  stock_quantity: number | ''
  specifications: string
}

export default function CreateProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    discount: '',
    category: '',
    images: [],
    stock_quantity: '',
    specifications: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: ['price', 'discount', 'stock_quantity'].includes(name) 
          ? (value === '' ? '' : Number(value)) 
          : value
      }))
    }
  }

  const handleImagesChange = useCallback((images: string | string[]) => {
    console.log('🖼️ Изменение изображений:', images)
    setFormData(prev => ({
      ...prev,
      images: Array.isArray(images) ? images : (images ? [images] : [])
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Защита от повторных вызовов
    if (isLoading) {
      console.log('⚠️ Создание товара уже в процессе, игнорируем повторный вызов')
      return
    }
    
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    // Дополнительная защита - блокируем кнопку на 2 секунды минимум
    const startTime = Date.now()

    try {
      console.log('🚀 Начинаем создание товара...')
      console.log('📝 Исходные данные формы:', formData)
      
      // Минимальные данные для создания товара
      const productData: Record<string, unknown> = {
        name: formData.name,
        description: formData.description,
        price: formData.price === '' ? 0 : Number(formData.price),
        category: formData.category,
        status: 'active'
      }
      
      // Добавляем дополнительные поля только если они есть в таблице
      if (formData.images && formData.images.length > 0) {
        productData.images = formData.images
      }
      
      if (formData.specifications && formData.specifications.trim() !== '') {
        productData.specifications = formData.specifications
      }
      
      if (formData.discount !== '' && formData.discount !== null) {
        productData.discount = Number(formData.discount)
      }
      
      // Устанавливаем stock_quantity, если не указано - то 0
      productData.stock_quantity = formData.stock_quantity !== '' && formData.stock_quantity !== null 
        ? Number(formData.stock_quantity) 
        : 0
      


      console.log('📦 Подготовленные данные товара:', productData)

      console.log('🔄 Начинаем получение токена...')
      // Получаем токен для API запроса с таймаутом
      let token = null
      try {
        console.log('🔍 Вызываем supabase.auth.getSession() с таймаутом 10 секунд...')
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        )
        
        const { data: { session }, error: sessionError } = await Promise.race([sessionPromise, timeoutPromise]) as any
        
        if (sessionError) {
          console.log('⚠️ Ошибка сессии:', sessionError)
        }
        
        token = session?.access_token
        console.log('🔑 Токен получен:', !!token)
        console.log('📋 Session данные:', session ? 'есть' : 'нет')
        console.log('👤 User ID:', session?.user?.id || 'не найден')
        
        // Если токена нет, пробуем получить пользователя напрямую
        if (!token) {
          console.log('🔄 Пробуем получить пользователя напрямую...')
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          if (user && !userError) {
            console.log('✅ Пользователь найден напрямую:', user.id)
            // Пробуем обновить сессию
            await supabase.auth.refreshSession()
            const { data: { session: newSession } } = await supabase.auth.getSession()
            token = newSession?.access_token
            console.log('🔄 Токен после обновления сессии:', !!token)
          }
        }
      } catch (authError) {
        console.log('⚠️ Ошибка получения токена:', authError)
        console.log('⚠️ Не удалось получить токен, будет использован fallback')
      }
      
      console.log('✅ Токен обработан, переходим к API запросу...')

      // Отправляем данные через API
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const apiUrl = `${window.location.origin}/api/products`
      console.log('🌐 API URL:', apiUrl)
      console.log('📋 Headers:', headers)
      console.log('📦 Данные для отправки:', JSON.stringify(productData, null, 2))

      console.log('🚀 Отправляем fetch запрос...')
      const response = await Promise.race([
        fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(productData)
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: запрос превысил 30 секунд')), 30000)
        )
      ]) as Response

      console.log('📡 Получен ответ от сервера, статус:', response.status)
      console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()))
      
      const result = await response.json()
      console.log('📊 Результат API:', result)

      if (!response.ok) {
        console.error('❌ Ошибка API:', result)
        console.log('🔄 Пробуем альтернативный способ создания...')
        
        // Fallback: прямое создание через Supabase
        try {
          const { createProduct } = await import('@/lib/supabase')
          const fallbackResult = await createProduct(productData)
          
          if (fallbackResult.error) {
            throw new Error(fallbackResult.error.message)
          }
          
          console.log('✅ Товар создан через fallback метод:', fallbackResult.data)
          setSuccess('Товар успешно создан! Перенаправляем на страницу управления товарами...')
          
          setTimeout(() => {
            router.push('/products/manage')
          }, 2000)
          return
        } catch (fallbackError) {
          console.error('❌ Fallback также не сработал:', fallbackError)
          throw new Error(result?.error || (fallbackError instanceof Error ? fallbackError.message : String(fallbackError)) || 'Ошибка при создании товара')
        }
      }

      console.log('✅ Товар создан успешно через API:', result.data)
      setSuccess('Товар успешно создан! Перенаправляем на страницу управления товарами...')
      
      // Небольшая задержка перед перенаправлением для отображения успеха
      setTimeout(() => {
        router.push('/products/manage')
      }, 2000)
      
    } catch (err: unknown) {
      const error = err as Error
      console.error('💥 Общая ошибка:', error)
      
      let errorMessage = 'Произошла ошибка при создании продукта'
      
      if (error.message) {
        errorMessage = error.message
      }
      
      // Добавляем дополнительную информацию для отладки
      if (error.message?.includes('listener indicated an asynchronous response')) {
        errorMessage = 'Ошибка браузера: Попробуйте отключить расширения браузера или очистить кэш.'
      }
      
      setError(errorMessage)
    } finally {
      // Минимальная задержка для предотвращения спама
      const elapsed = Date.now() - startTime
      const minDelay = 2000 // 2 секунды минимум
      
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed))
      }
      
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/products" 
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          ← Назад к продуктам
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Добавить продукт</h1>
        <p className="text-gray-600 mt-1">Разместите ваш товар на маркетплейсе</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Название товара *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Например: Кирпич керамический полнотелый"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Категория *
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Выберите категорию</option>
                <option value="building_materials">Строительные материалы</option>
                <option value="tools">Инструменты</option>
                <option value="equipment">Оборудование</option>
                <option value="plumbing">Сантехника</option>
                <option value="electrical">Электрика</option>
                <option value="finishing_materials">Отделочные материалы</option>
                <option value="furniture">Мебель</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Описание *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Подробное описание товара, его характеристики и преимущества"
              />
            </div>

            <div>
              <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-1">
                Технические характеристики
              </label>
              <textarea
                id="specifications"
                name="specifications"
                rows={3}
                value={formData.specifications}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Размеры, вес, материал, цвет и другие характеристики"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Цена и наличие</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Цена (₽) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0.00"
              />
              <p className="text-sm text-gray-500 mt-1">
                Укажите 0, если цена предоставляется по запросу
              </p>
            </div>

            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                Скидка (%)
              </label>
              <input
                type="number"
                id="discount"
                name="discount"
                min="0"
                max="100"
                step="1"
                value={formData.discount}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-1">
                Количество на складе
              </label>
              <input
                type="number"
                id="stock_quantity"
                name="stock_quantity"
                min="0"
                step="1"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="0"
              />
            </div>


          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Изображения товара</h2>
          
          <ImageUpload
            value={formData.images}
            onChange={handleImagesChange}
            multiple={true}
            maxFiles={5}
            placeholder="Перетащите изображения товара сюда или нажмите для выбора"
            disabled={isLoading}
          />
          
          <p className="text-sm text-gray-500 mt-4">
            Добавьте до 5 изображений товара. Первое изображение будет использоваться как основное.
            Поддерживаемые форматы: JPEG, PNG, WebP, GIF (до 10MB каждое).
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/products"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Создание...' : 'Создать продукт'}
          </button>
        </div>
      </form>
    </main>
  )
}