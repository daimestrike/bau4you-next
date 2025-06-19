'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { formatPrice } from '@/utils/formatPrice'

interface Product {
  id: string
  name: string
  description: string
  price: number
  discount_price?: number
  category: string
  images: string[]
  in_stock: boolean
  stock_quantity?: number
  status: string
  created_at: string
  companies?: {
    name: string
  }
}

export default function ManageProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    loadUserProducts()
  }, [])

  const loadUserProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Необходима авторизация')
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          companies:company_id(name)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setProducts(data || [])
      }
    } catch {
      setError('Ошибка загрузки товаров')
    } finally {
      setLoading(false)
    }
  }

  const updateProductStatus = async (productId: string, newStatus: string) => {
    setUpdating(productId)
    try {
      const { error } = await supabase
        .from('products')
        .update({ status: newStatus })
        .eq('id', productId)

      if (error) {
        alert('Ошибка: ' + error.message)
      } else {
        await loadUserProducts()
      }
    } catch {
      alert('Ошибка обновления статуса')
    } finally {
      setUpdating(null)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return

    setUpdating(productId)
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) {
        alert('Ошибка: ' + error.message)
      } else {
        await loadUserProducts()
      }
    } catch {
      alert('Ошибка удаления товара')
    } finally {
      setUpdating(null)
    }
  }

  // Используем импортированную функцию formatPrice из utils

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
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Активен'
      case 'inactive':
        return 'Неактивен'
      case 'out_of_stock':
        return 'Нет в наличии'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          {[...Array(5)].map((_, i) => (
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

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Управление товарами</h1>
        <Link
          href="/products/create"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Добавить товар
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="mb-6">
            <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 5l8 4" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">У вас пока нет товаров</h2>
          <p className="text-gray-500 mb-6">Добавьте первый товар, чтобы начать продавать</p>
          <Link
            href="/products/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Добавить товар
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex gap-4">
                {/* Изображение товара */}
                <div className="w-20 h-20 flex-shrink-0">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
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
                        <Link href={`/products/${product.id}`} className="hover:text-blue-600">
                          {product.name}
                        </Link>
                      </h3>
                      {product.companies && (
                        <p className="text-sm text-gray-600 mb-1">
                          Компания: {product.companies.name}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        Добавлен: {formatDate(product.created_at)}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(product.status)}`}>
                        {getStatusLabel(product.status)}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex justify-between items-end">
                    {/* Цена и наличие */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-semibold text-gray-900">
                          {formatPrice(product.discount_price || product.price)}
                        </span>
                        {product.discount_price && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      {product.stock_quantity && (
                        <p className="text-sm text-gray-600">
                          В наличии: {product.stock_quantity} шт.
                        </p>
                      )}
                    </div>

                    {/* Действия */}
                    <div className="flex gap-2">
                      <Link
                        href={`/products/edit/${product.id}`}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm hover:bg-blue-100 transition-colors"
                      >
                        Редактировать
                      </Link>
                      
                      <select
                        value={product.status}
                        onChange={(e) => updateProductStatus(product.id, e.target.value)}
                        disabled={updating === product.id}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="active">Активен</option>
                        <option value="inactive">Неактивен</option>
                        <option value="out_of_stock">Нет в наличии</option>
                      </select>
                      
                      <button
                        onClick={() => deleteProduct(product.id)}
                        disabled={updating === product.id}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {updating === product.id ? '...' : 'Удалить'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Статистика */}
      {products.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Всего товаров</h3>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Активных</h3>
            <p className="text-2xl font-bold text-green-600">
              {products.filter(p => p.status === 'active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Неактивных</h3>
            <p className="text-2xl font-bold text-gray-600">
              {products.filter(p => p.status !== 'active').length}
            </p>
          </div>
        </div>
      )}
    </main>
  )
}