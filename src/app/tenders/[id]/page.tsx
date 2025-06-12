'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
  const canApply = currentUser && !isOwner && tender.status === 'published'

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

  return (
    <div className="space-y-8">
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

      {/* Кнопка подачи заявки */}
      {canApply && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Заинтересованы в этом проекте?</h2>
          <Link
            href={`/tenders/${id}/apply`}
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Подать заявку
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