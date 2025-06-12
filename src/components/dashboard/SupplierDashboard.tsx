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
  Handshake
} from 'lucide-react'
import MetricCard from './MetricCard'
import CustomBarChart from './BarChart'
import CustomPieChart from './PieChart'
import RecentActivity from './RecentActivity'
import QuickActions from './QuickActions'

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
  }
}

export default function SupplierDashboard({ user, profile, stats }: SupplierDashboardProps) {
  // Подготовка данных для поставщика
  const availableProjects = stats.projects.length
  const participatingTenders = stats.tenders.length
  const myProducts = stats.products.length
  const activeProducts = stats.products.filter(p => p.status === 'active').length
  const totalOrders = stats.orders?.length || 0
  const totalSales = stats.sales?.reduce((sum, sale) => sum + (sale.amount || 0), 0) || 0

  // Статистика продаж по категориям
  const salesByCategory = stats.products.reduce((acc: any[], product) => {
    const category = product.category || 'Другое'
    const existing = acc.find(item => item.name === category)
    if (existing) {
      existing.value++
    } else {
      acc.push({ 
        name: category, 
        value: 1, 
        color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][acc.length % 6]
      })
    }
    return acc
  }, [])

  // График продаж по месяцам
  const monthlySalesData = [
    { name: 'Янв', products: 45, orders: 12, revenue: 2800 },
    { name: 'Фев', products: 52, orders: 15, revenue: 3200 },
    { name: 'Мар', products: 48, orders: 18, revenue: 4100 },
    { name: 'Апр', products: 61, orders: 22, revenue: 4800 },
    { name: 'Май', products: 55, orders: 19, revenue: 4200 },
    { name: 'Июн', products: 67, orders: 25, revenue: 5500 }
  ]

  // Быстрые действия для поставщика
  const quickActions = [
    {
      title: 'Добавить товар',
      description: 'Разместить новый товар в каталоге',
      icon: Package,
      href: '/products/create',
      color: 'bg-purple-600 border-purple-600',
      enabled: true
    },
    {
      title: 'Участвовать в проектах',
      description: 'Найти подходящие проекты',
      icon: Building2,
      href: '/projects',
      color: 'bg-blue-600 border-blue-600',
      enabled: true
    },
    {
      title: 'Заявки на тендеры',
      description: 'Участвовать в тендерах поставки',
      icon: FileText,
      href: '/tenders',
      color: 'bg-green-600 border-green-600',
      enabled: true
    },
    {
      title: 'Управление заказами',
      description: 'Обработка и доставка заказов',
      icon: ShoppingCart,
      href: '/orders',
      color: 'bg-orange-600 border-orange-600',
      enabled: true
    }
  ]

  // Недавняя активность
  const recentItems = [
    ...stats.products.map(product => ({
      id: product.id,
      title: product.title,
      type: 'product' as const,
      status: product.status,
      created_at: product.created_at,
      description: `${product.category} • ${product.price} ₽`,
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
          Добро пожаловать, {profile?.first_name || 'Поставщик'}!
        </h2>
        <p className="opacity-90">
          Развивайте продажи, участвуйте в проектах и расширяйте сеть партнеров
        </p>
      </div>

      {/* Метрики поставщика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Мои товары"
          value={myProducts}
          icon={Package}
          description={`${activeProducts} активных`}
          change={{ value: 12, type: 'increase' }}
        />
        <MetricCard
          title="Доступные проекты"
          value={availableProjects}
          icon={Building2}
          description="Возможности для поставок"
        />
        <MetricCard
          title="Участие в тендерах"
          value={participatingTenders}
          icon={FileText}
          description="Активных тендеров поставки"
          change={{ value: 8, type: 'increase' }}
        />
        <MetricCard
          title="Заказы"
          value={totalOrders}
          icon={ShoppingCart}
          description="Обработано заказов"
          change={{ value: 15, type: 'increase' }}
        />
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CustomBarChart
          data={monthlySalesData.map(item => ({ 
            name: item.name, 
            value: item.revenue,
            orders: item.orders,
            products: item.products 
          }))}
          title="Выручка и продажи по месяцам"
        />
        {salesByCategory.length > 0 && (
          <CustomPieChart
            data={salesByCategory}
            title="Товары по категориям"
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
          title="Последние товары и возможности"
        />
      </div>

      {/* Специальные функции для поставщика */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Блок связей с партнерами */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">Заказчики</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-blue-600">24</span>
                <p className="text-xs text-gray-500">активных связей</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <Handshake className="w-6 h-6 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">Подрядчики</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-green-600">18</span>
                <p className="text-xs text-gray-500">партнерств</p>
              </div>
            </div>
          </div>
        </div>

        {/* Блок популярных товаров */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Популярные товары
            </h3>
            <Link 
              href="/products/analytics" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Аналитика
            </Link>
          </div>
          <div className="space-y-3">
            {stats.products.slice(0, 3).map((product: any, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.title}</p>
                    <p className="text-sm text-gray-500">{product.price} ₽</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {Math.round(Math.random() * 20 + 5)} заказов
                  </p>
                  <p className="text-xs text-green-600">
                    +{Math.round(Math.random() * 50 + 10)}% за месяц
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Блок аналитики продаж */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Аналитика продаж и поставок
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {Math.round(totalSales / 1000)}K ₽
            </div>
            <p className="text-gray-600 dark:text-gray-400">Общая выручка</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Math.round(Math.random() * 30 + 70)}%
            </div>
            <p className="text-gray-600 dark:text-gray-400">Выполнение заказов</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.round(Math.random() * 10 + 15)}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Средний рейтинг</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {Math.round(Math.random() * 5 + 2)}
            </div>
            <p className="text-gray-600 dark:text-gray-400">Дни доставки</p>
          </div>
        </div>
      </div>

      {/* Блок рекомендованных проектов для участия */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Рекомендованные проекты для участия
          </h3>
          <Link 
            href="/projects?supplier=true" 
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Все возможности
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.projects.slice(0, 4).map((project: any) => (
            <div key={project.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {project.title}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {project.location} • Бюджет: {project.budget} млн ₽
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    Подходящие товары: {Math.round(Math.random() * 10 + 5)} позиций
                  </p>
                </div>
                <Link 
                  href={`/projects/${project.id}/supply`}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 ml-3"
                >
                  Предложить
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 