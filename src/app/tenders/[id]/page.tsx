'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import SEOHead from '@/components/SEO/SEOHead'
import { generateTenderSEO, generateTenderArticleSchema, generateBreadcrumbSchema } from '@/lib/seo'

interface TenderPageProps {
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
  contractor_id: string
  profiles?: {
    name_first?: string
    name_last?: string
    company_name?: string
    avatar_url?: string
  }
}

function TenderDetails({ id }: { id: string }) {
  const [tender, setTender] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [userApplication, setUserApplication] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    // Проверяем URL параметры для показа сообщения об успехе
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('application') === 'success') {
      setShowSuccessMessage(true)
      // Убираем параметр из URL
      window.history.replaceState({}, '', window.location.pathname)
      // Скрываем сообщение через 5 секунд
      setTimeout(() => setShowSuccessMessage(false), 5000)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем текущего пользователя
        const { user } = await getCurrentUser()
        setCurrentUser(user)

        // Загружаем тендер
        const { data: tenderData, error: tenderError } = await supabase
          .from('tenders')
          .select(`
            *,
            profiles:client_id(*)
          `)
          .eq('id', id)
          .single()

        if (tenderError) {
          if (tenderError.code === 'PGRST116') {
            notFound()
          }
          throw tenderError
        }

        setTender(tenderData)

        // Загружаем заявки если пользователь - владелец тендера
        if (user && tenderData.client_id === user.id) {
          const { data: applicationsData, error: applicationsError } = await supabase
            .from('applications')
            .select(`
              *,
              profiles:contractor_id(*)
            `)
            .eq('tender_id', id)
            .order('created_at', { ascending: false })

          if (!applicationsError) {
            setApplications(applicationsData || [])
          }
        }

        // Проверяем, подавал ли текущий пользователь заявку на этот тендер
        if (user && tenderData.client_id !== user.id) {
          const { data: userApplicationData, error: userApplicationError } = await supabase
            .from('applications')
            .select('*')
            .eq('tender_id', id)
            .eq('contractor_id', user.id)
            .maybeSingle()

          if (!userApplicationError && userApplicationData) {
            setUserApplication(userApplicationData)
          }
        }
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки тендера')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Ошибка загрузки тендера: {error}</div>
  }

  if (!tender) {
    notFound()
  }

  const isOwner = currentUser && tender.client_id === currentUser.id
  const canApply = currentUser && !isOwner && tender.status === 'published' && !userApplication

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'published': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Черновик'
      case 'published': return 'Опубликован'
      case 'in_progress': return 'В работе'
      case 'completed': return 'Завершен'
      case 'cancelled': return 'Отменен'
      default: return status
    }
  }

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getApplicationStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'На рассмотрении'
      case 'accepted': return 'Принята'
      case 'rejected': return 'Отклонена'
      default: return status
    }
  }

  return (
    <div className="space-y-8">
      {/* Сообщение об успешной подаче заявки */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Заявка успешно отправлена! Заказчик рассмотрит её и свяжется с вами.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                >
                  <span className="sr-only">Закрыть</span>
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{tender.title}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tender.status)}`}>
                {getStatusText(tender.status)}
              </span>
            </div>
            
            {tender.profiles && (
              <p className="text-gray-600">
                Заказчик: {`${tender.profiles.name_first || ''} ${tender.profiles.name_last || ''}`.trim() || tender.profiles.company_name || 'Неизвестный заказчик'}
              </p>
            )}
          </div>
          
          {isOwner && (
            <div className="flex space-x-3">
              <Link
                href={`/tenders/${id}/edit`}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Редактировать
              </Link>
              <Link
                href={`/tenders/${id}/applications`}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Заявки ({applications.length})
              </Link>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <span className="text-gray-500 text-sm">Бюджет:</span>
            <div className="font-medium text-green-600">
              {tender.budget_min && tender.budget_max
                ? `${tender.budget_min.toLocaleString()} - ${tender.budget_max.toLocaleString()} ₽`
                : tender.budget_min
                ? `от ${tender.budget_min.toLocaleString()} ₽`
                : tender.budget_max
                ? `до ${tender.budget_max.toLocaleString()} ₽`
                : 'Бюджет не указан'}
            </div>
          </div>
          
          {tender.category && (
            <div>
              <span className="text-gray-500 text-sm">Категория:</span>
              <div className="font-medium text-gray-900">{tender.category}</div>
            </div>
          )}
          
          {tender.location && (
            <div>
              <span className="text-gray-500 text-sm">Местоположение:</span>
              <div className="font-medium text-gray-900">{tender.location}</div>
            </div>
          )}
        </div>

        <div className="prose max-w-none mb-6">
          <h2 className="text-xl font-semibold mb-2">Описание проекта</h2>
          <p className="whitespace-pre-line text-gray-700">{tender.description}</p>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>
            {tender.deadline && (
              <span>Срок выполнения: {new Date(tender.deadline).toLocaleDateString('ru-RU')}</span>
            )}
          </div>
          <div>
            Опубликован: {new Date(tender.created_at).toLocaleDateString('ru-RU')}
          </div>
        </div>
      </div>

      {/* Статус заявки пользователя или кнопка подачи заявки */}
      {currentUser && !isOwner && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          {userApplication ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Ваша заявка</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getApplicationStatusColor(userApplication.status)}`}>
                  {getApplicationStatusText(userApplication.status)}
                </span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Ваше предложение:</h3>
                <p className="text-gray-700 whitespace-pre-line">{userApplication.proposal}</p>
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Подана: {new Date(userApplication.created_at).toLocaleDateString('ru-RU')} в {new Date(userApplication.created_at).toLocaleTimeString('ru-RU')}</span>
                {userApplication.status === 'pending' && (
                  <span className="text-blue-600">Ожидайте ответа от заказчика</span>
                )}
                {userApplication.status === 'accepted' && (
                  <span className="text-green-600">Поздравляем! Ваша заявка принята</span>
                )}
                {userApplication.status === 'rejected' && (
                  <span className="text-red-600">К сожалению, ваша заявка отклонена</span>
                )}
              </div>
            </div>
          ) : tender.status === 'published' ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">Заинтересованы в этом проекте?</h2>
              <Link
                href={`/tenders/${id}/apply`}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Подать заявку
              </Link>
            </div>
          ) : (
            <div className="text-gray-600">
              <h2 className="text-lg font-semibold mb-2">Тендер недоступен для подачи заявок</h2>
              <p>Статус тендера: {getStatusText(tender.status)}</p>
            </div>
          )}
        </div>
      )}

      {/* Информация для неавторизованных пользователей */}
      {!currentUser && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Заинтересованы в этом проекте?</h2>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Войти для подачи заявки
          </Link>
        </div>
      )}

      {/* Информация для владельца */}
      {isOwner && applications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Последние заявки</h2>
            <Link
              href={`/tenders/${id}/applications`}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Посмотреть все →
            </Link>
          </div>
          
          <div className="space-y-3">
            {applications.slice(0, 3).map((application) => (
              <div key={application.id} className="flex justify-between items-center p-3 border border-gray-200 rounded">
                <div>
                  <div className="font-medium">
                    {`${application.profiles?.name_first || ''} ${application.profiles?.name_last || ''}`.trim() || application.profiles?.company_name || 'Неизвестный исполнитель'}
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(application.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-green-600">
                    {application.budget?.toLocaleString()} ₽
                  </div>
                  <div className="text-sm text-gray-600">
                    {application.status === 'pending' ? 'На рассмотрении' : 
                     application.status === 'accepted' ? 'Принята' : 
                     application.status === 'rejected' ? 'Отклонена' : application.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default async function TenderPage({ params }: TenderPageProps) {
  const { id } = await params
  
  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <Link 
        href="/tenders" 
        className="text-blue-600 hover:text-blue-800 mb-6 inline-flex items-center"
      >
        ← Назад к тендерам
      </Link>
      
      <Suspense fallback={
        <div className="space-y-8 animate-pulse">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      }>
        <TenderDetails id={id} />
      </Suspense>
    </main>
  )
}