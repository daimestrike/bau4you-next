'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getCurrentUser } from '@/lib/supabase'

interface ApplyPageProps {
  params: Promise<{
    id: string
  }>
}

interface TenderData {
  id: string
  title: string
  description: string
  budget: number
  deadline?: string
  created_at: string
}

export default function ApplyToTenderPage({ params }: ApplyPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tender, setTender] = useState<TenderData | null>(null)
  const [paramsId, setParamsId] = useState<string>('')
  const [formData, setFormData] = useState({
    proposal: '',
    budget: '',
    timeline: ''
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
          router.push(`/simple-login?redirect=/tenders/${paramsId}/apply`)
          return
        }

        // Загружаем данные тендера
        const { data, error } = await supabase
          .from('tenders')
          .select('*')
          .eq('id', paramsId)
          .single()

        if (error) {
          throw error
        }

        setTender(data)
        
        // Устанавливаем начальный бюджет на основе тендера
        if (data.budget) {
          setFormData(prev => ({
            ...prev,
            budget: data.budget.toString()
          }))
        }
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Ошибка при загрузке тендера')
      } finally {
        setIsLoading(false)
      }
    }

    fetchTender()
  }, [paramsId, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const { user } = await getCurrentUser()
      if (!user) {
        router.push(`/simple-login?redirect=/tenders/${paramsId}/apply`)
        return
      }

      const applicationData = {
        tender_id: paramsId,
        contractor_id: user.id,
        proposal: formData.proposal,
        budget: parseFloat(formData.budget),
        timeline: formData.timeline || null,
        status: 'pending'
      }

      const { error } = await supabase
        .from('applications')
        .insert(applicationData)

      if (error) {
        throw error
      }

      // Перенаправляем на страницу тендера
      router.push(`/tenders/${paramsId}?application=success`)
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Ошибка при отправке заявки')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-3xl">
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
            href={`/tenders/${paramsId}`}
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Вернуться к тендеру
          </Link>
        </div>
      </main>
    )
  }

  if (!tender) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg">
          <h1 className="text-xl font-semibold mb-2">Тендер не найден</h1>
          <p>Запрашиваемый тендер не существует или был удален.</p>
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
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <Link 
        href={`/tenders/${paramsId}`} 
        className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center"
      >
        ← Назад к тендеру
      </Link>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Подать заявку на тендер</h1>
        <p className="text-gray-600">{tender.title}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="proposal" className="block text-sm font-medium text-gray-700 mb-1">
                Ваше предложение *
              </label>
              <textarea
                id="proposal"
                name="proposal"
                required
                rows={6}
                value={formData.proposal}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Опишите, как вы планируете выполнить проект, ваш опыт в подобных работах и почему заказчик должен выбрать именно вас..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                  Ваша цена (₽) *
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  required
                  min="0"
                  value={formData.budget}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Укажите стоимость работ"
                />
                {(tender as any).budget_min && (tender as any).budget_max && (
                  <p className="text-xs text-gray-500 mt-1">
                    Бюджет заказчика: {(tender as any).budget_min.toLocaleString()} - {(tender as any).budget_max.toLocaleString()} ₽
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
                  Срок выполнения
                </label>
                <input
                  type="text"
                  id="timeline"
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Например: 2 недели, 1 месяц"
                />
              </div>
            </div>
          </div>
        </div>

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
            {isSubmitting ? 'Отправка...' : 'Отправить заявку'}
          </button>
        </div>
      </form>
    </main>
  )
}