'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Building2, 
  FileText, 
  Users, 
  Star,
  Send,
  MessageSquare,
  Handshake,
  X
} from 'lucide-react'
import MetricCard from './MetricCard'
import RecentActivity from './RecentActivity'
import QuickActions from './QuickActions'
import ProjectApplicationsManager from './ProjectApplicationsManager'

interface ClientDashboardProps {
  user: any
  profile: any
  stats: {
    projects: any[]
    tenders: any[]
    companies: any[]
    applications?: any[]
    quotations?: any[]
    inquiries?: any[]
    partnerships?: {
      followedCompanies: number
      followers: number
    }
  }
  onPartnershipsUpdate?: () => void
}

export default function ClientDashboard({ user, profile, stats, onPartnershipsUpdate }: ClientDashboardProps) {
  const [showQuickRequestModal, setShowQuickRequestModal] = useState(false)
  const [quickRequest, setQuickRequest] = useState({
    name: '',
    requirements: '',
    budget: ''
  })

  // Подготовка данных для заказчика
  const totalProjects = stats.projects.length
  const totalInquiries = stats.inquiries?.length || 0
  const followedCompanies = stats.partnerships?.followedCompanies || 0
  const followers = stats.partnerships?.followers || 0

  // Быстрые действия для заказчика
  const quickActions = [
    {
      title: 'Создать проект',
      description: 'Опубликовать новый строительный проект',
      icon: Plus,
      href: '/projects/create',
      color: 'blue' as const,
      enabled: true
    },
    {
      title: 'Перейти в Bau.Маркет',
      description: 'Выбирайте товары',
      icon: FileText,
      href: '/products',
      color: 'green' as const,
      enabled: true
    },
    {
      title: 'Найти подрядчиков',
      description: 'Поиск проверенных исполнителей',
      icon: Users,
      href: '/companies?type=contractor',
      color: 'purple' as const,
      enabled: true
    },
    {
      title: 'Прямые заявки',
      description: 'Быстрая отправка заявок компаниям',
      icon: Send,
      onClick: () => setShowQuickRequestModal(true),
      color: 'orange' as const,
      enabled: true
    }
  ]

  // Недавняя активность
  const recentItems = [
    ...stats.projects.map(project => ({
      id: project.id,
      title: project.title,
      type: 'project' as const,
      created_at: project.created_at,
      description: `Проект по ${project.category || 'строительству'}`,
      href: `/projects/${project.id}`
    })),
    ...stats.tenders.map(tender => ({
      id: tender.id,
      title: tender.title,
      type: 'tender' as const,
      status: tender.status,
      created_at: tender.created_at,
      description: `Тендер на сумму ${tender.budget || 'не указана'}`,
      href: `/tenders/${tender.id}`
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6)

  const getDisplayName = () => {
    if (profile?.name_first && profile?.name_last) {
      return `${profile.name_first} ${profile.name_last}`
    }
    if (profile?.name_first) {
      return profile.name_first
    }
    return 'Заказчик'
  }

  const handleQuickRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Здесь будет логика отправки заявки избранным компаниям
    console.log('Отправка быстрой заявки:', quickRequest)
    
    // Закрываем модальное окно и очищаем форму
    setShowQuickRequestModal(false)
    setQuickRequest({ name: '', requirements: '', budget: '' })
    
    // Показываем уведомление об успешной отправке
    alert('Заявка успешно отправлена избранным компаниям!')
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Приветствие */}
      <div className="relative overflow-hidden glass-card rounded-2xl p-8 border border-blue-200/30">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Добро пожаловать, {getDisplayName()}!
          </h2>
          <p className="text-gray-600 text-lg">
            Управляйте проектами, находите надежных подрядчиков и отслеживайте коммерческие предложения
          </p>
        </div>
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-2xl"></div>
      </div>

      {/* Метрики заказчика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Мои проекты"
          value={totalProjects}
          icon={Building2}
          color="blue"
          change="+12%"
          changeType="positive"
        />
        <MetricCard
          title="Запросы от подрядчиков"
          value={totalInquiries}
          icon={MessageSquare}
          color="orange"
        />
      </div>

      {/* Быстрые действия */}
      <div className="glass-card hover-glass rounded-2xl p-6 border border-green-200/30">
        <QuickActions
          actions={quickActions}
          title="Быстрые действия"
        />
      </div>

      {/* Специальные функции для заказчика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Блок избранных компаний */}
        <div className="glass-card hover-glass rounded-2xl p-6 border border-blue-200/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Избранные компании
            </h3>
            <Link 
              href="/favorites" 
              className="text-blue-600 hover:text-blue-800 text-sm"
              onClick={() => {
                // Обновляем статистику при возврате
                setTimeout(() => {
                  if (onPartnershipsUpdate) {
                    onPartnershipsUpdate()
                  }
                }, 1000)
              }}
            >
              Управлять
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Star className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-gray-900">Подписки</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600">{followedCompanies}</span>
                <p className="text-xs text-gray-500">компаний</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Handshake className="w-6 h-6 text-green-600" />
                <span className="font-medium text-gray-900">Подписчики</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-green-600">{followers}</span>
                <p className="text-xs text-gray-500">на ваши проекты</p>
              </div>
            </div>
          </div>
        </div>

        {/* Блок прямых заявок */}
        <div className="glass-card hover-glass rounded-2xl p-6 border border-orange-200/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Прямые заявки
            </h3>
            <button
              onClick={() => setShowQuickRequestModal(true)}
              className="text-orange-600 hover:text-orange-800 text-sm"
            >
              Создать заявку
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <Send className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-sm text-gray-700 mb-3">
                Отправляйте быстрые заявки избранным компаниям
              </p>
              <button
                onClick={() => setShowQuickRequestModal(true)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                Создать заявку
              </button>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">
                Заявки отправляются компаниям из вашего списка избранных
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Управление заявками на проекты */}
      <ProjectApplicationsManager userId={user.id} />

      {/* Недавняя активность */}
      <div className="glass-card hover-glass rounded-2xl p-6 border border-orange-200/30">
        <RecentActivity
          items={recentItems}
          title="Мои последние проекты и тендеры"
          viewAllHref="/projects"
          viewAllText="Просмотреть все"
        />
      </div>

      {/* Модальное окно для быстрой заявки */}
      {showQuickRequestModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Быстрая заявка
              </h3>
              <button
                onClick={() => setShowQuickRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleQuickRequestSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Наименование работ
                </label>
                <input
                  type="text"
                  value={quickRequest.name}
                  onChange={(e) => setQuickRequest({...quickRequest, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Например: Ремонт офиса"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Требования
                </label>
                <textarea
                  value={quickRequest.requirements}
                  onChange={(e) => setQuickRequest({...quickRequest, requirements: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Опишите ваши требования..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Бюджет (₽)
                </label>
                <input
                  type="number"
                  value={quickRequest.budget}
                  onChange={(e) => setQuickRequest({...quickRequest, budget: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1000000"
                  required
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuickRequestModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Отправить
                </button>
              </div>
            </form>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                Заявка будет отправлена всем компаниям из вашего списка избранных
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}