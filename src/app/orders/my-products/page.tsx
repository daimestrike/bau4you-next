'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getUserProducts, deleteProduct as deleteProductFromDB, updateProduct } from '@/lib/supabase'
import { formatPrice } from '@/utils/formatPrice'
import { 
  PlusIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

interface Product {
  id: string
  name: string
  description: string
  price: number
  stock_quantity: number
  category: string
  images: string[]
  status: string
  created_at: string
  unit: string
}

export default function MyProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const { data, error } = await getUserProducts()

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

  const deleteProduct = async (productId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) {
      return
    }

    setDeleting(productId)
    try {
      const { error } = await deleteProductFromDB(productId)

      if (error) {
        alert('Ошибка: ' + error.message)
      } else {
        await loadProducts()
      }
    } catch {
      alert('Ошибка удаления товара')
    } finally {
      setDeleting(null)
    }
  }

  const toggleProductStatus = async (productId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    
    try {
      const { error } = await updateProduct(productId, { status: newStatus })

      if (error) {
        alert('Ошибка: ' + error.message)
      } else {
        await loadProducts()
      }
    } catch {
      alert('Ошибка изменения статуса')
    }
  }

  // Используем импортированную функцию formatPrice из utils

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString))
  }

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      building_materials: 'Строительные материалы',
      tools: 'Инструменты',
      equipment: 'Оборудование',
      plumbing: 'Сантехника',
      electrical: 'Электрика',
      finishing_materials: 'Отделочные материалы',
      furniture: 'Мебель',
      roofing: 'Кровельные материалы',
      insulation: 'Утеплители',
      windows_doors: 'Окна и двери',
      other: 'Другое'
    }
    return categories[category] || category
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

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true
    return product.status === filter
  })

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Мои товары</h1>
          <p className="text-gray-600 mt-2">Управляйте своими товарами</p>
        </div>
        <Link
          href="/products/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Добавить товар
        </Link>
      </div>

      {/* Навигационные вкладки */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <Link
              href="/orders"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Заказы
            </Link>
            <Link
              href="/orders/my-products"
              className="border-blue-500 text-blue-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Мои товары
            </Link>
          </nav>
        </div>
      </div>

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
            Все ({products.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'active'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Активные ({products.filter(p => p.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'inactive'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Неактивные ({products.filter(p => p.status === 'inactive').length})
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <PhotoIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {filter === 'all' ? 'У вас пока нет товаров' : 'Нет товаров с выбранным статусом'}
          </h2>
          <p className="text-gray-500 mb-6">
            {filter === 'all' 
              ? 'Создайте свой первый товар, чтобы начать продажи'
              : 'Попробуйте изменить фильтр или создать новый товар'
            }
          </p>
          {filter === 'all' && (
            <Link
              href="/products/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <PlusIcon className="h-5 w-5" />
              Создать товар
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Изображение товара */}
              <div className="h-48 bg-gray-100 relative">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                {/* Статус */}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {getStatusLabel(product.status)}
                  </span>
                </div>
              </div>

              {/* Информация о товаре */}
              <div className="p-4">
                <div className="mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {getCategoryName(product.category)}
                  </p>
                </div>

                {product.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                )}

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      за {product.unit || 'шт'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm ${
                      (product.stock_quantity || 0) > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {(product.stock_quantity || 0) > 0 
                        ? `В наличии: ${product.stock_quantity}`
                        : 'Нет в наличии'
                      }
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Создан: {formatDate(product.created_at)}
                </div>

                {/* Кнопки действий */}
                <div className="flex gap-2">
                  <Link
                    href={`/products/${product.id}`}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <EyeIcon className="h-4 w-4" />
                    Просмотр
                  </Link>
                  
                  <Link
                    href={`/products/${product.id}/edit`}
                    className="flex-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-medium hover:bg-blue-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Редактировать
                  </Link>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => toggleProductStatus(product.id, product.status)}
                    className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                      product.status === 'active'
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {product.status === 'active' ? 'Деактивировать' : 'Активировать'}
                  </button>
                  
                  <button
                    onClick={() => deleteProduct(product.id)}
                    disabled={deleting === product.id}
                    className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm font-medium hover:bg-red-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                    {deleting === product.id ? 'Удаление...' : 'Удалить'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
} 