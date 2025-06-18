'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, getCurrentUser } from '@/lib/supabase'
import NoSSR from '@/components/NoSSR'
import { 
  CalendarIcon, 
  MapPinIcon, 
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  PaperAirplaneIcon,
  ShareIcon,
  DocumentDuplicateIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline'
import ProjectClient from './ProjectClient'

interface ProjectPageProps {
  params: Promise<{
    id: string
  }>
}

interface Project {
  id: string
  name: string
  description: string
  category: string
  location: string
  budget: number
  deadline: string
  status: string
  materials_list: any
  company_requirements: any
  owner_id: string
  created_at: string
  updated_at: string
  region_id?: number
  regions?: { name: string }
  cities?: { name: string }
  profiles?: {
    id: string
    name_first?: string
    name_last?: string
    email: string
  }
}

interface ProjectApplication {
  id: string
  subject: string
  description: string
  company_id: string
  document_url?: string
  status: string
  created_at: string
  companies?: {
    name: string
    description?: string
    logo_url?: string
    type: string
  }
}

async function getProject(id: string): Promise<Project | null> {
  try {
    console.log('=== ПОЛУЧЕНИЕ ПРОЕКТА ПО ID (КЛИЕНТ) ===')
    console.log('Ищем проект с ID:', id)
    
    // Используем простой запрос без JOIN-ов для надежности
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    console.log('Результат поиска проекта:')
    console.log('data:', project)
    console.log('error:', projectError)

    if (projectError) {
      console.error('Ошибка получения проекта:', projectError)
      return null
    }

    if (!project) {
      console.log('Проект не найден')
      return null
    }

    // Получаем профиль владельца отдельно
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name_first, name_last, email')
      .eq('id', project.owner_id)
      .maybeSingle()

    if (profileError) {
      console.error('Ошибка получения профиля:', profileError)
    }

    // Получаем регион отдельно, если указан region_id
    let region = null
    if (project.region_id) {
      const { data: regionData, error: regionError } = await supabase
        .from('regions')
        .select('id, name')
        .eq('id', project.region_id)
        .maybeSingle()

      if (regionError) {
        console.error('Ошибка получения региона:', regionError)
      } else {
        region = regionData
      }
    }

    console.log('✅ Проект найден:', project.name)
    
    // Возвращаем проект с профилем и регионом
    return {
      ...project,
      profiles: profile || null,
      regions: region || null
    }
  } catch (error) {
    console.error('Общая ошибка получения проекта:', error)
    return null
  }
}

async function getProjectApplications(projectId: string): Promise<ProjectApplication[]> {
  try {
    // Check if project_applications table exists by trying to query it
    const { data: applications, error: applicationsError } = await supabase
      .from('project_applications')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (applicationsError) {
      // If table doesn't exist, just return empty array
      if (applicationsError.code === '42P01') {
        console.log('project_applications table does not exist yet - returning empty array')
        return []
      }
      console.error('Error fetching applications:', applicationsError)
      return []
    }

    if (!applications || applications.length === 0) {
      return []
    }

    // Then get company data for each application
    const companyIds = applications.map(app => app.company_id).filter(Boolean)
    
    if (companyIds.length === 0) {
      return applications.map(app => ({ ...app, companies: null }))
    }

    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('id, name, description, logo_url, type')
      .in('id', companyIds)

    if (companiesError) {
      console.error('Error fetching companies:', companiesError)
      return applications.map(app => ({ ...app, companies: null }))
    }

    // Combine applications with company data
    return applications.map(app => ({
      ...app,
      companies: companies?.find(company => company.id === app.company_id) || null
    }))
  } catch (error) {
    console.error('Error fetching applications:', error)
    return []
  }
}

function ProjectSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-8" suppressHydrationWarning>
        <div className="animate-pulse" suppressHydrationWarning>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" suppressHydrationWarning></div>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 mb-8" suppressHydrationWarning>
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" suppressHydrationWarning></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2" suppressHydrationWarning></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-6" suppressHydrationWarning></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" suppressHydrationWarning>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-xl" suppressHydrationWarning></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function getProfileDisplayName(profile: any) {
  if (profile.full_name) {
    return profile.full_name
  }
  return null
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [applications, setApplications] = useState<ProjectApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  useEffect(() => {
    const loadProjectData = async () => {
      try {
        console.log('Loading project data...')
        
        // Получаем id из асинхронных params
        const resolvedParams = await params
        const projectId = resolvedParams.id
        
        // Получаем текущего пользователя (без требования активной сессии)
        try {
          const { data: { session } } = await supabase.auth.getSession()
          setCurrentUser(session?.user || null)
        } catch (authError) {
          console.log('Ошибка авторизации:', authError)
          setCurrentUser(null)
        }
        
        const [projectData, applicationsData] = await Promise.all([
          getProject(projectId),
          getProjectApplications(projectId)
        ])

        if (!projectData) {
          setError('Проект не найден')
          return
        }

        setProject(projectData)
        setApplications(applicationsData)
        
        // Проверяем, является ли текущий пользователь владельцем проекта
        const { data: { session } } = await supabase.auth.getSession()
        setIsOwner(session?.user?.id === projectData.owner_id)
        
      } catch (err) {
        console.error('Error loading project:', err)
        setError('Ошибка загрузки проекта')
      } finally {
        setLoading(false)
      }
    }

    loadProjectData()
  }, [params])

  // Закрытие мобильного меню при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMobileMenu) {
        const target = event.target as Element
        if (!target.closest('.mobile-menu-container')) {
          setShowMobileMenu(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMobileMenu])

  const handleDeleteProject = async () => {
    if (!project || !isOwner) return
    
    const confirmed = window.confirm('Вы уверены, что хотите удалить этот проект? Это действие нельзя отменить.')
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', project.id)

      if (error) throw error

      router.push('/projects')
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Ошибка при удалении проекта')
    }
  }

  const handleShareProject = () => {
    if (!project) return
    
    const projectUrl = `${window.location.origin}/projects/${project.id}`
    const subject = `Проект "${project.name}" на платформе Bau4You.co`
    const body = `Привет!

Хочу поделиться с тобой интересным проектом, который я нашел на платформе Bau4You.co:

📋 Название: ${project.name}
📍 Местоположение: ${project.regions?.name || project.location || 'Не указано'}
💰 Бюджет: ${project.budget ? formatCurrency(project.budget) : 'По договоренности'}
📅 Срок: ${project.deadline ? formatDate(project.deadline) : 'Не указан'}

📝 Описание:
${project.description}

🔗 Ссылка на проект: ${projectUrl}

Возможно, этот проект будет тебе интересен!

С уважением,
Команда Bau4You.co`

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoLink, '_blank')
  }

  const handleCopyProject = async () => {
    if (!project) return
    
    const projectUrl = `${window.location.origin}/projects/${project.id}`
    const projectText = `📋 ПРОЕКТ: ${project.name}

📍 Местоположение: ${project.regions?.name || project.location || 'Не указано'}
📂 Категория: ${project.category || 'Не указана'}
💰 Бюджет: ${project.budget ? formatCurrency(project.budget) : 'По договоренности'}
📅 Срок выполнения: ${project.deadline ? formatDate(project.deadline) : 'Не указан'}

📝 Описание:
${project.description}

${project.materials_list && project.materials_list.length > 0 ? `
🔧 Материалы:
${project.materials_list.map((material: any, index: number) => 
  `${index + 1}. ${material.name} (${material.category}) - ${material.quantity} ${material.unit}${material.estimated_price ? ` - ${formatCurrency(material.estimated_price)}` : ''}`
).join('\n')}
` : ''}

${project.company_requirements && project.company_requirements.length > 0 ? `
🏢 Требования к компаниям:
${project.company_requirements.map((req: any, index: number) => 
  `${index + 1}. ${req.role} (${req.type}) - ${req.description}${req.budget_min || req.budget_max ? ` - Бюджет: ${req.budget_min ? formatCurrency(req.budget_min) : ''}${req.budget_min && req.budget_max ? ' - ' : ''}${req.budget_max ? formatCurrency(req.budget_max) : ''}` : ''}`
).join('\n')}
` : ''}

👤 Владелец: ${getProfileDisplayName(project.profiles) || 'Владелец проекта'}
📧 Email: ${project.profiles?.email || ''}
📅 Создано: ${formatDate(project.created_at)}

🔗 Ссылка: ${projectUrl}

---
Проект с платформы Bau4You.co`

    try {
      await navigator.clipboard.writeText(projectText)
      alert('Информация о проекте скопирована в буфер обмена!')
    } catch (error) {
      console.error('Ошибка копирования:', error)
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea')
      textArea.value = projectText
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Информация о проекте скопирована в буфер обмена!')
    }
  }

  if (loading) {
    return <ProjectSkeleton />
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <BuildingOfficeIcon className="h-12 w-12 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Проект не найден</h3>
            <p className="text-gray-500 mb-6">{error || 'Проект не существует или был удален'}</p>
            <Link
              href="/projects"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Вернуться к проектам
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const location = project.cities?.name && project.regions?.name 
    ? `${project.cities.name}, ${project.regions.name}`
    : project.location || 'Не указано'

  return (
    <NoSSR fallback={<ProjectSkeleton />}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-8" suppressHydrationWarning>
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Главная
          </Link>
          <span>/</span>
          <Link href="/projects" className="hover:text-blue-600 transition-colors">
            Проекты
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{project.name}</span>
        </nav>

        {/* Project Header */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-4 md:p-8 mb-8">
          <div className="flex flex-col gap-6">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">{project.name}</h1>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Desktop buttons - hidden on mobile */}
                  <div className="hidden md:flex items-center gap-3">
                    {/* Share and Copy buttons - always visible */}
                    <button
                      onClick={handleShareProject}
                      className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Поделиться проектом"
                    >
                      <ShareIcon className="h-4 w-4 mr-2" />
                      Поделиться
                    </button>
                    
                    <button
                      onClick={handleCopyProject}
                      className="inline-flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      title="Скопировать информацию о проекте"
                    >
                      <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
                      Копировать
                    </button>

                    {isOwner ? (
                      // Owner buttons
                      <>
                        <Link
                          href={`/projects/${project.id}/edit`}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Редактировать
                        </Link>
                        <button
                          onClick={handleDeleteProject}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Удалить
                        </button>
                      </>
                    ) : currentUser ? (
                      // Non-owner user button - will be handled by ProjectClient
                      <div id="proposal-button-placeholder"></div>
                    ) : null}
                  </div>

                  {/* Mobile menu button */}
                   <div className="md:hidden relative mobile-menu-container">
                     <button
                       onClick={() => setShowMobileMenu(!showMobileMenu)}
                       className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                       title="Меню действий"
                     >
                       <EllipsisVerticalIcon className="h-5 w-5 text-gray-700" />
                     </button>
                     
                     {/* Mobile dropdown menu */}
                     {showMobileMenu && (
                       <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                         <div className="py-2">
                          <button
                            onClick={() => {
                              handleShareProject()
                              setShowMobileMenu(false)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <ShareIcon className="h-4 w-4" />
                            Поделиться
                          </button>
                          
                          <button
                            onClick={() => {
                              handleCopyProject()
                              setShowMobileMenu(false)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <DocumentDuplicateIcon className="h-4 w-4" />
                            Копировать
                          </button>

                          {isOwner ? (
                            <>
                              <Link
                                href={`/projects/${project.id}/edit`}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                onClick={() => setShowMobileMenu(false)}
                              >
                                <PencilIcon className="h-4 w-4" />
                                Редактировать
                              </Link>
                              <button
                                onClick={() => {
                                  handleDeleteProject()
                                  setShowMobileMenu(false)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <TrashIcon className="h-4 w-4" />
                                Удалить
                              </button>
                            </>
                          ) : currentUser ? (
                            <div className="px-4 py-2">
                              <div id="proposal-button-mobile-placeholder"></div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-gray-700 text-base md:text-lg leading-relaxed mb-6 text-left whitespace-pre-wrap break-words">
                {project.description}
              </div>

              {/* Owner Info */}
              {project.profiles && (
                <div className="flex items-center gap-3 p-3 md:p-4 bg-white/50 rounded-xl border border-white/30">
                  <Link 
                    href={`/profile/${project.profiles.id}`}
                    className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0"
                  >
                      <UserIcon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/profile/${project.profiles.id}`}
                      className="font-medium text-gray-900 hover:text-blue-600 transition-colors block truncate"
                    >
                      {getProfileDisplayName(project.profiles) || 'Владелец проекта'}
                    </Link>
                    <p className="text-sm text-gray-600 truncate">{project.profiles.email}</p>
                    <p className="text-xs text-gray-500">
                      Создано: {formatDate(project.created_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {/* Budget */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 md:gap-3 mb-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <CurrencyDollarIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Бюджет</h3>
            </div>
            <p className="text-lg md:text-2xl font-bold text-gray-900 break-words">
              {project.budget ? formatCurrency(project.budget) : 'По договоренности'}
            </p>
          </div>

          {/* Category */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 md:gap-3 mb-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <BuildingOfficeIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Категория</h3>
            </div>
            <p className="text-base md:text-lg font-medium text-gray-700 break-words">
              {project.category || 'Не указана'}
            </p>
          </div>

          {/* Location */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 md:gap-3 mb-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPinIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Местоположение</h3>
            </div>
            <p className="text-base md:text-lg font-medium text-gray-700 break-words">{location}</p>
          </div>

          {/* Deadline */}
          <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 md:p-6 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-2 md:gap-3 mb-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm md:text-base">Срок выполнения</h3>
            </div>
            <p className="text-base md:text-lg font-medium text-gray-700 break-words">
              {project.deadline ? formatDate(project.deadline) : 'Не указан'}
            </p>
          </div>
        </div>

        {/* Materials and Requirements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-8">
          {/* Materials List */}
          {project.materials_list && project.materials_list.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl border border-white/20 p-4 md:p-8">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                <DocumentTextIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-600 flex-shrink-0" />
                Список материалов
              </h2>
              <div className="space-y-3 md:space-y-4">
                {project.materials_list.map((material: any, index: number) => (
                  <div key={index} className="p-3 md:p-4 bg-white/50 rounded-lg md:rounded-xl border border-white/30">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base break-words">{material.name}</h3>
                      <span className="text-xs md:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded self-start">
                        {material.category}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2 text-sm md:text-base break-words">{material.description}</p>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 text-xs md:text-sm">
                      <span className="text-gray-600">
                        Количество: <span className="font-medium">{material.quantity} {material.unit}</span>
                      </span>
                      {material.estimated_price && (
                        <span className="text-green-600 font-medium">
                          {formatCurrency(material.estimated_price)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Company Requirements */}
          {project.company_requirements && project.company_requirements.length > 0 && (
            <div className="bg-white/70 backdrop-blur-md rounded-xl md:rounded-2xl shadow-xl border border-white/20 p-4 md:p-8">
              <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                <BuildingOfficeIcon className="h-5 w-5 md:h-6 md:w-6 text-purple-600 flex-shrink-0" />
                Требования к компаниям
              </h2>
              <div className="space-y-3 md:space-y-4">
                {project.company_requirements.map((req: any, index: number) => (
                  <div key={index} className="p-3 md:p-4 bg-white/50 rounded-lg md:rounded-xl border border-white/30">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base break-words">{req.role}</h3>
                      <span className="text-xs md:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded self-start">
                        {req.type}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2 text-sm md:text-base break-words">{req.description}</p>
                    {(req.budget_min || req.budget_max) && (
                      <div className="text-xs md:text-sm text-gray-600">
                        Бюджет: {req.budget_min && formatCurrency(req.budget_min)}
                        {req.budget_min && req.budget_max && ' - '}
                        {req.budget_max && formatCurrency(req.budget_max)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Client Component for Interactive Parts */}
        <Suspense fallback={<div>Загрузка...</div>}>
          <ProjectClient 
            projectId={project.id} 
            projectOwnerId={project.owner_id}
            initialApplications={applications}
            currentUser={currentUser}
            isOwner={isOwner}
          />
        </Suspense>
      </div>
    </div>
    </NoSSR>
  )
}