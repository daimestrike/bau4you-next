'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createCompany, supabase } from '@/lib/supabase'
import ImageUpload from '@/components/ui/ImageUpload'

interface CompanyFormData {
  name: string
  description: string
  type: string
  website: string
  logo_url: string
  city: string
  services: string[]
  industry?: string
  region_id?: string
  founding_year?: number | string
  employee_count?: number | string
  email?: string
  cover_image_url?: string
  phone?: string
}

export default function CreateCompanyPage() {
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    description: '',
    type: '',
    website: '',
    logo_url: '',
    city: '',
    services: [''],
    industry: '',
    region_id: '',
    founding_year: '',
    employee_count: '',
    email: '',
    cover_image_url: '',
    phone: ''
  })
  
  // Восстанавливаем загрузку регионов после добавления region_id в БД
  const [regions, setRegions] = useState<{id: string, name: string}[]>([])
  const [authLoading, setAuthLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth error:', error)
          setIsAuthenticated(false)
          router.push('/login?redirect=' + encodeURIComponent('/companies/create'))
          return
        }

        if (session?.user) {
          console.log('✅ Пользователь авторизован:', session.user.email)
          setIsAuthenticated(true)
          // Восстанавливаем загрузку регионов после добавления region_id в БД
          loadRegions()
        } else {
          console.log('🔄 Пользователь не авторизован, перенаправление на вход')
          setIsAuthenticated(false)
          router.push('/login?redirect=' + encodeURIComponent('/companies/create'))
          return
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setIsAuthenticated(false)
        router.push('/login?redirect=' + encodeURIComponent('/companies/create'))
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()

    // Слушаем изменения авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email)
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        router.push('/login?redirect=' + encodeURIComponent('/companies/create'))
      } else if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true)
        setAuthLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  // Восстанавливаем загрузку регионов
  const loadRegions = async () => {
    try {
      console.log('🔍 Начинаем загрузку регионов...')
      
      const { data, error } = await supabase
        .from('regions')
        .select('id, name')
        .order('name')
      
      if (error) {
        console.error('❌ Ошибка Supabase:', error)
        throw error
      }
      
      setRegions(data || [])
      console.log('✅ Регионы успешно загружены:', data?.length || 0)
    } catch (error) {
      console.error('💥 Критическая ошибка загрузки регионов:', error)
    }
  }

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
        [name]: ['founding_year', 'employee_count'].includes(name) 
          ? (value === '' ? '' : Number(value)) 
          : value
      }))
    }
  }

  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...formData.services]
    newServices[index] = value
    setFormData(prev => ({
      ...prev,
      services: newServices
    }))
  }

  const addServiceField = () => {
    if (formData.services.length < 10) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, '']
      }))
    }
  }

  const removeServiceField = (index: number) => {
    if (formData.services.length > 1) {
      const newServices = formData.services.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        services: newServices
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log('📝 Начинаем создание компании...')
      
      // Фильтруем пустые услуги
      const filteredServices = formData.services.filter(service => service.trim() !== '')
      
      // Подготавливаем данные для отправки со всеми полями после миграции
      const companyData = {
        name: formData.name,
        description: formData.description,
        type: formData.type || 'contractor',
        website: formData.website || null,
        logo_url: formData.logo_url || null,
        region_id: formData.region_id ? parseInt(formData.region_id as string) : null,
        // Восстанавливаем все поля после успешной миграции
        location: formData.city || null,
        phone: formData.phone || null,
        email: formData.email || null,
        // Можно добавить address если нужно
        address: null // пока не используется в форме
        // Убираем status так как этого поля нет в БД
        // status: 'active'
      }
      
      console.log('📝 Отправляем данные компании:', companyData)

      // Получаем токен авторизации
      console.log('🔑 Начинаем получение токена...')
      let session, token
      try {
        console.log('🔍 Вызываем supabase.auth.getSession()...')
        
        // Добавляем таймаут для getSession
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        )
        
        const sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as any
        console.log('🔍 getSession завершен, обрабатываем результат...')
        
        session = sessionResult.data?.session
        token = session?.access_token
        
        console.log('🔑 Токен получен:', !!token)
        console.log('👤 Пользователь из сессии:', session?.user?.email)
        console.log('🔍 Session object:', session ? 'exists' : 'null')
        
        if (!session) {
          console.log('⚠️ Сессия не найдена, но продолжаем без токена')
        }
      } catch (tokenError) {
        console.error('❌ Ошибка получения токена:', tokenError)
        console.log('⚠️ Продолжаем без токена авторизации')
        session = null
        token = null
      }

      // Используем API route вместо прямого обращения к Supabase
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        console.log('🔐 Заголовок авторизации установлен')
      } else {
        console.log('⚠️ Токен отсутствует, отправляем без авторизации')
      }

      console.log('🌐 Отправляем запрос к API...')
      console.log('📋 Headers:', headers)
      
      let response
      try {
        response = await fetch('/api/companies', {
          method: 'POST',
          headers,
          body: JSON.stringify(companyData)
        })
        console.log('📡 Fetch завершен успешно')
      } catch (fetchError) {
        console.error('❌ Ошибка fetch:', fetchError)
        throw new Error(`Ошибка сетевого запроса: ${fetchError}`)
      }

      console.log('📡 Получен ответ от API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log('❌ Ошибка от API:', errorData)
        throw new Error(errorData.error || 'Ошибка при создании компании')
      }

      const result = await response.json()
      console.log('✅ Компания создана успешно:', result)
      
      // Получаем ID созданной компании
      const companyId = result.data?.[0]?.id || result.data?.id
      if (companyId) {
        router.push(`/companies/${companyId}`)
      } else {
        router.push('/companies')
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error('❌ Общая ошибка:', error)
      setError(error.message || 'Произошла ошибка при создании компании')
    } finally {
      setIsLoading(false)
    }
  }

  // Показываем загрузку пока проверяется аутентификация
  if (authLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Проверка авторизации...</span>
        </div>
      </main>
    )
  }

  // Если пользователь не авторизован, хук автоматически перенаправит на логин
  if (!isAuthenticated) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <p>Перенаправление на страницу входа...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/companies" 
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          ← Назад к компаниям
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Создать компанию</h1>
        <p className="text-gray-600 mt-1">Зарегистрируйте вашу компанию на платформе</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Название компании *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="ООО 'Строительная компания'"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                Отрасль *
              </label>
              <select
                id="industry"
                name="industry"
                required
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Выберите отрасль</option>
                <option value="construction">Строительство</option>
                <option value="architecture">Архитектура</option>
                <option value="engineering">Инженерия</option>
                <option value="design">Дизайн</option>
                <option value="materials">Строительные материалы</option>
                <option value="equipment">Оборудование</option>
                <option value="consulting">Консалтинг</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div>
              <label htmlFor="region_id" className="block text-sm font-medium text-gray-700 mb-1">
                Регион *
              </label>
              <select
                id="region_id"
                name="region_id"
                required
                value={formData.region_id}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Выберите регион</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Описание компании *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Расскажите о вашей компании, её деятельности и преимуществах"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Контактная информация</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="info@company.ru"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Город
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Москва"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Веб-сайт
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://company.ru"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Дополнительная информация</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="founding_year" className="block text-sm font-medium text-gray-700 mb-1">
                Год основания
              </label>
              <input
                type="number"
                id="founding_year"
                name="founding_year"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.founding_year}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="2020"
              />
            </div>

            <div>
              <label htmlFor="employee_count" className="block text-sm font-medium text-gray-700 mb-1">
                Количество сотрудников
              </label>
              <input
                type="number"
                id="employee_count"
                name="employee_count"
                min="1"
                value={formData.employee_count}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Логотип
              </label>
              <ImageUpload
                value={formData.logo_url}
                onChange={(url) => setFormData(prev => ({ ...prev, logo_url: Array.isArray(url) ? url[0] || '' : url }))}
                multiple={false}
                maxFiles={1}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Обложка
              </label>
              <ImageUpload
                value={formData.cover_image_url || ''}
                onChange={(url) => setFormData(prev => ({ ...prev, cover_image_url: Array.isArray(url) ? url[0] || '' : url }))}
                multiple={false}
                maxFiles={1}
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Услуги</h2>
          
          <div className="space-y-4">
            {formData.services.map((service, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={service}
                  onChange={(e) => handleServiceChange(index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Например: Строительство жилых домов"
                />
                {formData.services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeServiceField(index)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            {formData.services.length < 10 && (
              <button
                type="button"
                onClick={addServiceField}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Добавить услугу
              </button>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Укажите основные услуги, которые предоставляет ваша компания.
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/companies"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </Link>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Создание...' : 'Создать компанию'}
          </button>
        </div>
      </form>
    </main>
  )
}