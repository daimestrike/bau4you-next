'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getCartItems, clearCart, getCurrentUser, supabase } from '@/lib/supabase'

interface CartItem {
  id: string
  quantity: number
  products: {
    id: string
    name: string
    price: number
    discount_price?: number
    images: string[]
    stock_quantity: number
    status: string
    seller_id: string
    profiles?: {
      email?: string
      name_first?: string
      name_last?: string
      company_name?: string
    }
    companies?: {
      name: string
      email?: string
    }
  }
}

interface OrderForm {
  name: string
  email: string
  phone: string
  company?: string
  message: string
  delivery_address: string
  preferred_contact: 'email' | 'phone'
}

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<OrderForm>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    delivery_address: '',
    preferred_contact: 'email'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Загружаем корзину
      const { data: cartData, error: cartError } = await getCartItems()
      if (cartError) {
        setError(cartError.message)
        return
      }

      if (!cartData || cartData.length === 0) {
        router.push('/cart')
        return
      }

      setCartItems(cartData)

      // Загружаем данные пользователя для предзаполнения формы
      const userData = await getCurrentUser()
      if (userData?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user!.id)
          .single()

        if (profile) {
          setFormData(prev => ({
            ...prev,
            name: `${profile.name_first || ''} ${profile.name_last || ''}`.trim() || prev.name,
            email: profile.email || userData.user?.email || prev.email,
            phone: profile.phone || prev.phone,
            company: profile.company_name || prev.company
          }))
        }
      }
    } catch {
      setError('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const getItemPrice = (item: CartItem) => {
    return item.products.discount_price || item.products.price
  }

  const getItemTotal = (item: CartItem) => {
    return getItemPrice(item) * item.quantity
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + getItemTotal(item), 0)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Группируем товары по поставщикам
  const groupItemsBySeller = () => {
    const groups: { [sellerId: string]: CartItem[] } = {}
    cartItems.forEach(item => {
      const sellerId = item.products.seller_id
      if (!groups[sellerId]) {
        groups[sellerId] = []
      }
      groups[sellerId].push(item)
    })
    return groups
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Валидация
      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
        setError('Пожалуйста, заполните все обязательные поля')
        return
      }

      if (!formData.delivery_address.trim()) {
        setError('Пожалуйста, укажите адрес доставки')
        return
      }

      const sellerGroups = groupItemsBySeller()

      // Отправляем заказ каждому поставщику
      for (const [sellerId, items] of Object.entries(sellerGroups)) {
        const sellerEmail = items[0].products.profiles?.email || items[0].products.companies?.email
        const sellerName = items[0].products.companies?.name || 
                          `${items[0].products.profiles?.name_first || ''} ${items[0].products.profiles?.name_last || ''}`.trim() ||
                          'Поставщик'

        if (!sellerEmail) {
          console.warn(`Не найден email для поставщика ${sellerId}`)
          continue
        }

        // Формируем данные заказа
        const orderData = {
          buyer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            preferred_contact: formData.preferred_contact
          },
          delivery_address: formData.delivery_address,
          message: formData.message,
          items: items.map(item => ({
            product_id: item.products.id,
            name: item.products.name,
            quantity: item.quantity,
            price: getItemPrice(item),
            total: getItemTotal(item)
          })),
          total_amount: items.reduce((sum, item) => sum + getItemTotal(item), 0),
          seller: {
            id: sellerId,
            name: sellerName,
            email: sellerEmail
          }
        }

        // Отправляем email поставщику
        try {
          const emailResponse = await fetch('/api/send-order-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
          })
          
          if (!emailResponse.ok) {
            console.warn('Ошибка отправки email поставщику:', await emailResponse.text())
          } else {
            console.log('Email успешно отправлен поставщику')
          }
        } catch (emailError) {
          console.warn('Ошибка отправки email:', emailError)
        }

        // Создаем запись в базе данных для статистики
        const currentUser = await getCurrentUser()
        await supabase.from('orders').insert({
          buyer_id: currentUser?.user?.id,
          seller_id: sellerId,
          items: orderData.items,
          total_amount: orderData.total_amount,
          status: 'pending',
          buyer_info: orderData.buyer,
          delivery_address: formData.delivery_address,
          message: formData.message
        })
      }

      // Очищаем корзину после успешного оформления
      await clearCart()
      
      setSuccess(true)
      
      // Перенаправляем через 3 секунды
      setTimeout(() => {
        router.push('/orders')
      }, 3000)

    } catch (err) {
      console.error('Ошибка оформления заказа:', err)
      setError('Ошибка при оформлении заказа. Попробуйте еще раз.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-gray-200 rounded-lg h-64"></div>
          </div>
        </div>
      </main>
    )
  }

  if (success) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Заказ успешно оформлен!</h1>
          <p className="text-gray-600 mb-8">
            Ваш заказ отправлен поставщикам. Они свяжутся с вами в ближайшее время для уточнения деталей.
          </p>
          <div className="space-x-4">
            <Link 
              href="/orders"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Мои заказы
            </Link>
            <Link 
              href="/products"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Продолжить покупки
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <Link 
          href="/cart" 
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          ← Вернуться в корзину
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Оформление заказа</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Форма заказа */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Контактная информация</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    ФИО *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Компания
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label htmlFor="preferred_contact" className="block text-sm font-medium text-gray-700 mb-1">
                  Предпочтительный способ связи
                </label>
                <select
                  id="preferred_contact"
                  name="preferred_contact"
                  value={formData.preferred_contact}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="email">Email</option>
                  <option value="phone">Телефон</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Доставка</h2>
              
              <div>
                <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700 mb-1">
                  Адрес доставки *
                </label>
                <textarea
                  id="delivery_address"
                  name="delivery_address"
                  required
                  rows={3}
                  value={formData.delivery_address}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Укажите полный адрес доставки"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Дополнительная информация</h2>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Комментарий к заказу
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Укажите особые пожелания, сроки доставки или другую важную информацию"
                />
              </div>
            </div>
          </div>

          {/* Сводка заказа */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 flex-shrink-0">
                      {item.products.images && item.products.images.length > 0 ? (
                        <Image
                          src={item.products.images[0]}
                          alt={item.products.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
                        {item.products.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × {formatPrice(getItemPrice(item))}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(getItemTotal(item))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-semibold">
                  <span>Итого:</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  * Стоимость доставки будет рассчитана поставщиком
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Оформление...' : 'Оформить заказ'}
              </button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Нажимая "Оформить заказ", вы соглашаетесь с условиями использования платформы. 
                Ваши контактные данные будут переданы поставщикам для обработки заказа.
              </p>
            </div>
          </div>
        </div>
      </form>
    </main>
  )
} 