'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getProduct, addToCart, addToFavorites, removeFromFavorites, getUserFavorites } from '@/lib/supabase'
import { formatPrice } from '@/utils/formatPrice'

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
  seller_id: string
  company_id?: string
  profiles?: {
    id: string
    company_name?: string
    name_first?: string
  name_last?: string
    role?: string
    phone?: string
    email?: string
  }
  companies?: {
    id: string
    name: string
    type: string
    description?: string
    location?: string
    logo_url?: string
    cover_image?: string
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
  const [quantity, setQuantity] = useState(1)
  const [cartSuccess, setCartSuccess] = useState(false)

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
      const { data, error } = await getUserFavorites()
      if (error) {
        console.warn('Could not load favorites:', error.message)
        return
      }
      if (data) {
        const isInFavorites = data.some(fav => fav.products?.id === id)
        setIsFavorite(isInFavorites)
      }
    } catch (error) {
      console.warn('Error checking favorites:', error)
      // Ignore error if user not authenticated
    }
  }

  const handleAddToCart = async () => {
    if (!product) return
    
    setAddingToCart(true)
    setCartSuccess(false)
    
    try {
      const { error } = await addToCart(product.id, quantity)
      if (error) {
        console.error('Cart error details:', error)
        const errorMessage = error.message || 'Неизвестная ошибка'
        alert('Ошибка: ' + errorMessage)
      } else {
        setCartSuccess(true)
        // Скрываем сообщение об успехе через 3 секунды
        setTimeout(() => setCartSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Unexpected error in handleAddToCart:', err)
      alert('Ошибка добавления в корзину: ' + (err instanceof Error ? err.message : 'Неизвестная ошибка'))
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
              {(product.stock_quantity || 0) > 0 ? (
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
              {product.discount && product.price > 0 ? (
                <>
                  <span className="text-3xl font-bold text-red-600">
                    {formatPrice(calculateDiscountedPrice(product.price, product.discount))}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    -{product.discount}%
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
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

          {(product.stock_quantity || 0) > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Наличие</h2>
              <p className="text-gray-700">В наличии: {product.stock_quantity} шт.</p>
            </div>
          )}

          {/* Информация о продавце */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Продавец</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-4">
                {/* Логотип компании или аватар */}
                <div className="w-16 h-16 bg-white rounded-lg border flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.companies?.logo_url ? (
                    <Image
                      src={product.companies.logo_url}
                      alt={product.companies.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                  )}
              </div>
                
                <div className="flex-1 min-w-0">
                  {/* Название компании или имя продавца */}
                  <div className="mb-2">
                    {product.companies ? (
                      <Link
                        href={`/companies/${product.companies.id}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {product.companies.name}
                      </Link>
                    ) : (
                      <h3 className="text-lg font-semibold text-gray-900">
                        {product.profiles?.company_name || 
                         `${product.profiles?.name_first || ''} ${product.profiles?.name_last || ''}`.trim() || 
                         'Продавец'}
                </h3>
                    )}
                    
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.companies?.type === 'supplier' 
                          ? 'bg-green-100 text-green-800'
                          : product.companies?.type === 'contractor'
                          ? 'bg-blue-100 text-blue-800'
                          : product.companies?.type === 'both'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.companies?.type === 'supplier' && 'Поставщик'}
                        {product.companies?.type === 'contractor' && 'Подрядчик'}
                        {product.companies?.type === 'both' && 'Поставщик и Подрядчик'}
                        {!product.companies?.type && (product.profiles?.role === 'contractor' ? 'Подрядчик' : 'Пользователь')}
                      </span>
                      
                      {product.companies?.location && (
                        <span className="text-sm text-gray-500 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {product.companies.location}
                        </span>
                      )}
              </div>
            </div>
            
                  {/* Описание компании */}
                  {product.companies?.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.companies.description}
                    </p>
                  )}
                  
                  {/* Контактная информация */}
                  <div className="space-y-1">
            {product.profiles?.phone && (
                      <div className="text-sm text-gray-600 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {product.profiles.phone}
              </div>
            )}
            
            {product.profiles?.email && (
                      <div className="text-sm text-gray-600 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {product.profiles.email}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки действий для связи с продавцом */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {product.companies && (
                <Link
                  href={`/companies/${product.companies.id}`}
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Магазин
                </Link>
              )}
              
              {product.profiles?.phone && (
                <a
                  href={`tel:${product.profiles.phone}`}
                  className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Позвонить
                </a>
              )}
              
              {product.profiles?.email && (
                <a
                  href={`mailto:${product.profiles.email}?subject=Интерес к товару: ${product.name}`}
                  className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors text-center font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Написать
                </a>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="border-t pt-6">
            {/* Сообщение об успешном добавлении в корзину */}
            {cartSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Товар добавлен в корзину!
              </div>
            )}
            
            {/* Выбор количества */}
            {(product.stock_quantity || 0) > 0 && (
              <div className="mb-4">
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Количество
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                      disabled={quantity <= 1}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={product.stock_quantity || 999}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 px-3 py-2 text-center border-0 focus:ring-0"
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity || 999, quantity + 1))}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-100 transition-colors"
                      disabled={product.stock_quantity ? quantity >= product.stock_quantity : false}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                  {product.stock_quantity && (
                    <span className="text-sm text-gray-500">
                      Доступно: {product.stock_quantity} шт.
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => handleAddToCart()}
                disabled={(product.stock_quantity || 0) <= 0 || addingToCart}
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
                ) : cartSuccess ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Добавлено!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4a.996.996 0 01-.9.6H3" />
                    </svg>
                    {(product.stock_quantity || 0) > 0 ? 'В корзину' : 'Нет в наличии'}
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
                title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
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