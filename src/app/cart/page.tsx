'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCartItems, updateCartQuantity, removeFromCart, clearCart, getLatestProducts } from '@/lib/supabase'
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
    stock_quantity: number
    status: string
    companies?: {
      name: string
    }
  }
}

interface Product {
  id: string
  name: string
  price: number
  image_url?: string
  stock_quantity: number
  companies?: {
    name: string
  }
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [latestProducts, setLatestProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadCartItems()
    loadLatestProducts()
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

  const loadLatestProducts = async () => {
    try {
      const { data, error } = await getLatestProducts(12)
      if (error) {
        console.error('Error loading latest products:', error)
      } else {
        setLatestProducts(data || [])
      }
    } catch (error) {
      console.error('Error loading latest products:', error)
    }
  }

  const handleQuantityChange = async (cartItemId: string, newQuantity: number) => {
    setUpdating(cartItemId)
    try {
      const { error } = await updateCartQuantity(cartItemId, newQuantity)
      if (error) {
        setError(error.message)
      } else {
        await loadCartItems()
      }
    } catch {
      setError('Ошибка обновления количества')
    } finally {
      setUpdating(null)
    }
  }

  const handleRemoveItem = async (cartItemId: string) => {
    setUpdating(cartItemId)
    try {
      const { error } = await removeFromCart(cartItemId)
      if (error) {
        setError(error.message)
      } else {
        await loadCartItems()
      }
    } catch {
      setError('Ошибка удаления товара')
    } finally {
      setUpdating(null)
    }
  }

  const handleClearCart = async () => {
    if (!confirm('Вы уверены, что хотите очистить корзину?')) return
    
    setLoading(true)
    try {
      const { error } = await clearCart()
      if (error) {
        setError(error.message)
      } else {
        setCartItems([])
      }
    } catch {
      setError('Ошибка очистки корзины')
    } finally {
      setLoading(false)
    }
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

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    )
  }

  if (cartItems.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Корзина покупок</h1>
        
        <div className="text-center py-12">
          <div className="mb-6">
            <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4a.996.996 0 01-.9.6H3m0 0h2l.4 2M7 13v8a2 2 0 002 2h8a2 2 0 002-2v-8M9 9h6" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Корзина пуста</h2>
          <p className="text-gray-500 mb-6">Добавьте товары в корзину, чтобы оформить заказ</p>
          <Link
            href="/products"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Перейти к покупкам
          </Link>
        </div>

        {/* Карусель последних товаров */}
        {latestProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Последние товары</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {latestProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="relative aspect-square bg-gray-100">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h4>
                    {product.companies?.name && (
                      <p className="text-sm text-gray-500 mb-2">
                        {product.companies.name}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-blue-600">
                        {formatPrice(product.price)}
                      </span>
                      <span className="text-sm text-gray-500">
                        В наличии: {product.stock_quantity}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Корзина покупок</h1>
        {cartItems.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Очистить корзину
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Список товаров */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex gap-4">
                {/* Изображение товара */}
                <div className="w-20 h-20 flex-shrink-0">
                  {item.products.images && item.products.images.length > 0 ? (
                    <Image
                      src={item.products.images[0]}
                      alt={item.products.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-md flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Информация о товаре */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        <Link href={`/products/${item.products.id}`} className="hover:text-blue-600">
                          {item.products.name}
                        </Link>
                      </h3>
                      {item.products.companies && (
                        <p className="text-sm text-gray-600">
                          от {item.products.companies.name}
                        </p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={updating === item.id}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex justify-between items-end">
                    {/* Цена */}
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPrice(getItemPrice(item))}
                      </span>
                      {item.products.discount_price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(item.products.price)}
                        </span>
                      )}
                    </div>

                    {/* Количество */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={updating === item.id || item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">
                        {updating === item.id ? '...' : item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        disabled={updating === item.id || item.quantity >= item.products.stock_quantity}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Итого за товар */}
                  <div className="mt-3 text-right">
                    <span className="text-lg font-semibold text-gray-900">
                      Итого: {formatPrice(getItemTotal(item))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Итоги заказа */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Итоги заказа</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Товары ({cartItems.length})</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Доставка</span>
                <span>Рассчитается при оформлении</span>
              </div>
            </div>
            
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-xl font-semibold">
                <span>Итого:</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Перейти к оформлению
            </button>

            <Link
              href="/products"
              className="block w-full text-center text-blue-600 hover:text-blue-800 mt-4 py-2"
            >
              Продолжить покупки
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
} 