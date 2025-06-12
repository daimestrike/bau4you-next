'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { 
  ShoppingBagIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface Order {
  id: string
  total_amount: number
  status: string
  created_at: string
  shipping_address: string
  customer_name: string
  customer_email: string
  customer_phone: string
  order_items: {
    id: string
    quantity: number
    price: number
    products: {
      id: string
      name: string
      images: string[]
    }
  }[]
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Необходима авторизация')
        return
      }

      // Получаем заказы товаров пользователя
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            price,
            products (
              id,
              name,
              images,
              seller_id
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        // Фильтруем заказы, содержащие товары пользователя
        const userOrders = data?.filter(order => 
          order.order_items.some((item: any) => item.products?.seller_id === user.id)
        ) || []
        
        setOrders(userOrders)
      }
    } catch {
      setError('Ошибка загрузки заказов')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) {
        alert('Ошибка: ' + error.message)
      } else {
        await loadOrders()
      }
    } catch {
      alert('Ошибка обновления статуса')
    } finally {
      setUpdating(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает подтверждения'
      case 'confirmed':
        return 'Подтвержден'
      case 'shipped':
        return 'Отправлен'
      case 'delivered':
        return 'Доставлен'
      case 'cancelled':
        return 'Отменен'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4" />
      case 'confirmed':
        return <CheckIcon className="h-4 w-4" />
      case 'shipped':
        return <ShoppingBagIcon className="h-4 w-4" />
      case 'delivered':
        return <CheckIcon className="h-4 w-4" />
      case 'cancelled':
        return <XMarkIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Управление заказами</h1>
        <Link
          href="/dashboard"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ← Назад к дашборду
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Фильтры */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Все заказы ({orders.length})
          </button>
          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(status => {
            const count = orders.filter(order => order.status === status).length
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getStatusLabel(status)} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-6">
            <ShoppingBagIcon className="mx-auto h-24 w-24 text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {filter === 'all' ? 'У вас пока нет заказов' : `Нет заказов со статусом "${getStatusLabel(filter)}"`}
          </h2>
          <p className="text-gray-500 mb-6">
            {filter === 'all' 
              ? 'Заказы появятся здесь, когда клиенты начнут покупать ваши товары'
              : 'Попробуйте выбрать другой фильтр'
            }
          </p>
          {filter === 'all' && (
            <Link
              href="/products/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Добавить товары
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Заказ #{order.id.slice(0, 8)}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{getStatusLabel(order.status)}</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(order.total_amount)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Информация о клиенте</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{order.customer_name}</div>
                      <div>{order.customer_email}</div>
                      <div>{order.customer_phone}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Адрес доставки</h4>
                    <div className="text-sm text-gray-600">
                      {order.shipping_address}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Товары в заказе</h4>
                  <div className="space-y-2">
                    {order.order_items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {item.products?.images?.[0] && (
                          <img
                            src={item.products.images[0]}
                            alt={item.products.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.products?.name}</div>
                          <div className="text-sm text-gray-600">
                            Количество: {item.quantity} × {formatPrice(item.price)}
                          </div>
                        </div>
                        <div className="font-medium text-gray-900">
                          {formatPrice(item.quantity * item.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Подробнее
                    </Link>
                  </div>
                  
                  {order.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'confirmed')}
                        disabled={updating === order.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                      >
                        {updating === order.id ? 'Обновление...' : 'Подтвердить'}
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        disabled={updating === order.id}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                      >
                        {updating === order.id ? 'Обновление...' : 'Отменить'}
                      </button>
                    </div>
                  )}
                  
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      disabled={updating === order.id}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      {updating === order.id ? 'Обновление...' : 'Отправить'}
                    </button>
                  )}
                  
                  {order.status === 'shipped' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      disabled={updating === order.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                    >
                      {updating === order.id ? 'Обновление...' : 'Доставлен'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
} 