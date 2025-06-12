'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCurrentUser, supabase } from '@/lib/supabase'
import { 
  PlusIcon, 
  BuildingOfficeIcon, 
  ShoppingBagIcon, 
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

export default function ProjectsPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Защита от гидратации
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    console.log('[Projects] Проверка аутентификации...')
    checkAuthAndLoadData()
  }, [mounted])

  const checkAuthAndLoadData = async () => {
    try {
      const { user: currentUser, error } = await getCurrentUser()
      
      if (error || !currentUser) {
        console.log('[Projects] Пользователь не авторизован, редирект на /simple-login')
        router.replace('/simple-login?redirect=/projects')
        return
      }

      console.log('[Projects] Пользователь найден:', currentUser.email)
      setUser(currentUser)
      await loadProjects(currentUser.id)
    } catch (error) {
      console.error('[Projects] Ошибка проверки аутентификации:', error)
      setError('Ошибка проверки аутентификации')
      router.replace('/simple-login?redirect=/projects')
    }
  }

  const loadProjects = async (userId: string) => {
    try {
      console.log('[Projects] Загрузка проектов для пользователя:', userId)
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_materials (
            id,
            quantity,
            status,
            products (
              id,
              name,
              price,
              category
            )
          ),
          project_companies (
            id,
            role,
            status,
            companies (
              id,
              name,
              type,
              location
            )
          )
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[Projects] Ошибка загрузки проектов:', error)
        setError('Ошибка загрузки проектов')
        return
      }

      console.log('[Projects] Проекты загружены:', data?.length || 0)
      setProjects(data || [])
    } catch (error) {
      console.error('[Projects] Ошибка:', error)
      setError('Произошла ошибка при загрузке проектов')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'on_hold': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planning': return 'Планирование'
      case 'active': return 'В работе'
      case 'completed': return 'Завершен'
      case 'on_hold': return 'Приостановлен'
      default: return 'Неизвестно'
    }
  }

  // Не рендерим ничего до монтирования на клиенте
  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <BuildingOfficeIcon className="h-12 w-12 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Мои проекты</h1>
            <p className="mt-2 text-gray-600">
              Управляйте проектами, материалами и компаниями
            </p>
          </div>
          <Link
            href="/projects/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Новый проект</span>
          </Link>
        </div>

        {/* Список проектов */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {/* Заголовок проекта */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
                      <p className="mt-1 text-gray-600">{project.description}</p>
                      
                      <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                        {project.location && (
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            {project.location}
                          </div>
                        )}
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {new Date(project.created_at).toLocaleDateString('ru-RU')}
                        </div>
                        {project.budget && (
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            {project.budget.toLocaleString()} ₽
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="ml-4">
                      <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Материалы и компании */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Материалы */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-900 flex items-center">
                          <ShoppingBagIcon className="h-4 w-4 mr-2" />
                          Материалы
                        </h3>
                        <Link
                          href={`/projects/${project.id}/materials`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Управлять
                        </Link>
                      </div>
                      
                      {project.project_materials && project.project_materials.length > 0 ? (
                        <div className="space-y-2">
                          {project.project_materials.slice(0, 3).map((material: any) => (
                            <div key={material.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <p className="text-sm font-medium">{material.products?.name}</p>
                                <p className="text-xs text-gray-500">
                                  {material.quantity} шт. • {material.products?.price?.toLocaleString()} ₽/шт.
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded ${
                                material.status === 'ordered' ? 'bg-blue-100 text-blue-800' :
                                material.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {material.status === 'ordered' ? 'Заказан' :
                                 material.status === 'delivered' ? 'Доставлен' : 'Планируется'}
                              </span>
                            </div>
                          ))}
                          {project.project_materials.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{project.project_materials.length - 3} материалов
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 mb-2">Материалы не добавлены</p>
                          <Link
                            href={`/projects/${project.id}/materials/add`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Добавить материалы
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Компании */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-900 flex items-center">
                          <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                          Компании
                        </h3>
                        <Link
                          href={`/projects/${project.id}/companies`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Управлять
                        </Link>
                      </div>
                      
                      {project.project_companies && project.project_companies.length > 0 ? (
                        <div className="space-y-2">
                          {project.project_companies.slice(0, 3).map((company: any) => (
                            <div key={company.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <p className="text-sm font-medium">{company.companies?.name}</p>
                                <p className="text-xs text-gray-500">
                                  {company.role} • {company.companies?.location}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded ${
                                company.status === 'contracted' ? 'bg-green-100 text-green-800' :
                                company.status === 'negotiating' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {company.status === 'contracted' ? 'Договор' :
                                 company.status === 'negotiating' ? 'Переговоры' : 'Поиск'}
                              </span>
                            </div>
                          ))}
                          {project.project_companies.length > 3 && (
                            <p className="text-xs text-gray-500 text-center">
                              +{project.project_companies.length - 3} компаний
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500 mb-2">Компании не привлечены</p>
                          <Link
                            href={`/projects/${project.id}/companies/add`}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Найти компании
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Действия */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex space-x-3">
                      <Link
                        href={`/projects/${project.id}`}
                        className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Подробнее
                      </Link>
                      <Link
                        href={`/projects/${project.id}/edit`}
                        className="flex-1 bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-lg hover:bg-gray-200 text-sm"
                      >
                        Редактировать
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Начните свой первый проект
            </h3>
            <p className="text-gray-500 mb-6">
              Создайте проект, добавьте материалы и найдите подрядчиков
            </p>
            <Link
              href="/projects/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Создать проект</span>
            </Link>
          </div>
        )}
      </div>
    </main>
  )
} 