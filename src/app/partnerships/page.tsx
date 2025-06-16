'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Building2, Mail, UserPlus, Trash2, ExternalLink } from 'lucide-react'
import { getCurrentUser, getFollowedCompanies, unfollowCompany, getAllProjects } from '@/lib/supabase'

interface Company {
  id: string
  name: string
  description: string
  industry: string
  type: string
  location: string
  email: string
  website: string
  logo_url: string
  owner_id: string
  owner_email?: string
  [key: string]: any // Добавляем индексную сигнатуру для дополнительных полей
}

interface Project {
  id: string
  title: string
  description: string
  budget: number
  location: string
  owner_name?: string
  owner_email?: string
}

export default function PartnershipsPage() {
  const [followedCompanies, setFollowedCompanies] = useState<Company[]>([])
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [invitationMessage, setInvitationMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResult = await getCurrentUser()
        if (userResult.user) {
          setCurrentUser(userResult.user)
          
          // Загружаем подписки пользователя
          const companiesResult = await getFollowedCompanies(userResult.user.id)
          if (companiesResult.data) {
            setFollowedCompanies(companiesResult.data as Company[])
          }
          
          // Загружаем все проекты на площадке
          const projectsResult = await getAllProjects()
          if (projectsResult.data) {
            setAllProjects(projectsResult.data)
          }
        }
      } catch (error) {
        console.error('Error loading partnerships data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleUnfollow = async (companyId: string) => {
    try {
      await unfollowCompany(companyId)
      setFollowedCompanies(prev => prev.filter(company => company.id !== companyId))
    } catch (error) {
      console.error('Error unfollowing company:', error)
    }
  }

  const handleSendEmail = (company: Company) => {
    const subject = encodeURIComponent(`Сотрудничество с ${company.name}`)
    const body = encodeURIComponent(`Здравствуйте!\n\nМеня заинтересовала ваша компания ${company.name} и я хотел бы обсудить возможности сотрудничества.\n\nС уважением`)
    window.open(`mailto:${company.owner_email || company.email}?subject=${subject}&body=${body}`)
  }

  const handleInviteToProject = (company: Company) => {
    setSelectedCompany(company)
    setShowProjectModal(true)
  }

  const handleSendInvitation = () => {
    if (!selectedCompany || !selectedProject) return
    
    const project = allProjects.find(p => p.id === selectedProject)
    if (!project) return

    const subject = encodeURIComponent(`Приглашение к участию в проекте: ${project.title}`)
    const projectUrl = `${window.location.origin}/projects/${project.id}`
    const body = encodeURIComponent(
      `Здравствуйте!\n\n` +
      `Приглашаю вашу компанию ${selectedCompany.name} к участию в проекте "${project.title}".\n\n` +
      `Описание проекта: ${project.description}\n` +
      `Бюджет: ${project.budget} млн ₽\n` +
      `Локация: ${project.location}\n\n` +
      `${invitationMessage ? `Дополнительная информация: ${invitationMessage}\n\n` : ''}` +
      `Подробности проекта: ${projectUrl}\n\n` +
      `С уважением`
    )
    
    window.open(`mailto:${selectedCompany.owner_email || selectedCompany.email}?subject=${subject}&body=${body}`)
    setShowProjectModal(false)
    setSelectedCompany(null)
    setSelectedProject('')
    setInvitationMessage('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка партнерств...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Партнерства</h1>
          <p className="text-gray-600">
            Управляйте своими подписками на компании и развивайте деловые связи
          </p>
        </div>

        {/* Список подписок */}
        {followedCompanies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              У вас пока нет подписок на компании
            </h3>
            <p className="text-gray-500 mb-4">
              Подпишитесь на интересные компании, чтобы следить за их деятельностью
            </p>
            <Link
              href="/companies"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Найти компании
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {followedCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-lg shadow-sm border p-6">
                {/* Логотип и название */}
                <div className="flex items-start space-x-4 mb-4">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-500">{company.industry}</p>
                    <p className="text-sm text-gray-500">{company.location}</p>
                  </div>
                </div>

                {/* Описание */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {company.description}
                </p>

                {/* Кнопки действий */}
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSendEmail(company)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Написать письмо
                    </button>
                    <button
                      onClick={() => handleInviteToProject(company)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Пригласить в проект
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/companies/${company.id}`}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Перейти в профиль
                    </Link>
                    <button
                      onClick={() => handleUnfollow(company.id)}
                      className="flex items-center justify-center px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно выбора проекта */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Пригласить {selectedCompany?.name} в проект
            </h3>
            
            {allProjects.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-4">На площадке нет активных проектов</p>
                <Link
                  href="/projects/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Создать проект
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Выберите проект ({allProjects.length} доступно)
                  </label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Выберите проект...</option>
                    {allProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.title} - {project.budget} млн ₽
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дополнительное сообщение (необязательно)
                  </label>
                  <textarea
                    value={invitationMessage}
                    onChange={(e) => setInvitationMessage(e.target.value)}
                    placeholder="Добавьте дополнительную информацию о предложении..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowProjectModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSendInvitation}
                    disabled={!selectedProject}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Отправить приглашение
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}