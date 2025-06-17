'use client'

import Link from 'next/link'
import { 
  Package, 
  Building2, 
  FileText, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  DollarSign,
  Truck,
  BarChart3,
  Handshake,
  ArrowRight,
  Plus,
  FolderOpen
} from 'lucide-react'
import MetricCard from './MetricCard'
import RecentActivity from './RecentActivity'
import QuickActions from './QuickActions'
import ProjectApplicationsManager from './ProjectApplicationsManager'


interface SupplierDashboardProps {
  user: any
  profile: any
  stats: {
    projects: any[]
    tenders: any[]
    products: any[]
    companies: any[]
    orders?: any[]
    sales?: any[]
    cartStats?: {
      total_in_carts: number
      unique_users: number
      items: any[]
    }
    partnerships?: {
      followedCompanies: number
      followers: number
    }
  }
}

export default function SupplierDashboard({ user, profile, stats }: SupplierDashboardProps) {
  // Отладочная информация
  console.log('SupplierDashboard stats:', stats)
  console.log('Cart stats:', stats.cartStats)
  
  // Подготовка данных для поставщика
  const availableProjects = stats.projects.length
  const participatingTenders = stats.tenders.length
  const myProducts = stats.products.length
  const activeProducts = stats.products.filter(p => p.status === 'active').length
  const totalOrders = stats.orders?.length || 0
  const totalSales = stats.sales?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0
  const totalInCarts = stats.cartStats?.total_in_carts || 0
  const uniqueCartUsers = stats.cartStats?.unique_users || 0
  const followedCompanies = stats.partnerships?.followedCompanies || 0
  const followers = stats.partnerships?.followers || 0

  console.log('Calculated values:', {
    totalInCarts,
    uniqueCartUsers,
    myProducts,
    activeProducts,
    followedCompanies,
    followers
  })

  // Быстрые действия для поставщика
  const quickActions = [
    {
      title: 'Добавить товар',
      description: 'Разместить новый товар в каталоге',
      icon: Package,
      href: '/products/create',
      color: 'purple' as const,
      enabled: true
    },
    {
      title: 'Участвовать в проектах',
      description: 'Найти подходящие проекты',
      icon: Building2,
      href: '/projects',
      color: 'blue' as const,
      enabled: true
    },
    {
      title: 'Заявки на тендеры',
      description: 'Участвовать в тендерах поставки',
      icon: FileText,
      href: '/tenders',
      color: 'green' as const,
      enabled: true
    },
    {
      title: 'Коммерческое предложение',
      description: 'Создать профессиональное КП',
      icon: FileText,
      href: '/commercial-proposal',
      color: 'indigo' as const,
      enabled: true
    },
    {
      title: 'Управление заказами',
      description: 'Обработка и доставка заказов',
      icon: ShoppingCart,
      href: '/orders',
      color: 'orange' as const,
      enabled: true
    }
  ]

  // Недавняя активность
  const recentItems = [
    ...stats.products.map(product => ({
      id: product.id,
      title: product.name || product.title,
      type: 'product' as const,
      status: product.status,
      created_at: product.created_at,
      description: `${product.category || 'Товар'} • ${product.price} ₽`,
      href: `/products/${product.id}`
    })),
    ...stats.projects.slice(0, 2).map(project => ({
      id: project.id,
      title: project.title,
      type: 'project' as const,
      status: 'available',
      created_at: project.created_at,
      description: `Возможность поставки для ${project.category}`,
      href: `/projects/${project.id}`
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Приветствие */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg text-white p-6">
        <h2 className="text-2xl font-bold mb-2">
          Добро пожаловать, {profile?.name_first || 'Поставщик'}!
        </h2>
        <p className="opacity-90">
          Развивайте продажи, участвуйте в проектах и расширяйте сеть партнеров
        </p>
      </div>

      {/* Метрики поставщика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Мои товары"
          value={myProducts}
          icon={Package}
          color="purple"
          change="+12"
          changeType="positive"
        />
        <MetricCard
          title="В корзинах"
          value={totalInCarts}
          icon={ShoppingCart}
          color="orange"
          subtitle={uniqueCartUsers > 0 ? `У ${uniqueCartUsers} пользователей` : undefined}
        />
        <MetricCard
          title="Заказы"
          value={totalOrders}
          icon={Handshake}
          color="green"
          change="+15"
          changeType="positive"
        />
        <MetricCard
          title="Доступные проекты"
          value={availableProjects}
          icon={Building2}
          color="blue"
        />
        <MetricCard
          title="Участие в тендерах"
          value={participatingTenders}
          icon={FileText}
          color="indigo"
          change="+8"
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

      {/* Специальные функции для поставщика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Блок связей с партнерами */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Связи с партнерами
            </h3>
            <Link 
              href="/partnerships" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Управлять
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-blue-600" />
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
                <p className="text-xs text-gray-500">на ваши компании</p>
              </div>
            </div>
          </div>
        </div>

        {/* Блок популярных товаров */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Популярные товары
            </h3>
            <Link 
              href="/products" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Все товары
            </Link>
          </div>
          <div className="space-y-3">
            {stats.products.slice(0, 3).map((product: any, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name || product.title}</p>
                    <p className="text-sm text-gray-500">{product.price} ₽</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    В наличии: {product.stock_quantity || 0}
                  </p>
                  <p className="text-xs text-green-600">
                    {product.status === 'active' ? 'Активен' : 'Неактивен'}
                  </p>
                </div>
              </div>
            ))}
            {stats.products.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Товары не найдены</p>
                <Link 
                  href="/products/create"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Добавить первый товар
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Блок рекомендованных проектов для участия */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Рекомендованные проекты для участия
          </h3>
          <Link 
            href="/projects" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Все возможности
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.projects.slice(0, 4).map((project: any) => (
            <div key={project.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2">
                    {project.title || project.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {project.description ? 
                      (project.description.length > 80 ? 
                        `${project.description.substring(0, 80)}...` : 
                        project.description
                      ) : 
                      'Описание проекта'
                    }
                  </p>
                  <div className="flex items-center gap-2 text-xs">
                    {project.category && (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {project.category}
                      </span>
                    )}
                    {project.budget && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {project.budget} ₽
                      </span>
                    )}
                  </div>
                </div>
                <Link 
                  href={`/projects/${project.id}`}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 ml-3 flex-shrink-0"
                >
                  Посмотреть
                </Link>
              </div>
            </div>
          ))}
          {stats.projects.length === 0 && (
            <div className="col-span-2 text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Проекты не найдены</p>
              <p className="text-sm">Новые проекты появятся здесь</p>
            </div>
          )}
        </div>
      </div>

      {/* Управление заявками на проекты */}
      <ProjectApplicationsManager userId={user.id} />

      {/* Коммерческие предложения */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Коммерческие предложения
              </h3>
              <p className="text-sm text-gray-600">
                Создание и управление КП
              </p>
            </div>
          </div>
          <Link
            href="/commercial-proposals"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <ArrowRight className="w-4 h-4" />
            Управление КП
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/commercial-proposal"
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all duration-300 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Создать КП</h4>
              <p className="text-sm text-gray-600">Новое коммерческое предложение</p>
            </div>
          </Link>
          
          <Link
            href="/commercial-proposals"
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl hover:from-green-100 hover:to-teal-100 transition-all duration-300 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Мои КП</h4>
              <p className="text-sm text-gray-600">Просмотр и редактирование</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}