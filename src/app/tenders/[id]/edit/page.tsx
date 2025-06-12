'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getCurrentUser } from '@/lib/supabase'

interface EditTenderPageProps {
  params: Promise<{
    id: string
  }>
}

interface TenderFormData {
  title: string
  description: string
  category: string
  location: string
  budget_min: number | ''
  budget_max: number | ''
  deadline: string
  status: string
}

export default function EditTenderPage({ params }: EditTenderPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paramsId, setParamsId] = useState<string>('')
  const [formData, setFormData] = useState<TenderFormData>({
    title: '',
    description: '',
    category: '',
    location: '',
    budget_min: '',
    budget_max: '',
    deadline: '',
    status: 'draft'
  })

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setParamsId(resolvedParams.id)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (!paramsId) return
    
    const fetchTender = async () => {
      try {
        // Проверяем авторизацию
        const { user, error: authError } = await getCurrentUser()
        if (authError || !user) {
          router.push(`/simple-login?redirect=/tenders/${paramsId}/edit`)
          return
        }

        // Загружаем данные тендера
        const { data, error } = await supabase
          .from('tenders')
          .select('*')
          .eq('id', paramsId)
          .eq('client_id', user.id) // Проверяем что пользователь - владелец тендера
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            setError('Тендер не найден или у вас нет прав на его редактирование')
          } else {
            throw error
          }
          return
        }

        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || '',
          location: data.location || '',
          budget_min: data.budget_min || '',
          budget_max: data.budget_max || '',
          deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
          status: data.status || 'draft'
        })
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Ошибка при загрузке тендера')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTender()
  }, [paramsId, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget_min' || name === 'budget_max' 
        ? (value === '' ? '' : Number(value)) 
        : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { user, error: authError } = await getCurrentUser()
      if (authError || !user) {
        router.push(`/simple-login?redirect=/tenders/${paramsId}/edit`)
        return
      }

      const updateData = {
        ...formData,
        budget_min: formData.budget_min === '' ? null : formData.budget_min,
        budget_max: formData.budget_max === '' ? null : formData.budget_max,
        deadline: formData.deadline === '' ? null : formData.deadline,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('tenders')
        .update(updateData)
        .eq('id', paramsId)
        .eq('client_id', user.id)

      if (error) {
        throw error
      }

      router.push(`/tenders/${paramsId}`)
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Произошла ошибка при обновлении тендера')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link 
          href={`/tenders/${paramsId}`} 
          className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center"
        >
          ← Назад к тендеру
        </Link>
        
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <h1 className="text-xl font-semibold mb-2">Ошибка</h1>
          <p>{error}</p>
          <Link 
            href="/tenders"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Вернуться к списку тендеров
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link 
          href={`/tenders/${paramsId}`} 
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          ← Назад к тендеру
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Редактировать тендер</h1>
        <p className="text-gray-600 mt-1">Внесите изменения в ваш тендер</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Название тендера *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Например: Строительство загородного дома"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Описание проекта *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Подробно опишите ваш проект, требования и ожидания..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Выберите категорию</option>
                  <option value="construction">Строительство</option>
                  <option value="renovation">Ремонт</option>
                  <option value="design">Дизайн</option>
                  <option value="engineering">Инженерные работы</option>
                  <option value="landscaping">Благоустройство</option>
                  <option value="other">Другое</option>
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Местоположение
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Город, регион"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Бюджет и сроки</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="budget_min" className="block text-sm font-medium text-gray-700 mb-1">
                Бюджет от (₽)
              </label>
              <input
                type="number"
                id="budget_min"
                name="budget_min"
                min="0"
                value={formData.budget_min}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Минимальный бюджет"
              />
            </div>

            <div>
              <label htmlFor="budget_max" className="block text-sm font-medium text-gray-700 mb-1">
                Бюджет до (₽)
              </label>
              <input
                type="number"
                id="budget_max"
                name="budget_max"
                min="0"
                value={formData.budget_max}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Максимальный бюджет"
              />
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Срок выполнения
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Статус тендера</h2>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Статус
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="draft">Черновик</option>
              <option value="published">Опубликован</option>
              <option value="in_progress">В работе</option>
              <option value="completed">Завершен</option>
              <option value="cancelled">Отменен</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Только опубликованные тендеры видны другим пользователям
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Link
            href={`/tenders/${paramsId}`}
            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </main>
  )
}