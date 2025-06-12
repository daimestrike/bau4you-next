'use client'

import Link from 'next/link'
import { 
  Search, 
  Building2, 
  FileText, 
  ClipboardList, 
  Users, 
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Handshake
} from 'lucide-react'
import MetricCard from './MetricCard'
import CustomBarChart from './BarChart'
import CustomPieChart from './PieChart'
import RecentActivity from './RecentActivity'
import QuickActions from './QuickActions'

interface ContractorDashboardProps {
  user: any
  profile: any
  stats: {
    projects: any[]
    tenders: any[]
    companies: any[]
    applications: any[]
  }
}

export default function ContractorDashboard({ user, profile, stats }: ContractorDashboardProps) {
  // Подготовка данных для подрядчика
  const availableProjects = stats.projects.length
  const availableTenders = stats.tenders.length
  const myApplications = stats.applications.length
  const acceptedApplications = stats.applications.filter(app => app.status === 'accepted').length
  const pendingApplications = stats.applications.filter(app => app.status === 'pending').length

  // Статистика заявок
  const applicationStatusData = stats.applications.reduce((acc: any[], app) => {
    const existing = acc.find(item => item.name === app.status)
    if (existing) {
      existing.value++
    } else {
      acc.push({ 
        name: app.status || 'unknown', 
        value: 1, 
        color: app.status === 'accepted' ? '#10b981' : 
               app.status === 'pending' ? '#f59e0b' : 
               app.status === 'rejected' ? '#ef4444' : '#6b7280'
      })
    }
    return acc
  }, [])

  // График активности по типам работ
  const workTypeData = [
    { name: 'Строительство', value: 15, applications: 8 },
    { name: 'Ремонт', value: 12, applications: 6 },
    { name: 'Проектирование', value: 8, applications: 4 },
    { name: 'Отделка', value: 10, applications: 5 },
    { name: 'Инженерные системы', value: 6, applications: 3 }
  ]

  // Быстрые действия для подрядчика
  const quickActions = [
    {
      title: 'Найти проекты',
      description: 'Поиск доступных проектов',
      icon: Search,
      href: '/projects',
      color: 'bg-blue-600 border-blue-600',
      enabled: true
    },
    {
      title: 'Просмотреть тендеры',
      description: 'Активные тендеры для участия',
      icon: FileText,
      href: '/tenders',
      color: 'bg-green-600 border-green-600',
      enabled: true
    },
    {
      title: 'Мои заявки',
      description: 'Управление поданными заявками',
      icon: ClipboardList,
      href: '/applications',
      color: 'bg-purple-600 border-purple-600',
      enabled: true
    },
    {
      title: 'Моя компания',
      description: 'Управление профилем компании',
      icon: Building2,
      href: '/companies/my',
      color: 'bg-orange-600 border-orange-600',
      enabled: true
    }
  ]

  // Недавняя активность
  const recentItems = [
    ...stats.applications.map(app => ({
      id: app.id,
      title: app.tenders?.title || 'Заявка на проект',
      type: 'application' as const,
      status: app.status,
      created_at: app.created_at,
      description: `Заявка на ${app.tenders?.category || 'проект'}`,
      href: `/applications/${app.id}`
    })),
    ...stats.projects.slice(0, 3).map(project => ({
      id: project.id,
      title: project.title,
      type: 'project' as const,
      status: 'available',
      created_at: project.created_at,
      description: `Доступный проект по ${project.category || 'строительству'}`,
      href: `/projects/${project.id}`
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Приветствие */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg text-white p-6">
        <h2 className="text-2xl font-bold mb-2">
          Добро пожаловать, {profile?.first_name || 'Подрядчик'}!
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
          description="Новых проектов на площадке"
          change={{ value: 8, type: 'increase' }}
        />
        <MetricCard
          title="Активные тендеры"
          value={availableTenders}
          icon={FileText}
          description="Можно подать заявку"
        />
        <MetricCard
          title="Мои заявки"
          value={myApplications}
          icon={ClipboardList}
          description="Всего подано заявок"
          change={{ value: 15, type: 'increase' }}
        />
        <MetricCard
          title="Принятые заявки"
          value={acceptedApplications}
          icon={CheckCircle}
          description="Успешных предложений"
          change={{ value: 20, type: 'increase' }}
        />
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CustomBarChart
          data={workTypeData}
          title="Доступные проекты по типам работ"
        />
        {applicationStatusData.length > 0 && (
          <CustomPieChart
            data={applicationStatusData}
            title="Статус моих заявок"
          />
        )}
      </div>

      {/* Быстрые действия и недавняя активность */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <QuickActions
          actions={quickActions}
          title="Быстрые действия"
        />
        <RecentActivity
          items={recentItems}
          title="Последние возможности"
        />
      </div>

      {/* Специальные функции для подрядчика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Блок статуса заявок */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Статистика заявок от заказчиков
            </h3>
            <Link 
              href="/applications" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Все заявки
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">Принятые</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{acceptedApplications}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-yellow-600" />
                <span className="font-medium text-gray-900 dark:text-white">На рассмотрении</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{pendingApplications}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Handshake className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">Всего откликов</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{myApplications}</span>
            </div>
          </div>
        </div>

        {/* Блок рекомендованных проектов */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Рекомендованные проекты
            </h3>
            <Link 
              href="/projects?recommended=true" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Все рекомендации
            </Link>
          </div>
          <div className="space-y-3">
            {stats.projects.slice(0, 3).map((project: any) => (
              <div key={project.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {project.title}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {project.location} • {project.budget} млн ₽
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Совпадение 85% • {project.category}
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
            ))}
          </div>
        </div>
      </div>

      {/* Блок аналитики эффективности */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Аналитика эффективности
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {myApplications > 0 ? Math.round((acceptedApplications / myApplications) * 100) : 0}%
            </div>
            <p className="text-gray-600 dark:text-gray-400">Процент принятых заявок</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Math.round(Math.random() * 50 + 50)}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Рейтинг среди подрядчиков</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round(Math.random() * 10 + 5)}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Средний отклик (дней)</p>
          </div>
        </div>
      </div>
    </div>
  )
} 