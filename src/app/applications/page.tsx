'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  User
} from 'lucide-react'

interface Application {
  id: string
  status: 'pending' | 'accepted' | 'rejected'
  proposal: string
  created_at: string
  type?: 'tender' | 'project'
  tenders: {
    id: string
    title: string
    description: string
    budget: number | null
    location: string
    deadline: string | null
    category: string
    client_id: string
    profiles: {
      name_first: string
      name_last: string
      email: string
      phone?: string
      company_name?: string
    }
  }
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/login'
        return
      }

      console.log('🔍 Loading applications for user:', user.id)

      // Загружаем заявки на тендеры (если таблица существует)
      let tenderApplications = []
      let tenderError = null
      
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            *,
            tenders:tender_id(
              id,
              title,
              description,
              budget,
              location,
              deadline,
              category,
              client_id,
              profiles:client_id(
                name_first,
                name_last,
                email,
                phone,
                company_name
              )
            )
          `)
          .eq('contractor_id', user.id)
          .order('created_at', { ascending: false })
        
        tenderApplications = data || []
        tenderError = error
      } catch (err) {
        console.log('Applications table does not exist, skipping tender applications')
        tenderError = { code: '42P01', message: 'Table does not exist' }
      }

      let allApplications = []

      if (tenderError) {
        console.error('Error loading tender applications:', tenderError)
        if (tenderError.code === '42P01') {
          console.log('Applications table does not exist yet')
        }
      } else {
        console.log('📋 Tender applications:', tenderApplications)
        allApplications = (tenderApplications || []).map(app => ({
          ...app,
          type: 'tender'
        }))
      }

      // Сначала получаем компании пользователя
      const { data: userCompanies, error: companiesError } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)

      console.log('🏢 User companies:', userCompanies)

      let projectApplications = []
      if (companiesError) {
        console.error('Error loading user companies:', companiesError)
      } else if (userCompanies && userCompanies.length > 0) {
        const companyIds = userCompanies.map(c => c.id)
        
        // Загружаем заявки на проекты от всех компаний пользователя
        const { data: projectApplicationsData, error: projectError } = await supabase
          .from('project_applications')
          .select(`
            *,
            projects:project_id(
              id,
              name,
              description,
              budget,
              location,
              deadline,
              category,
              owner_id
            ),
            companies:company_id(
              id,
              name,
              type
            )
          `)
          .in('company_id', companyIds)
          .order('created_at', { ascending: false })

        if (projectError) {
          console.error('Error loading project applications:', projectError)
          if (projectError.code !== '42P01') {
            console.error('Unexpected error:', projectError)
          }
        } else {
          projectApplications = projectApplicationsData || []
          console.log('📝 Raw project applications:', projectApplications)
        }
      }

      // Форматируем заявки на проекты
      const formattedProjectApplications = (projectApplications || []).map(app => ({
          id: app.id,
          status: app.status,
          proposal: app.description || '',
          created_at: app.created_at,
          type: 'project',
          tenders: {
            id: app.projects?.id,
            title: app.projects?.name,
            description: app.projects?.description,
            budget: app.projects?.budget,
            location: app.projects?.location,
            deadline: app.projects?.deadline,
            category: app.projects?.category,
            client_id: app.projects?.owner_id,
            profiles: {
              name_first: 'Клиент',
              name_last: '',
              email: '',
              phone: '',
              company_name: ''
            }
          }
        }));
        allApplications = [...allApplications, ...formattedProjectApplications];

      console.log('📊 Final applications count:', allApplications.length)
      console.log('📋 All applications:', allApplications)

      // Сортируем все заявки по дате создания
      allApplications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setApplications(allApplications);
    } catch (error) {
      console.error('Error loading applications:', error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Принята'
      case 'rejected':
        return 'Отклонена'
      case 'pending':
      default:
        return 'На рассмотрении'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200'
      case 'pending':
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    }
  }

  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  )

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои заявки</h1>
          <p className="text-gray-600">
            Управляйте своими заявками на участие в тендерах и проектах
          </p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <ClipboardList className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Всего заявок</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">На рассмотрении</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Принятые</p>
                <p className="text-2xl font-bold text-gray-900">{stats.accepted}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Отклоненные</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Фильтры */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'Все заявки' },
              { key: 'pending', label: 'На рассмотрении' },
              { key: 'accepted', label: 'Принятые' },
              { key: 'rejected', label: 'Отклоненные' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Список заявок */}
        <div className="space-y-6">
          {filteredApplications.length > 0 ? (
            filteredApplications.map((application) => (
              <div key={application.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Заголовок заявки */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {application.tenders.title}
                        </h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          application.type === 'project' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {application.type === 'project' ? 'Проект' : 'Тендер'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1">{getStatusText(application.status)}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">
                        {application.tenders.description}
                      </p>
                    </div>
                    <Link
                      href={application.type === 'project' ? `/projects/${application.tenders.id}` : `/tenders/${application.tenders.id}`}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>{application.type === 'project' ? 'Посмотреть проект' : 'Посмотреть тендер'}</span>
                    </Link>
                  </div>

                  {/* Информация о проекте */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>Бюджет: {application.tenders.budget ? application.tenders.budget.toLocaleString('ru-RU') : 'Не указан'} ₽</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{application.tenders.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>До: {application.tenders.deadline ? new Date(application.tenders.deadline).toLocaleDateString('ru-RU') : 'Не указан'}</span>
                    </div>
                  </div>

                  {/* Контакты заказчика */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Контакты заказчика
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {application.tenders.profiles.name_first || 'Имя не указано'} {application.tenders.profiles.name_last || ''}
                        </p>
                        {application.tenders.profiles.company_name && (
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Building2 className="w-4 h-4 mr-1" />
                            {application.tenders.profiles.company_name}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1">
                                                  <p className="text-sm text-gray-600 flex items-center">
                            <Mail className="w-4 h-4 mr-2" />
                            {application.tenders.profiles.email || 'Email не указан'}
                          </p>
                        {application.tenders.profiles.phone && (
                          <p className="text-sm text-gray-600 flex items-center">
                            <Phone className="w-4 h-4 mr-2" />
                            {application.tenders.profiles.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Моя заявка */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Моя заявка:</h4>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                      {application.proposal}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Подана: {new Date(application.created_at).toLocaleDateString('ru-RU')} в {new Date(application.created_at).toLocaleTimeString('ru-RU')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl p-12 text-center">
              <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'all' ? 'Заявки не найдены' : `Нет заявок со статусом "${getStatusText(filter)}"`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? 'Вы еще не подавали заявки на участие в тендерах и проектах'
                  : 'Попробуйте изменить фильтр или подать новые заявки'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/tenders"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <ClipboardList className="w-5 h-5" />
                  <span>Найти тендеры</span>
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <ClipboardList className="w-5 h-5" />
                  <span>Найти проекты</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 