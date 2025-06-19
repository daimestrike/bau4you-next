'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase, getCurrentUser } from '@/lib/supabase'

interface ApplicationsPageProps {
  params: Promise<{
    id: string
  }>
}

interface Application {
  id: string
  proposal: string
  budget: number
  timeline?: string
  status: string
  created_at: string
  contractor_id: string
  profiles?: {
    name_first?: string
    name_last?: string
    company_name?: string
    avatar_url?: string
    email?: string
    phone?: string
  }
}

interface Tender {
  id: string
  title: string
  description: string
  budget_min?: number
  budget_max?: number
  status: string
  client_id: string
}

export default function TenderApplicationsPage({ params }: ApplicationsPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paramsId, setParamsId] = useState<string>('')
  const [tender, setTender] = useState<Tender | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null)

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params
      setParamsId(resolvedParams.id)
    }
    initParams()
  }, [params])

  useEffect(() => {
    if (!paramsId) return
    
    const fetchData = async () => {
      try {
        // Проверяем авторизацию
        const { user, error: authError } = await getCurrentUser()
        if (authError || !user) {
          router.push(`/simple-login?redirect=/tenders/${paramsId}/applications`)
          return
        }

        // Загружаем данные тендера
        const { data: tenderData, error: tenderError } = await supabase
          .from('tenders')
          .select('*')
          .eq('id', paramsId)
          .eq('client_id', user.id) // Проверяем что пользователь - владелец тендера
          .single()

        if (tenderError) {
          if (tenderError.code === 'PGRST116') {
            setError('Тендер не найден или у вас нет прав на просмотр заявок')
          } else {
            throw tenderError
          }
          return
        }

        setTender(tenderData)

        // Загружаем заявки на тендер
        const { data: applicationsData, error: applicationsError } = await supabase
          .from('applications')
          .select(`
            *,
            profiles:contractor_id(*)
          `)
          .eq('tender_id', paramsId)
          .order('created_at', { ascending: false })

        if (applicationsError) {
          throw applicationsError
        }

        setApplications(applicationsData || [])
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Ошибка при загрузке данных')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [paramsId, router])

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    setUpdatingApplicationId(applicationId)
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (error) {
        throw error
      }

      // Обновляем локальное состояние
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus }
            : app
        )
      )

      // Если заявка принята, можно обновить статус тендера
      if (newStatus === 'accepted' && tender) {
        await supabase
          .from('tenders')
          .update({ 
            status: 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', tender.id)
        
        setTender(prev => prev ? { ...prev, status: 'in_progress' } : null)
      }
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Ошибка при обновлении статуса заявки')
    } finally {
      setUpdatingApplicationId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'withdrawn': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'На рассмотрении'
      case 'accepted': return 'Принята'
      case 'rejected': return 'Отклонена'
      case 'withdrawn': return 'Отозвана'
      default: return status
    }
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
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

  if (!tender) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
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
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link 
          href={`/tenders/${paramsId}`} 
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          ← Назад к тендеру
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Заявки на тендер</h1>
        <p className="text-gray-600 mt-1">{tender.title}</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-blue-600">{applications.length}</div>
          <div className="text-sm text-gray-600">Всего заявок</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {applications.filter(app => app.status === 'pending').length}
          </div>
          <div className="text-sm text-gray-600">На рассмотрении</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-green-600">
            {applications.filter(app => app.status === 'accepted').length}
          </div>
          <div className="text-sm text-gray-600">Принято</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="text-2xl font-bold text-red-600">
            {applications.filter(app => app.status === 'rejected').length}
          </div>
          <div className="text-sm text-gray-600">Отклонено</div>
        </div>
      </div>

      {/* Список заявок */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Пока нет заявок</h3>
          <p className="text-gray-600">Заявки на ваш тендер появятся здесь</p>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {`${application.profiles?.name_first || ''} ${application.profiles?.name_last || ''}`.trim() || application.profiles?.company_name || 'Неизвестный исполнитель'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {getStatusText(application.status)}
                    </span>
                  </div>
                  
                  {application.profiles?.email && (
                    <p className="text-sm text-gray-600 mb-1">
                      Email: {application.profiles.email}
                    </p>
                  )}
                  
                  {application.profiles?.phone && (
                    <p className="text-sm text-gray-600 mb-1">
                      Телефон: {application.profiles.phone}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-500">
                    Подана: {new Date(application.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-semibold text-green-600 mb-1">
                    {application.budget?.toLocaleString()} ₽
                  </div>
                  {application.timeline && (
                    <div className="text-sm text-gray-600">
                      Срок: {application.timeline}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Предложение:</h4>
                <p className="text-gray-700 whitespace-pre-line">{application.proposal}</p>
              </div>
              
              {application.status === 'pending' && (
                <div className="flex space-x-3">
                  <button
                    onClick={() => updateApplicationStatus(application.id, 'accepted')}
                    disabled={updatingApplicationId === application.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatingApplicationId === application.id ? 'Обновление...' : 'Принять'}
                  </button>
                  <button
                    onClick={() => updateApplicationStatus(application.id, 'rejected')}
                    disabled={updatingApplicationId === application.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatingApplicationId === application.id ? 'Обновление...' : 'Отклонить'}
                  </button>
                  <Link
                    href={`/messages?user=${application.contractor_id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Написать сообщение
                  </Link>
                </div>
              )}
              
              {application.status === 'accepted' && (
                <div className="flex space-x-3">
                  <Link
                    href={`/messages?user=${application.contractor_id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Написать сообщение
                  </Link>
                  <button
                    onClick={() => updateApplicationStatus(application.id, 'rejected')}
                    disabled={updatingApplicationId === application.id}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors"
                  >
                    Отменить принятие
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}