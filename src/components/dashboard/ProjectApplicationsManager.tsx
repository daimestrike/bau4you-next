'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Eye, 
  MessageSquare, 
  Building2, 
  Calendar, 
  DollarSign, 
  MapPin,
  Check,
  X,
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Application {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  description: string
  created_at: string
  company_id: string
  project_id: string
  projects: {
    id: string
    name: string
    description: string
    budget: number | null
    location: string
    deadline: string | null
    category: string
  }
  companies: {
    id: string
    name: string
    type: string
    description?: string
    logo_url?: string
    website?: string
    phone?: string
    email?: string
  }
}

interface ProjectApplicationsManagerProps {
  userId: string
}

export default function ProjectApplicationsManager({ userId }: ProjectApplicationsManagerProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadApplications()
  }, [userId])

  const loadApplications = async () => {
    try {
      setLoading(true)
      
      // Получаем заявки на проекты пользователя
      const { data, error } = await supabase
        .from('project_applications')
        .select(`
          *,
          projects!inner(
            id,
            name,
            description,
            budget,
            location,
            deadline,
            category,
            owner_id
          ),
          companies(
            id,
            name,
            type,
            description,
            logo_url,
            website,
            phone,
            email
          )
        `)
        .eq('projects.owner_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading applications:', error)
        return
      }

      setApplications(data || [])
    } catch (error) {
      console.error('Error loading applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      setUpdating(true)
      
      // Обновляем только статус, так как дополнительные поля могут отсутствовать
      const { error } = await supabase
        .from('project_applications')
        .update({ status })
        .eq('id', applicationId)

      if (error) {
        console.error('Error updating application:', error)
        alert('Ошибка при обновлении заявки')
        return
      }

      // Обновляем локальное состояние
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status }
            : app
        )
      )

      setSelectedApplication(null)
      
      alert(`Заявка ${status === 'accepted' ? 'принята' : 'отклонена'}!`)
      
    } catch (error) {
      console.error('Error updating application:', error)
      alert('Ошибка при обновлении заявки')
    } finally {
      setUpdating(false)
    }
  }

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true
    return app.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'На рассмотрении'
      case 'accepted': return 'Принята'
      case 'rejected': return 'Отклонена'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 border border-blue-200/30">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-2xl p-6 border border-blue-200/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
          Заявки на мои проекты
        </h3>
        <span className="text-sm text-gray-500">
          {applications.length} заявок
        </span>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'Все заявки' },
          { key: 'pending', label: 'На рассмотрении' },
          { key: 'accepted', label: 'Принятые' },
          { key: 'rejected', label: 'Отклоненные' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              filter === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Список заявок */}
      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
            <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {application.projects.name}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(application.status)}`}>
                      {getStatusText(application.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Заявка от: <strong>{application.companies.name}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(application.created_at).toLocaleDateString('ru-RU')} в {new Date(application.created_at).toLocaleTimeString('ru-RU')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedApplication(application)}
                    className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Подробнее</span>
                  </button>
                  <Link
                    href={`/companies/${application.companies.id}`}
                    className="flex items-center space-x-1 bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Профиль</span>
                  </Link>
                </div>
              </div>

              {/* Краткая информация о проекте */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Бюджет: {application.projects.budget ? application.projects.budget.toLocaleString('ru-RU') : 'Не указан'} ₽</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{application.projects.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>До: {application.projects.deadline ? new Date(application.projects.deadline).toLocaleDateString('ru-RU') : 'Не указан'}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'Нет заявок' : `Нет заявок со статусом "${getStatusText(filter)}"`}
            </h4>
            <p className="text-gray-600">
              Заявки на ваши проекты будут отображаться здесь
            </p>
          </div>
        )}
      </div>

      {/* Модальное окно с подробностями заявки */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Заявка на проект: {selectedApplication.projects.name}
                </h3>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Информация о компании */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Информация о компании
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{selectedApplication.companies.name}</p>
                    <p className="text-sm text-gray-600">{selectedApplication.companies.type}</p>
                    {selectedApplication.companies.description && (
                      <p className="text-sm text-gray-600 mt-2">{selectedApplication.companies.description}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {selectedApplication.companies.email && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        {selectedApplication.companies.email}
                      </p>
                    )}
                    {selectedApplication.companies.phone && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        {selectedApplication.companies.phone}
                      </p>
                    )}
                    {selectedApplication.companies.website && (
                      <a 
                        href={selectedApplication.companies.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Сайт компании
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Сообщение заявки */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Сообщение от компании:</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-700">{selectedApplication.description}</p>
                </div>
              </div>

              {/* Информация о действии */}
              {selectedApplication.status === 'pending' && (
                <div className="mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      💡 <strong>Совет:</strong> После принятия или отклонения заявки, вы можете связаться с компанией напрямую через их контактные данные для обсуждения деталей.
                    </p>
                  </div>
                </div>
              )}

              {/* Действия */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Закрыть
                </button>
                
                {selectedApplication.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                      disabled={updating}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>{updating ? 'Обновление...' : 'Отклонить'}</span>
                    </button>
                    <button
                      onClick={() => updateApplicationStatus(selectedApplication.id, 'accepted')}
                      disabled={updating}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{updating ? 'Обновление...' : 'Принять'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 