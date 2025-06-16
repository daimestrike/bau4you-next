'use client'

import Link from 'next/link'
import { 
  Search, 
  Building2, 
  FileText, 
  ClipboardList, 
  CheckCircle,
  Handshake,
  MapPin
} from 'lucide-react'
import MetricCard from './MetricCard'
import QuickActions from './QuickActions'
import ProjectApplicationsManager from './ProjectApplicationsManager'

interface ContractorDashboardProps {
  user: any
  profile: any
  stats: {
    projects: any[]
    tenders: any[]
    companies: any[]
    applications: any[]
    regionalProjects?: any[]
  }
}

export default function ContractorDashboard({ user, profile, stats }: ContractorDashboardProps) {
  // Подготовка данных для подрядчика
  const availableProjects = stats.projects.length
  const availableTenders = stats.tenders.length
  const myApplications = stats.applications.length
  const acceptedApplications = stats.applications.filter(app => app.status === 'accepted').length
  const pendingApplications = stats.applications.filter(app => app.status === 'pending').length

  // Быстрые действия для подрядчика
  const quickActions = [
    {
      title: 'Найти проекты',
      description: 'Поиск доступных проектов',
      icon: Search,
      href: '/projects',
      color: 'blue' as const,
      enabled: true
    },
    {
      title: 'Просмотреть тендеры',
      description: 'Активные тендеры для участия',
      icon: FileText,
      href: '/tenders',
      color: 'green' as const,
      enabled: true
    },
    {
      title: 'Мои заявки',
      description: 'Управление поданными заявками',
      icon: ClipboardList,
      href: '/applications',
      color: 'purple' as const,
      enabled: true
    },
    {
      title: 'Моя компания',
      description: 'Управление профилем компании',
      icon: Building2,
      href: '/companies',
      color: 'orange' as const,
      enabled: true
    }
  ]

  // Региональные проекты (приоритет проектам из региона пользователя)
  const regionalProjects = stats.regionalProjects || stats.projects.slice(0, 3)

  return (
    <div className="space-y-8">
      {/* Приветствие */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg text-white p-6">
        <h2 className="text-2xl font-bold mb-2">
          Добро пожаловать, {profile?.name_first || 'Подрядчик'}!
        </h2>
        <p className="opacity-90">
          Находите проекты, участвуйте в тендерах и развивайте свой бизнес
        </p>
      </div>

      {/* Метрики подрядчика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Доступные проекты"
          value={availableProjects}
          icon={Building2}
          color="blue"
          change="+8"
          changeType="positive"
        />
        <MetricCard
          title="Активные тендеры"
          value={availableTenders}
          icon={FileText}
          color="green"
        />
        <MetricCard
          title="Мои заявки"
          value={myApplications}
          icon={ClipboardList}
          color="purple"
          change="+15"
          changeType="positive"
        />
        <MetricCard
          title="Принятые заявки"
          value={acceptedApplications}
          icon={CheckCircle}
          color="green"
          change="+20%"
          changeType="positive"
        />
      </div>

      {/* Быстрые действия */}
      <div className="grid grid-cols-1 gap-8">
        <QuickActions
          actions={quickActions}
          title="Быстрые действия"
        />
      </div>

      {/* Специальные функции для подрядчика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Блок статистики заявок */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Статистика заявок
            </h3>
            <Link 
              href="/applications" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Все заявки
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Handshake className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-gray-900">Всего откликов</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{myApplications}</span>
            </div>
            {myApplications > 0 && (
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {Math.round((acceptedApplications / myApplications) * 100)}%
                </div>
                <p className="text-sm text-gray-600">Процент принятых заявок</p>
              </div>
            )}
          </div>
        </div>

        {/* Блок рекомендованных проектов */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Рекомендованные проекты
            </h3>
            <Link 
              href="/projects" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Все проекты
            </Link>
          </div>
          <div className="space-y-3">
            {regionalProjects.length > 0 ? (
              regionalProjects.map((project: any) => (
                <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {project.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {project.location} • {project.budget} млн ₽
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        {project.category} • Ваш регион
                      </p>
                    </div>
                    <Link 
                      href={`/projects/${project.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 ml-3"
                    >
                      Подать заявку
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Проекты в вашем регионе не найдены</p>
                <Link 
                  href="/projects"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Посмотреть все проекты
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Компактный блок заявок на мои проекты */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Заявки на мои проекты
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <ClipboardList className="w-6 h-6 text-orange-600" />
                <span className="font-medium text-gray-900">Всего заявок</span>
              </div>
              <span className="text-2xl font-bold text-orange-600">
                {stats.projects.reduce((total, project) => total + (project.applications?.length || 0), 0)}
              </span>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Управляйте заявками на ваши проекты
              </p>
              <div className="text-xs text-gray-500">
                Используйте менеджер заявок для просмотра и управления
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Блок аналитики эффективности */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Аналитика эффективности
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {myApplications > 0 ? Math.round((acceptedApplications / myApplications) * 100) : 0}%
            </div>
            <p className="text-gray-600">Процент принятых заявок</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {availableProjects}
            </div>
            <p className="text-gray-600">Доступных проектов</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {pendingApplications}
            </div>
            <p className="text-gray-600">Заявок на рассмотрении</p>
          </div>
        </div>
      </div>

      {/* Управление заявками на проекты */}
      <ProjectApplicationsManager userId={user.id} />
    </div>
  )
} 