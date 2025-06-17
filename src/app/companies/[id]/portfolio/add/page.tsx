'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { addPortfolioItem, supabase } from '@/lib/supabase'
import LocationSelector from '@/components/ui/LocationSelector'

export default function AddPortfolioProjectPage() {
  const { id } = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    region_id: '',
    region_name: ''
  })

  // Проверка авторизации
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setIsAuthenticated(true)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error)
        router.push('/login')
      } finally {
        setAuthLoading(false)
      }
    }

         checkAuth()
   }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const projectData = {
        company_id: id as string,
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date,
        location: formData.region_name, // Используем название региона для location
        category: 'portfolio', // Добавляем категорию по умолчанию
        status: 'completed', // Статус по умолчанию
        featured: false,
        images: [],
        tags: [],
        project_url: '',
        client_name: '',
        project_value: 0
      }

      console.log('Отправляем данные проекта:', projectData)
      const result = await addPortfolioItem(projectData)
      
      if (result.error) {
        console.error('Ошибка при добавлении проекта:', result.error)
        setError(`Ошибка при добавлении проекта: ${result.error.message}`)
        return
      }
      
      console.log('Проект успешно добавлен:', result.data)
      // Перенаправляем обратно на страницу портфолио
      router.push(`/companies/${id}/portfolio`)
    } catch (error) {
      console.error('Ошибка при добавлении проекта:', error)
      setError('Произошла ошибка при добавлении проекта')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRegionChange = (regionId: string, regionName: string) => {
    setFormData(prev => ({
      ...prev,
      region_id: regionId,
      region_name: regionName
    }))
  }

  const handleCityChange = (cityId: string, cityName: string) => {
    // В данном случае мы используем только регион, но можно расширить
  }

  // Показываем загрузку пока проверяем авторизацию
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Если не авторизован, не показываем форму (редирект уже произошел)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href={`/companies/${id}/portfolio`}
              className="text-blue-600 hover:text-blue-800 flex items-center"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Назад к портфолио
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Добавить проект</h1>
          <p className="text-gray-600 mt-1">Добавьте новый проект в портфолио компании</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
          {/* Название проекта */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Название проекта *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Введите название проекта"
            />
          </div>

          {/* Описание */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Опишите проект подробно"
            />
          </div>

          {/* Срок реализации */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
                Дата начала *
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
                Дата окончания *
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Регион */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Регион *
            </label>
            <LocationSelector
              regionId={formData.region_id}
              onRegionChange={handleRegionChange}
              onCityChange={handleCityChange}
              required
              placeholder={{
                region: 'Выберите регион'
              }}
            />
          </div>

          {/* Кнопки */}
          <div className="flex justify-end space-x-4 pt-6">
            <Link
              href={`/companies/${id}/portfolio`}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Отмена
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Добавление...' : 'Добавить проект'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}