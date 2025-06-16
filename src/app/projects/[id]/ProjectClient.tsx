'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getCurrentUser } from '@/lib/supabase'
import { 
  BuildingOfficeIcon,
  DocumentTextIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  UserIcon
} from '@heroicons/react/24/outline'

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

interface ProjectClientProps {
  projectId: string
  projectOwnerId: string
  initialApplications: ProjectApplication[]
  currentUser?: any
  isOwner?: boolean
}

interface ProposalModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onSuccess: () => void
  userApplications?: ProjectApplication[]
}

function ProposalModal({ isOpen, onClose, projectId, onSuccess, userApplications = [] }: ProposalModalProps) {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    businessCard: ''
  })
  const [userCompanies, setUserCompanies] = useState<any[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchUserCompanies()
    }
  }, [isOpen])

  const fetchUserCompanies = async () => {
    try {
      const { user } = await getCurrentUser()
      if (!user) return

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', user.id)

      if (error) throw error
      
      // Фильтруем компании, от которых уже подана заявка
      const appliedCompanyIds = userApplications.map(app => app.company_id)
      const availableCompanies = (data || []).filter(company => !appliedCompanyIds.includes(company.id))
      
      setUserCompanies(availableCompanies)
      if (availableCompanies.length > 0) {
        setSelectedCompanyId(availableCompanies[0].id)
      }
    } catch (err: any) {
      console.error('Error fetching companies:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompanyId) {
      setError('Выберите компанию')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Проверяем аутентификацию пользователя
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('Необходимо войти в систему для отправки заявки')
      }
      // Сначала проверяем, не подавали ли мы уже заявку от этой компании
      const { data: existingApplication, error: checkError } = await supabase
        .from('project_applications')
        .select('id')
        .eq('project_id', projectId)
        .eq('company_id', selectedCompanyId)
        .maybeSingle()

      if (checkError && checkError.code !== '42P01') {
        throw checkError
      }

      if (existingApplication) {
        throw new Error('Вы уже подали заявку на этот проект от данной компании')
      }

      // Создаем предложение в таблице project_applications
      const { error: insertError } = await supabase
        .from('project_applications')
        .insert({
          project_id: projectId,
          company_id: selectedCompanyId,
          subject: formData.subject,
          description: `${formData.description}\n\n--- Визитка ---\n${formData.businessCard}`,
          status: 'pending'
        })

      if (insertError) {
        console.error('Insert error details:', insertError)
        
        // If table doesn't exist, show helpful error message
        if (insertError.code === '42P01') {
          throw new Error('Система предложений еще не настроена. Обратитесь к администратору.')
        }
        // Handle duplicate key constraint
        if (insertError.code === '23505') {
          throw new Error('Вы уже подали заявку на этот проект от данной компании')
        }
        // Handle RLS policy violation
        if (insertError.code === '42501') {
          throw new Error('Ошибка доступа. Пожалуйста, войдите в систему заново или обратитесь к администратору.')
        }
        // Handle authentication errors
        if (insertError.message?.includes('Auth session missing') || insertError.message?.includes('JWT')) {
          throw new Error('Сессия истекла. Пожалуйста, войдите в систему заново.')
        }
        
        throw new Error(insertError.message || 'Ошибка при сохранении заявки')
      }

      // Создаем уведомление для владельца проекта
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: projectId, // Это будет исправлено на owner_id проекта
          title: 'Новое предложение по проекту',
          message: `Получено новое предложение: "${formData.subject}"`,
          type: 'project',
          related_id: projectId,
          is_read: false
        })

      if (notificationError) {
        console.error('Error creating notification:', notificationError)
        // Не прерываем процесс, если уведомление не создалось
      }

      onSuccess()
      onClose()
      setFormData({ subject: '', description: '', businessCard: '' })
    } catch (err: any) {
      setError(err.message || 'Ошибка при отправке предложения')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Отправить предложение</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {userCompanies.length === 0 ? (
            <div className="text-center py-8">
              <BuildingOfficeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {userApplications.length > 0 
                  ? 'Заявки уже поданы от всех ваших компаний' 
                  : 'Нет зарегистрированных компаний'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {userApplications.length > 0
                  ? 'Вы уже подали заявки на этот проект от всех доступных компаний'
                  : 'Для отправки предложения необходимо зарегистрировать компанию'
                }
              </p>
              {userApplications.length === 0 && (
                <Link
                  href="/companies/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Зарегистрировать компанию
                </Link>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Компания *
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  required
                >
                  {userCompanies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name} ({company.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тема предложения *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  placeholder="Например: Предложение по строительству"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ваше предложение *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  placeholder="Опишите ваше предложение, условия работы, сроки..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Визитка *
                </label>
                <textarea
                  value={formData.businessCard}
                  onChange={(e) => setFormData(prev => ({ ...prev, businessCard: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  placeholder="Расскажите о себе и своей компании: опыт, достижения, контакты..."
                  required
                />
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoading ? 'Отправка...' : 'Отправить предложение'}
                </button>
              </div>
            </form>
          )}
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

export default function ProjectClient({ projectId, projectOwnerId, initialApplications, currentUser, isOwner }: ProjectClientProps) {
  const [applications, setApplications] = useState<ProjectApplication[]>(initialApplications)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userApplications, setUserApplications] = useState<ProjectApplication[]>([])
  const [userCompanies, setUserCompanies] = useState<any[]>([])

  useEffect(() => {
    checkCurrentUser()
  }, [])

  const checkCurrentUser = async () => {
    try {
      if (currentUser && !isOwner) {
        // Загружаем компании пользователя
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', currentUser.id)

        if (companiesError) {
          console.error('Error loading user companies:', companiesError)
        } else {
          setUserCompanies(companies || [])
        }

        // Загружаем заявки пользователя на этот проект
        if (companies && companies.length > 0) {
          const companyIds = companies.map(c => c.id)
          const { data: userApps, error: userAppsError } = await supabase
            .from('project_applications')
            .select(`
              *,
              companies:company_id(
                id,
                name,
                type
              )
            `)
            .eq('project_id', projectId)
            .in('company_id', companyIds)

          if (userAppsError && userAppsError.code !== '42P01') {
            console.error('Error loading user applications:', userAppsError)
          } else {
            setUserApplications(userApps || [])
          }
        }
      }
      setIsLoading(false)
    } catch (error) {
      console.error('Error getting current user:', error)
      setIsLoading(false)
    }
  }

  const refreshApplications = async () => {
    try {
      // First get the applications
      const { data: applications, error: applicationsError } = await supabase
        .from('project_applications')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })

      if (applicationsError) {
        // If table doesn't exist, just set empty array
        if (applicationsError.code === '42P01') {
          console.log('project_applications table does not exist yet')
          setApplications([])
          return
        }
        throw applicationsError
      }

      if (!applications || applications.length === 0) {
        setApplications([])
        return
      }

      // Then get company data for each application
      const companyIds = applications.map(app => app.company_id).filter(Boolean)
      
      if (companyIds.length === 0) {
        setApplications(applications.map(app => ({ ...app, companies: null })))
        return
      }

      const { data: companies, error: companiesError } = await supabase
        .from('companies')
        .select('id, name, description, logo_url, type')
        .in('id', companyIds)

      if (companiesError) {
        console.error('Error fetching companies:', companiesError)
        setApplications(applications.map(app => ({ ...app, companies: null })))
        return
      }

      // Combine applications with company data
      const combinedApplications = applications.map(app => ({
        ...app,
        companies: companies?.find(company => company.id === app.company_id) || null
      }))

      setApplications(combinedApplications)
    } catch (error) {
      console.error('Error refreshing applications:', error)
      setApplications([])
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    )
  }

  const canApply = currentUser && !isOwner

  return (
    <div className="space-y-8">
      {/* Apply Button */}
      {canApply && (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Заинтересованы в проекте?</h2>
            
            {userApplications.length > 0 ? (
              <div className="space-y-4">
                <p className="text-gray-600 mb-4">Ваши заявки на этот проект:</p>
                {userApplications.map((app) => (
                  <div key={app.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{app.subject}</p>
                        <p className="text-sm text-gray-600">
                          От компании: {app.companies?.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Подана: {formatDate(app.created_at)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {app.status === 'pending' ? 'На рассмотрении' :
                         app.status === 'accepted' ? 'Принята' :
                         app.status === 'rejected' ? 'Отклонена' :
                         app.status}
                      </span>
                    </div>
                  </div>
                ))}
                {userCompanies.length > userApplications.length && (
                  <div className="mt-4">
                    <p className="text-gray-600 mb-4">У вас есть другие компании, от которых можно подать заявку</p>
                    <button
                      onClick={() => setShowProposalModal(true)}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl mx-auto"
                    >
                      <PaperAirplaneIcon className="h-5 w-5" />
                      <span>Подать еще одну заявку</span>
                    </button>
                  </div>
                )}
              </div>
            ) : userCompanies.length > 0 ? (
              <div>
                <p className="text-gray-600 mb-6">Подайте заявку и расскажите о своих возможностях</p>
                <button
                  onClick={() => setShowProposalModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl mx-auto"
                >
                  <PaperAirplaneIcon className="h-6 w-6" />
                  <span className="text-lg font-medium">Подать предложение</span>
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-6">Для подачи заявки необходимо зарегистрировать компанию</p>
                <Link
                  href="/companies/create"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Зарегистрировать компанию
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Applications (only for owner) */}
      {isOwner && applications.length > 0 && (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Предложения на проект ({applications.length})
          </h2>
          <div className="space-y-6">
            {applications.map((application) => (
              <div key={application.id} className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{application.subject}</h3>
                    <div className="flex items-center gap-3 mb-3">
                      {application.companies?.logo_url ? (
                        <img 
                          src={application.companies.logo_url} 
                          alt={application.companies.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <BuildingOfficeIcon className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{application.companies?.name}</p>
                        <p className="text-sm text-gray-600 capitalize">{application.companies?.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">
                      {formatDate(application.created_at)}
                    </span>
                    <div className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {application.status === 'pending' ? 'На рассмотрении' :
                         application.status === 'accepted' ? 'Принято' :
                         application.status === 'rejected' ? 'Отклонено' :
                         application.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50/50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {application.description}
                  </p>
                </div>

                {application.document_url && (
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                    <a
                      href={application.document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      Скачать прикрепленные документы
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No applications message for owner */}
      {isOwner && applications.length === 0 && (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center py-8">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Пока нет предложений</h3>
            <p className="text-gray-600">Предложения от компаний будут отображаться здесь</p>
          </div>
        </div>
      )}

      {/* Login prompt for non-authenticated users */}
      {!currentUser && (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center py-8">
            <h3 className="text-xl font-medium text-gray-900 mb-2">Войдите для подачи предложения</h3>
            <p className="text-gray-600 mb-6">Чтобы подать предложение на проект, необходимо войти в систему</p>
            <Link
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Войти в систему
            </Link>
          </div>
        </div>
      )}

      <ProposalModal
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        projectId={projectId}
        userApplications={userApplications}
        onSuccess={() => {
          refreshApplications()
          checkCurrentUser() // Обновляем заявки пользователя
        }}
      />
    </div>
  )
} 