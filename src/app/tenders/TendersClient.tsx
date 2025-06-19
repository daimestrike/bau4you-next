'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import dynamic from 'next/dynamic'

// Компонент для безопасного рендеринга дат на клиенте
const ClientDate = dynamic(() => Promise.resolve(({ date, format = 'ru-RU' }: { date: string, format?: string }) => {
  return <span>{new Date(date).toLocaleDateString(format)}</span>
}), { ssr: false })

interface Project {
  id: string
  name: string
  description: string
  budget?: number
  deadline?: string
  created_at: string
  status: string
  category?: string
  location?: string
  region_id?: string
  regions?: { name: string }
  owner_id: string
}

interface TendersClientProps {
  initialProjects: Project[]
}

export default function TendersClient({ initialProjects }: TendersClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [filters, setFilters] = useState({
    category: '',
    region_id: '',
    budget_min: '',
    budget_max: ''
  })
  const [regions, setRegions] = useState<{id: string, name: string}[]>([])

  useEffect(() => {
    checkUser()
    loadRegions()
    // Загружаем проекты сразу при монтировании
    loadProjects()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)
      console.log('[Tenders] Текущий пользователь:', user ? user.email : 'Не авторизован')
    } catch (error) {
      console.log('[Tenders] Ошибка проверки пользователя:', error)
    }
  }

  const loadRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('id, name')
        .order('name')
      
      if (error) {
        console.error('[Tenders] Ошибка загрузки регионов:', error)
        return
      }
      
      setRegions(data || [])
      console.log('[Tenders] Регионы загружены:', data?.length || 0)
    } catch (error) {
      console.error('[Tenders] Ошибка:', error)
    }
  }

  const loadProjects = async () => {
    try {
      setLoading(true)
      console.log('[Tenders] Загрузка проектов для всех пользователей...')
      
      // Используем простой запрос без foreign key
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('[Tenders] Применяем фильтры:', filters)

      // Применяем фильтры
      if (filters.category) {
        query = query.eq('category', filters.category)
        console.log('[Tenders] Фильтр по категории:', filters.category)
      }
      if (filters.region_id) {
        query = query.eq('region_id', filters.region_id)
        console.log('[Tenders] Фильтр по региону:', filters.region_id)
      }
      if (filters.budget_min) {
        query = query.gte('budget', Number(filters.budget_min))
        console.log('[Tenders] Фильтр по минимальному бюджету:', filters.budget_min)
      }
      if (filters.budget_max) {
        query = query.lte('budget', Number(filters.budget_max))
        console.log('[Tenders] Фильтр по максимальному бюджету:', filters.budget_max)
      }

      const { data: projectsData, error: projectsError } = await query

      if (projectsError) {
        console.error('[Tenders] Ошибка загрузки проектов:', projectsError)
        setError('Ошибка загрузки проектов')
        return
      }

      console.log('[Tenders] Проекты загружены:', projectsData?.length || 0)
      console.log('[Tenders] Данные проектов:', projectsData)

      if (!projectsData || projectsData.length === 0) {
        setProjects([])
        return
      }

      // Загружаем регионы отдельно
      const { data: regionsData, error: regionsError } = await supabase
        .from('regions')
        .select('id, name')

      if (regionsError) {
        console.error('[Tenders] Ошибка загрузки регионов:', regionsError)
      }

      // Объединяем данные
      const projectsWithRegions = projectsData.map(project => {
        let region = null
        
        if (project.region_id && regionsData) {
          // Пробуем найти регион по ID (может быть как строка, так и число)
          region = regionsData.find(r => 
            r.id.toString() === project.region_id?.toString()
          )
        }
        
        return {
          ...project,
          regions: region ? { name: region.name } : null
        }
      })

      console.log('[Tenders] Проекты с регионами:', projectsWithRegions)
      
      // Дополнительное логирование для отладки регионов
      projectsWithRegions.forEach((project, index) => {
        console.log(`[Tenders] Проект ${index + 1}:`, {
          name: project.name,
          region_id: project.region_id,
          regions: project.regions,
          location: project.location
        })
      })
      
      setProjects(projectsWithRegions)
    } catch (error) {
      console.error('[Tenders] Ошибка:', error)
      setError('Произошла ошибка при загрузке проектов')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loadProjects()
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'construction': return 'Строительство'
      case 'renovation': return 'Ремонт'
      case 'design': return 'Дизайн'
      case 'engineering': return 'Инженерные работы'
      case 'landscaping': return 'Благоустройство'
      case 'industrial': return 'Промышленность'
      case 'commercial': return 'Коммерческая недвижимость'
      case 'residential': return 'Частное строительство'
      case 'other': return 'Другое'
      default: return category
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <h1 className="text-3xl font-bold text-gray-900">Проекты и тендеры</h1>
          <p className="text-gray-600 mt-1">
            Найдите подходящие проекты для вашего бизнеса
            {currentUser ? ` (Вы авторизованы как ${currentUser.email})` : ' (Доступно для всех)'}
          </p>
        </div>
        {currentUser ? (
          <Link 
            href="/projects/create" 
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Создать проект
          </Link>
        ) : (
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Войти для создания проекта
          </Link>
        )}
      </div>
      
      {/* Фильтры */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8" suppressHydrationWarning>
        <h2 className="text-lg font-medium mb-4">Фильтры</h2>
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div suppressHydrationWarning>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Категория
            </label>
            <select 
              id="category" 
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Все категории</option>
              <option value="construction">Строительство</option>
              <option value="renovation">Ремонт</option>
              <option value="design">Дизайн</option>
              <option value="engineering">Инженерные работы</option>
              <option value="landscaping">Благоустройство</option>
              <option value="industrial">Промышленность</option>
              <option value="commercial">Коммерческая недвижимость</option>
              <option value="residential">Частное строительство</option>
              <option value="other">Другое</option>
            </select>
          </div>
          
          <div suppressHydrationWarning>
            <label htmlFor="region_id" className="block text-sm font-medium text-gray-700 mb-1">
              Регион
            </label>
            <select 
              id="region_id" 
              name="region_id"
              value={filters.region_id}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Все регионы</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
          
          <div suppressHydrationWarning>
            <label htmlFor="budget_min" className="block text-sm font-medium text-gray-700 mb-1">
              Бюджет от (₽)
            </label>
            <input 
              type="number" 
              id="budget_min" 
              name="budget_min"
              value={filters.budget_min}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Минимальный бюджет"
            />
          </div>
          
          <div suppressHydrationWarning>
            <label htmlFor="budget_max" className="block text-sm font-medium text-gray-700 mb-1">
              Бюджет до (₽)
            </label>
            <input 
              type="number" 
              id="budget_max" 
              name="budget_max"
              value={filters.budget_max}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Максимальный бюджет"
            />
          </div>
          
          <div className="md:col-span-2 lg:col-span-4 flex justify-end" suppressHydrationWarning>
            <button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Загрузка...' : 'Применить фильтры'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Результаты */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12" suppressHydrationWarning>
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center" suppressHydrationWarning>
            <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null)
              loadProjects()
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12" suppressHydrationWarning>
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center" suppressHydrationWarning>
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Проекты не найдены</h3>
          <p className="text-gray-500 mb-6">
            Попробуйте изменить параметры поиска или создайте свой первый проект
          </p>
          <Link
            href="/projects/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <span>Создать проект</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              href={`/projects/${project.id}`} 
              key={project.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 mr-2">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{project.name}</h3>
                  {project.category && (
                    <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                      {getCategoryText(project.category)}
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
              
                              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-600">
                    {project.budget
                      ? `${project.budget.toLocaleString()} ₽`
                      : 'Бюджет не указан'}
                  </span>
                </div>
                
                {/* Местоположение - делаем более заметным */}
                {project.regions?.name && (
                  <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">{project.regions.name}</span>
                  </div>
                )}
                
                {!project.regions?.name && project.location && (
                  <div className="flex items-center text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    <svg className="h-4 w-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium">{project.location}</span>
                  </div>
                )}

                {!project.regions?.name && !project.location && (
                  <div className="flex items-center text-sm text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Местоположение не указано</span>
                  </div>
                )}
                
                {project.deadline && (
                  <div className="text-sm text-gray-500">
                    Срок: <ClientDate date={project.deadline} />
                  </div>
                )}

                <div className="text-sm text-gray-400">
                  Создан: <ClientDate date={project.created_at} />
                </div>
                
                {currentUser && currentUser.id === project.owner_id && (
                  <div className="text-xs text-blue-600 font-medium mt-2">
                    ✏️ Вы можете редактировать этот проект
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}