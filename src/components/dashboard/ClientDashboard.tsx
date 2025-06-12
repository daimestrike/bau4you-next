'use client'

import Link from 'next/link'
import { 
  Plus, 
  Building2, 
  FileText, 
  TrendingUp, 
  Users, 
  Star,
  Send,
  Eye,
  MessageSquare
} from 'lucide-react'
import MetricCard from './MetricCard'
import CustomBarChart from './BarChart'
import CustomPieChart from './PieChart'
import RecentActivity from './RecentActivity'
import QuickActions from './QuickActions'

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
  }
}

export default function ClientDashboard({ user, profile, stats }: ClientDashboardProps) {
  // Подготовка данных для заказчика
  const totalProjects = stats.projects.length
  const activeTenders = stats.tenders.filter(t => t.status === 'published').length
  const totalQuotations = stats.quotations?.length || 0
  const totalInquiries = stats.inquiries?.length || 0

  // Статистика проектов по статусам
  const projectStatusData = stats.projects.reduce((acc: any[], project) => {
    const existing = acc.find(item => item.name === project.status)
    if (existing) {
      existing.value++
    } else {
      acc.push({ 
        name: project.status || 'unknown', 
        value: 1, 
        color: project.status === 'active' ? '#10b981' : 
               project.status === 'planning' ? '#f59e0b' : 
               project.status === 'completed' ? '#6b7280' : '#3b82f6'
      })
    }
    return acc
  }, [])

  // График активности по месяцам
  const monthlyData = [
    { name: 'Янв', projects: 4, quotations: 12, inquiries: 8 },
    { name: 'Фев', projects: 3, quotations: 15, inquiries: 10 },
    { name: 'Мар', projects: 6, quotations: 20, inquiries: 15 },
    { name: 'Апр', projects: 8, quotations: 25, inquiries: 18 },
    { name: 'Май', projects: 5, quotations: 18, inquiries: 12 },
    { name: 'Июн', projects: 7, quotations: 22, inquiries: 16 }
  ]

  // Быстрые действия для заказчика
  const quickActions = [
    {
      title: 'Создать проект',
      description: 'Опубликовать новый строительный проект',
      icon: Plus,
      href: '/projects/create',
      color: 'blue',
      enabled: true
    },
    {
      title: 'Создать тендер',
      description: 'Запустить новый тендер',
      icon: FileText,
      href: '/tenders/create',
      color: 'green',
      enabled: true
    },
    {
      title: 'Найти подрядчиков',
      description: 'Поиск проверенных исполнителей',
      icon: Users,
      href: '/companies?type=contractor',
      color: 'purple',
      enabled: true
    },
    {
      title: 'Избранные компании',
      description: 'Управление списком избранных',
      icon: Star,
      href: '/favorites',
      color: 'orange',
      enabled: true
    }
  ]

  // Недавняя активность
  const recentItems = [
    ...stats.projects.map(project => ({
      id: project.id,
      title: project.title,
      type: 'project' as const,
      status: project.status,
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Мои проекты"
          value={totalProjects}
          icon={Building2}
          color="blue"
          change="+12%"
          changeType="positive"
        />
        <MetricCard
          title="Активные тендеры"
          value={activeTenders}
          icon={FileText}
          color="green"
        />
        <MetricCard
          title="Получено КП"
          value={totalQuotations}
          icon={TrendingUp}
          color="purple"
          change="+25%"
          changeType="positive"
        />
        <MetricCard
          title="Запросы от подрядчиков"
          value={totalInquiries}
          icon={MessageSquare}
          color="orange"
        />
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card hover-glass rounded-2xl p-6 border border-blue-200/30">
          <CustomBarChart
            data={monthlyData.map(item => ({ 
              name: item.name, 
              value: item.projects,
              quotations: item.quotations,
              inquiries: item.inquiries 
            }))}
            title="Активность по месяцам"
          />
        </div>
        {projectStatusData.length > 0 && (
          <div className="glass-card hover-glass rounded-2xl p-6 border border-purple-200/30">
            <CustomPieChart
              data={projectStatusData}
              title="Статус проектов"
            />
          </div>
        )}
      </div>

      {/* Быстрые действия и недавняя активность */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card hover-glass rounded-2xl p-6 border border-green-200/30">
          <QuickActions
            actions={quickActions}
            title="Быстрые действия"
          />
        </div>
        <div className="glass-card hover-glass rounded-2xl p-6 border border-orange-200/30">
          <RecentActivity
            items={recentItems}
            title="Мои последние проекты и тендеры"
          />
        </div>
      </div>

      {/* Специальные функции для заказчика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Избранные компании */}
        <div className="glass-card hover-glass rounded-2xl p-6 border border-indigo-200/30 group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/20 rounded-xl">
                <Star className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Избранные компании</h3>
            </div>
            <Link 
              href="/favorites" 
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors"
            >
              Все →
            </Link>
          </div>
          
          <div className="space-y-3">
            {stats.companies.slice(0, 3).map((company, index) => (
              <div key={company.id || index} className="flex items-center justify-between p-3 bg-white/50 rounded-xl hover:bg-white/70 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{company.name || 'Компания'}</p>
                    <p className="text-sm text-gray-600">{company.category || 'Строительство'}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            ))}
            
            {stats.companies.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Нет избранных компаний</p>
                <Link 
                  href="/companies" 
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-2 inline-block"
                >
                  Найти компании
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Прямые заявки */}
        <div className="glass-card hover-glass rounded-2xl p-6 border border-pink-200/30 group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-500/20 rounded-xl">
                <Send className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Прямые заявки</h3>
            </div>
            <Link 
              href="/applications" 
              className="text-pink-600 hover:text-pink-700 text-sm font-medium transition-colors"
            >
              Все →
            </Link>
          </div>
          
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-pink-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Отправляйте заявки напрямую</h4>
            <p className="text-gray-600 text-sm mb-4">
              Найдите подходящих подрядчиков и отправьте им заявку на выполнение работ
            </p>
            <Link 
              href="/companies?type=contractor" 
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-red-600 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Users className="w-4 h-4 mr-2" />
              Найти подрядчиков
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 