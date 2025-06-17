'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ShoppingBagIcon,
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface OrderDetails {
  id: string
  total_amount: number
  status: string
  created_at: string
  updated_at: string
  shipping_address: string
  customer_name: string
  customer_email: string
  customer_phone: string
  notes?: string
  order_items: {
    id: string
    quantity: number
    price: number
    products: {
      id: string
      name: string
      description: string
      images: string[]
    }
  }[]
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const resolvedParams = await params
        const { user } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

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
                description,
                images,
                seller_id
              )
            )
          `)
          .eq('id', resolvedParams.id)
          .single()

        if (error) {
          setError(error.message)
        } else {
          // Проверяем, что пользователь имеет права на просмотр этого заказа
          const hasAccess = data.order_items.some((item: any) => item.products?.seller_id === user.id)
          if (!hasAccess) {
            setError('У вас нет доступа к этому заказу')
          } else {
            setOrder(data)
          }
        }
      } catch {
        setError('Ошибка загрузки заказа')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [params, router])

  const updateOrderStatus = async (newStatus: string) => {
    if (!order) return
    
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id)

      if (error) {
        alert('Ошибка: ' + error.message)
      } else {
        setOrder({ ...order, status: newStatus })
      }
    } catch {
      alert('Ошибка обновления статуса')
    } finally {
      setUpdating(false)
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
      month: 'long',
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
        return <ClockIcon className="h-5 w-5" />
      case 'confirmed':
        return <CheckIcon className="h-5 w-5" />
      case 'shipped':
        return <ShoppingBagIcon className="h-5 w-5" />
      case 'delivered':
        return <CheckIcon className="h-5 w-5" />
      case 'cancelled':
        return <XMarkIcon className="h-5 w-5" />
      default:
        return <ClockIcon className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="mb-6">
            <XMarkIcon className="mx-auto h-24 w-24 text-red-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Ошибка</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/orders"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться к заказам
          </Link>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="mb-6">
            <ShoppingBagIcon className="mx-auto h-24 w-24 text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Заказ не найден</h2>
          <Link
            href="/orders"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Вернуться к заказам
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link
          href="/orders"
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Назад к заказам
        </Link>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Заказ #{order.id.slice(0, 8)}
            </h1>
            <p className="text-gray-600 mt-1">
              Создан {formatDate(order.created_at)}
            </p>
          </div>
          <div className="text-right">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-2">{getStatusLabel(order.status)}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {formatPrice(order.total_amount)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Основная информация */}
        <div className="lg:col-span-2 space-y-6">
          {/* Товары в заказе */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Товары в заказе</h2>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg">
                  {item.products?.images?.[0] && (
                    <img
                      src={item.products.images[0]}
                      alt={item.products.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.products?.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{item.products?.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm text-gray-500">
                        Количество: {item.quantity}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatPrice(item.price)} за единицу
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatPrice(item.quantity * item.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 mt-6 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Итого:</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Заметки */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Комментарии к заказу</h2>
              <p className="text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Боковая панель */}
        <div className="space-y-6">
          {/* Информация о клиенте */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Информация о клиенте</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Имя</label>
                <div className="text-gray-900">{order.customer_name}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <div className="text-gray-900">{order.customer_email}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Телефон</label>
                <div className="text-gray-900">{order.customer_phone}</div>
              </div>
            </div>
          </div>

          {/* Адрес доставки */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Адрес доставки</h2>
            <p className="text-gray-600">{order.shipping_address}</p>
          </div>

          {/* Управление статусом */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Управление заказом</h2>
            <div className="space-y-3">
              {order.status === 'pending' && (
                <>
                  <button
                    onClick={() => updateOrderStatus('confirmed')}
                    disabled={updating}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {updating ? 'Обновление...' : 'Подтвердить заказ'}
                  </button>
                  <button
                    onClick={() => updateOrderStatus('cancelled')}
                    disabled={updating}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {updating ? 'Обновление...' : 'Отменить заказ'}
                  </button>
                </>
              )}
              
              {order.status === 'confirmed' && (
                <button
                  onClick={() => updateOrderStatus('shipped')}
                  disabled={updating}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {updating ? 'Обновление...' : 'Отправить заказ'}
                </button>
              )}
              
              {order.status === 'shipped' && (
                <button
                  onClick={() => updateOrderStatus('delivered')}
                  disabled={updating}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {updating ? 'Обновление...' : 'Отметить как доставлен'}
                </button>
              )}
              
              {['delivered', 'cancelled'].includes(order.status) && (
                <div className="text-center text-gray-500 py-4">
                  Заказ завершен
                </div>
              )}
            </div>
          </div>

          {/* История изменений */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">История</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="text-sm">
                  <div className="text-gray-900">Заказ создан</div>
                  <div className="text-gray-500">{formatDate(order.created_at)}</div>
                </div>
              </div>
              {order.updated_at !== order.created_at && (
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div className="text-sm">
                    <div className="text-gray-900">Последнее обновление</div>
                    <div className="text-gray-500">{formatDate(order.updated_at)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}