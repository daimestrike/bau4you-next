'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCartItems, createOrder, clearCart } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: string
  quantity: number
  products: {
    id: string
    name: string
    price: number
    discount_price?: number
    images: string[]
    companies?: {
      name: string
    }
  }
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    shipping_address: '',
    shipping_method: 'standard',
    payment_method: 'cash',
    notes: ''
  })
  const router = useRouter()

  useEffect(() => {
    loadCartItems()
  }, [])

  const loadCartItems = async () => {
    try {
      const { data, error } = await getCartItems()
      if (error) {
        setError(error.message)
      } else {
        setCartItems(data || [])
      }
    } catch {
      setError('Ошибка загрузки корзины')
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

  const getShippingCost = () => {
    if (formData.shipping_method === 'express') return 500
    if (formData.shipping_method === 'pickup') return 0
    return 300 // standard
  }

  const getFinalTotal = () => {
    return getTotalPrice() + getShippingCost()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (cartItems.length === 0) {
      setError('Корзина пуста')
      return
    }

    if (!formData.shipping_address.trim()) {
      setError('Укажите адрес доставки')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const orderItems = cartItems.map(item => ({
        product_id: item.products.id,
        quantity: item.quantity,
        price: getItemPrice(item)
      }))

      const { data, error } = await createOrder({
        items: orderItems,
        shipping_address: formData.shipping_address,
        shipping_method: formData.shipping_method,
        payment_method: formData.payment_method,
        notes: formData.notes
      })

      if (error) {
        setError(error.message)
      } else {
        // Очищаем корзину после успешного оформления
        await clearCart()
        // Перенаправляем на страницу успеха
        router.push(`/orders/${data.id}?success=true`)
      }
    } catch {
      setError('Ошибка оформления заказа')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    )
  }

  if (cartItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Оформление заказа</h1>
        
        <div className="text-center py-12">
          <div className="mb-6">
            <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4a.996.996 0 01-.9.6H3" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Корзина пуста</h2>
          <p className="text-gray-500 mb-6">Добавьте товары в корзину для оформления заказа</p>
          <Link
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Перейти к покупкам
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/cart" 
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          ← Назад в корзину
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
            {/* Адрес доставки */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Адрес доставки</h2>
              <textarea
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Укажите полный адрес доставки с индексом"
              />
            </div>

            {/* Способ доставки */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Способ доставки</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="shipping_method"
                    value="standard"
                    checked={formData.shipping_method === 'standard'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <div className="flex-1 flex justify-between">
                    <span>Стандартная доставка (3-5 дней)</span>
                    <span className="font-medium">{formatPrice(300)}</span>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="shipping_method"
                    value="express"
                    checked={formData.shipping_method === 'express'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <div className="flex-1 flex justify-between">
                    <span>Экспресс-доставка (1-2 дня)</span>
                    <span className="font-medium">{formatPrice(500)}</span>
                  </div>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="shipping_method"
                    value="pickup"
                    checked={formData.shipping_method === 'pickup'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <div className="flex-1 flex justify-between">
                    <span>Самовывоз</span>
                    <span className="font-medium">Бесплатно</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Способ оплаты */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Способ оплаты</h2>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash"
                    checked={formData.payment_method === 'cash'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span>Наличными при получении</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment_method"
                    value="card"
                    checked={formData.payment_method === 'card'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span>Банковской картой при получении</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment_method"
                    value="online"
                    checked={formData.payment_method === 'online'}
                    onChange={handleInputChange}
                    className="mr-3"
                  />
                  <span>Онлайн-оплата</span>
                </label>
              </div>
            </div>

            {/* Комментарий */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Комментарий к заказу</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Дополнительные пожелания к заказу"
              />
            </div>
          </div>

          {/* Итоги заказа */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Ваш заказ</h2>
              
              {/* Список товаров */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 py-2 border-b border-gray-100 last:border-b-0">
                    <div className="w-12 h-12 flex-shrink-0">
                      {item.products.images && item.products.images.length > 0 ? (
                        <Image
                          src={item.products.images[0]}
                          alt={item.products.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.products.name}
                      </h4>
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
              
              {/* Расчеты */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Товары</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Доставка</span>
                  <span>{formatPrice(getShippingCost())}</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-xl font-semibold">
                  <span>Итого:</span>
                  <span>{formatPrice(getFinalTotal())}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Оформляем заказ...' : 'Оформить заказ'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  )
} 