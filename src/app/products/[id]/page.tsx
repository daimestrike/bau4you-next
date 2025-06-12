'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProduct, addToCart, addToFavorites, removeFromFavorites, getUserFavorites } from '@/lib/supabase'

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  discount?: number
  category: string
  images: string[]
  in_stock: boolean
  stock_quantity?: number
  specifications?: string
  profiles?: {
    company_name?: string
    name_first?: string
  name_last?: string
    role?: string
    phone?: string
    email?: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingToCart, setAddingToCart] = useState(false)
  const [toggleFavoriteLoading, setToggleFavoriteLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [productId, setProductId] = useState<string>('')

  useEffect(() => {
    params.then(resolved => {
      setProductId(resolved.id)
      loadProduct(resolved.id)
      checkIfFavorite(resolved.id)
    })
  }, [])

  const loadProduct = async (id: string) => {
    try {
      const { data, error } = await getProduct(id)
      if (error || !data) {
        setError('Продукт не найден')
        return
      }
      setProduct(data)
    } catch {
      setError('Ошибка загрузки продукта')
    } finally {
      setLoading(false)
    }
  }

  const checkIfFavorite = async (id: string) => {
    try {
      const { data } = await getUserFavorites()
      if (data) {
        const isInFavorites = data.some(fav => fav.products?.id === id)
        setIsFavorite(isInFavorites)
      }
    } catch {
      // Ignore error if user not authenticated
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    setAddingToCart(true)
    try {
      const { error } = await addToCart(product.id, 1)
      if (error) {
        alert('Ошибка: ' + error.message)
      } else {
        alert('Товар добавлен в корзину!')
      }
    } catch {
      alert('Ошибка добавления в корзину')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!product) return
    
    setToggleFavoriteLoading(true)
    try {
      if (isFavorite) {
        const { error } = await removeFromFavorites(product.id)
        if (!error) {
          setIsFavorite(false)
        }
      } else {
        const { error } = await addToFavorites(product.id)
        if (!error) {
          setIsFavorite(true)
        }
      }
    } catch {
      alert('Ошибка')
    } finally {
      setToggleFavoriteLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
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
      other: 'Другое'
    }
    return categories[category] || category
  }

  const calculateDiscountedPrice = (price: number, discount?: number) => {
    if (!discount) return price
    return price - (price * discount / 100)
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !product) {
    notFound()
  }

  const mainImage = product.images && product.images.length > 0 ? product.images[0] : null
  const additionalImages = product.images && product.images.length > 1 ? product.images.slice(1) : []

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Link 
          href="/products" 
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          ← Назад к продуктам
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Изображения */}
        <div className="space-y-4">
          {mainImage ? (
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={mainImage}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
              <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          
          {additionalImages.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {additionalImages.map((image: string, index: number) => (
                <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={image}
                    alt={`${product.name} - изображение ${index + 2}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Информация о продукте */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span className="bg-gray-100 px-2 py-1 rounded">
                {getCategoryName(product.category)}
              </span>
              {product.in_stock ? (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                  В наличии
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                  Нет в наличии
                </span>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            <div className="flex items-baseline gap-3 mb-6">
              {product.discount ? (
                <>
                  <span className="text-3xl font-bold text-red-600">
                    {formatCurrency(calculateDiscountedPrice(product.price, product.discount))}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    -{product.discount}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mb-3">Описание</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{product.description}</p>
          </div>

          {product.specifications && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Характеристики</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{product.specifications}</p>
            </div>
          )}

          {product.stock_quantity && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Наличие</h2>
              <p className="text-gray-700">В наличии: {product.stock_quantity} шт.</p>
            </div>
          )}

          {/* Информация о продавце */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Продавец</h2>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  {product.profiles?.company_name || `${product.profiles?.name_first || ''} ${product.profiles?.name_last || ''}`.trim() || 'Продавец'}
                </h3>
                <p className="text-sm text-gray-600">
                  {product.profiles?.role === 'contractor' ? 'Подрядчик' : 'Пользователь'}
                </p>
              </div>
            </div>
            
            {product.profiles?.phone && (
              <div className="text-sm text-gray-600 mb-2">
                <span className="font-medium">Телефон:</span> {product.profiles.phone}
              </div>
            )}
            
            {product.profiles?.email && (
              <div className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Email:</span> {product.profiles.email}
              </div>
            )}

            <div className="flex gap-3">
              {product.profiles?.phone && (
                <a
                  href={`tel:${product.profiles.phone}`}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center"
                >
                  Позвонить
                </a>
              )}
              {product.profiles?.email && (
                <a
                  href={`mailto:${product.profiles.email}?subject=Интерес к товару: ${product.name}`}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
                >
                  Написать
                </a>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="border-t pt-6">
            <div className="flex gap-3">
              <button
                onClick={() => handleAddToCart()}
                disabled={!product.in_stock || addingToCart}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
              >
                {addingToCart ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Добавляем...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4a.996.996 0 01-.9.6H3" />
                    </svg>
                    {product.in_stock ? 'В корзину' : 'Нет в наличии'}
                  </>
                )}
              </button>
              <button
                onClick={() => handleToggleFavorite()}
                disabled={toggleFavoriteLoading}
                className={`px-6 py-3 border rounded-md transition-colors ${
                  isFavorite 
                    ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}