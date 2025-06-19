'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { formatPriceSimple } from '@/utils/formatPrice'
import { Search, Filter, X, Star, Heart, ShoppingCart } from 'lucide-react'
import NoSSR from '@/components/NoSSR'

interface FilterState {
  search: string
  category: string
  region_id: string
  price_min: string
  price_max: string
  brand: string
  in_stock: boolean
  with_discount: boolean
  is_featured: boolean
}

function ProductsList({ filters }: { filters: FilterState }) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadProducts()
  }, [filters])

  const loadProducts = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('products')
        .select('*')
        .eq('status', 'active')
      
      // Применяем фильтры
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,tags.cs.{"${filters.search}"}`)
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      
      // Region filter removed - no direct relationship between products and regions
      
      if (filters.price_min) {
        query = query.gte('price', parseFloat(filters.price_min))
      }
      
      if (filters.price_max) {
        query = query.lte('price', parseFloat(filters.price_max))
      }
      
      // Brand filter removed - no brand column in products table
      // if (filters.brand) {
      //   query = query.ilike('brand', `%${filters.brand}%`)
      // }
      
      if (filters.in_stock) {
        query = query.gt('stock_quantity', 0)
      }
      
      if (filters.with_discount) {
        query = query.not('discount_price', 'is', null)
      }
      
      if (filters.is_featured) {
        query = query.eq('is_featured', true)
      }
      
      query = query.order('created_at', { ascending: false })
      
      const { data, error } = await query
      
      if (error) throw error
      

      
      setProducts(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (productId: string) => {
    const newFavorites = new Set(favorites)
    
    if (favorites.has(productId)) {
      newFavorites.delete(productId)
      await supabase.from('user_favorites').delete().eq('product_id', productId)
    } else {
      newFavorites.add(productId)
      await supabase.from('user_favorites').insert({ product_id: productId })
    }
    
    setFavorites(newFavorites)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse" suppressHydrationWarning>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden" suppressHydrationWarning>
            <div className="h-48 bg-gray-200" suppressHydrationWarning></div>
            <div className="p-4" suppressHydrationWarning>
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" suppressHydrationWarning></div>
              <div className="h-4 bg-gray-200 rounded mb-2" suppressHydrationWarning></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" suppressHydrationWarning></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mt-2" suppressHydrationWarning></div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  if (error) {
    return <div className="text-red-500">Ошибка загрузки продуктов: {error}</div>
  }
  
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">Продукты не найдены</h2>
        <p className="text-gray-500 mt-2">Попробуйте изменить параметры поиска</p>
      </div>
    )
  }
  
  return (
    <NoSSR fallback={
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-48 bg-gray-200"></div>
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3 mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    }>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
        const discountPrice = product.discount_price || (product.price * 0.9) // fallback calculation
        const hasDiscount = product.discount_price && product.discount_price < product.price
        const originalImageUrl = product.images && product.images.length > 0 ? product.images[0] : null
        const imageUrl = originalImageUrl ? `/api/image-proxy?url=${encodeURIComponent(originalImageUrl)}` : null
        
        // Определяем статус наличия
        const stockQuantity = product.stock_quantity || 0
        const isInStock = stockQuantity > 0
        
        return (
          <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow relative group">
            <Link href={`/products/${product.id}`}>
              <div className="h-48 bg-gray-100 relative">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={product.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100">
                    <span className="text-4xl text-gray-300">Нет фото</span>
                  </div>
                )}
                
                {hasDiscount && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
                    -{Math.round(((product.price - discountPrice) / product.price) * 100)}%
                  </div>
                )}
                
                {product.is_featured && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 text-xs font-medium rounded flex items-center">
                    <Star className="w-3 h-3 mr-1" />
                    Хит
                  </div>
                )}
              </div>
            </Link>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <Link href={`/products/${product.id}`} className="flex-1">
                  <h2 className="font-medium text-lg line-clamp-1 hover:text-blue-600">{product.name}</h2>
                </Link>
                
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      favorites.has(product.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-400 hover:text-red-500'
                    }`} 
                  />
                </button>
              </div>
              
              {/* Brand removed - no brand field in products table */}
              {false && product.brand && (
                <p className="text-sm text-gray-500 mb-1">Бренд: {product.brand}</p>
              )}
              
              {product.description && (
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
              )}
              
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <span className="font-semibold text-lg text-gray-900">
                      {hasDiscount ? formatPriceSimple(discountPrice) : formatPriceSimple(product.price)}
                    </span>
                    
                    {hasDiscount && product.price > 0 && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        {formatPriceSimple(product.price)}
                      </span>
                    )}
                  </div>
                  
                  {product.price > 0 && (
                    <p className="text-xs text-gray-500 mt-1">за {product.unit || 'шт'}</p>
                  )}
                </div>
                
                <div className="text-right">
                  {isInStock ? (
                    <span className="text-green-600 text-sm">В наличии: {stockQuantity}</span>
                  ) : (
                    <span className="text-red-600 text-sm">Нет в наличии</span>
                  )}
                </div>
              </div>
              
              {/* Company info removed - no relationship loaded */}
              {false && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
                      <span className="text-xs text-gray-500">?</span>
                    </div>
                    <span className="text-sm text-gray-600">Поставщик</span>
                  </div>
                  
                  <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    В корзину
                  </button>
                </div>
              )}
              
              {product.tags && product.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {product.tags.slice(0, 3).map((tag: string, index: number) => (
                    <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
      </div>
    </NoSSR>
  )
}

// Компонент для фильтрации продуктов
function ProductsFilter({ filters, onFiltersChange }: {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}) {
  const [regions, setRegions] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadRegions()
  }, [])

  const loadRegions = async () => {
    const { data } = await supabase.from('regions').select('*').order('name')
    setRegions(data || [])
  }

  const handleFilterChange = (key: keyof FilterState, value: string | boolean) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      category: '',
      region_id: '',
      price_min: '',
      price_max: '',
      brand: '',
      in_stock: false,
      with_discount: false,
      is_featured: false
    })
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    typeof value === 'string' ? value !== '' : value === true
  )

  return (
    <div className="bg-white rounded-lg shadow-sm mb-6" suppressHydrationWarning>
      {/* Поиск */}
      <div className="p-4 border-b" suppressHydrationWarning>
        <div className="relative" suppressHydrationWarning>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Заголовок фильтров */}
      <div className="p-4 border-b" suppressHydrationWarning>
        <div className="flex items-center justify-between" suppressHydrationWarning>
          <h2 className="text-lg font-semibold flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Фильтры
          </h2>
          <div className="flex items-center space-x-2" suppressHydrationWarning>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <X className="w-4 h-4 mr-1" />
                Очистить
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden text-blue-600 text-sm"
            >
              {showFilters ? 'Скрыть' : 'Показать'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Фильтры */}
      <div className={`p-4 space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`} suppressHydrationWarning>
        {/* Категория */}
        <div suppressHydrationWarning>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Категория
          </label>
          <select 
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Все категории</option>
            <option value="building_materials">Строительные материалы</option>
            <option value="tools">Инструменты</option>
            <option value="equipment">Оборудование</option>
            <option value="plumbing">Сантехника</option>
            <option value="electrical">Электрика</option>
            <option value="finishing_materials">Отделочные материалы</option>
            <option value="furniture">Мебель</option>
            <option value="roofing">Кровельные материалы</option>
            <option value="insulation">Утеплители</option>
            <option value="windows_doors">Окна и двери</option>
            <option value="other">Другое</option>
          </select>
        </div>
        
        {/* Регион - скрыт, так как нет связи между продуктами и регионами */}
        {false && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Регион поставщика
          </label>
          <select 
            value={filters.region_id}
            onChange={(e) => handleFilterChange('region_id', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Все регионы</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
        )}
        
        {/* Бренд - скрыт, так как нет поля brand в таблице products */}
        {false && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Бренд
          </label>
          <input 
            type="text" 
            placeholder="Введите название бренда"
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        )}
        
        {/* Цена */}
        <div suppressHydrationWarning>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Цена, ₽
          </label>
          <div className="grid grid-cols-2 gap-2" suppressHydrationWarning>
            <input 
              type="number" 
              placeholder="От"
              value={filters.price_min}
              onChange={(e) => handleFilterChange('price_min', e.target.value)}
              min="0"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <input 
              type="number" 
              placeholder="До"
              value={filters.price_max}
              onChange={(e) => handleFilterChange('price_max', e.target.value)}
              min="0"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Чекбоксы */}
        <div suppressHydrationWarning>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Дополнительные фильтры
          </label>
          <div className="space-y-2" suppressHydrationWarning>
            <div className="flex items-center" suppressHydrationWarning>
              <input 
                type="checkbox" 
                id="inStock" 
                checked={filters.in_stock} 
                onChange={(e) => handleFilterChange('in_stock', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="inStock" className="text-sm text-gray-700">
                В наличии
              </label>
            </div>
            <div className="flex items-center" suppressHydrationWarning>
              <input 
                type="checkbox" 
                id="onSale" 
                                checked={filters.with_discount}
                onChange={(e) => handleFilterChange('with_discount', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="onSale" className="text-sm text-gray-700">
                Со скидкой
              </label>
            </div>
            <div className="flex items-center" suppressHydrationWarning>
              <input 
                type="checkbox" 
                id="recommended" 
                                checked={filters.is_featured}
                onChange={(e) => handleFilterChange('is_featured', e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="recommended" className="text-sm text-gray-700">
                Рекомендуемые
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    region_id: '',
    price_min: '',
    price_max: '',
    brand: '',
    in_stock: false,
    with_discount: false,
    is_featured: false
  })

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6" suppressHydrationWarning>
        <div suppressHydrationWarning>
          <h1 className="text-3xl font-bold text-gray-900">Bau.Маркет</h1>
          <p className="text-gray-600 mt-1">Строительные материалы и оборудование</p>
        </div>
        <Link 
          href="/products/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
        >
          Добавить продукт
        </Link>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6" suppressHydrationWarning>
        <div className="lg:w-1/4" suppressHydrationWarning>
          <ProductsFilter filters={filters} onFiltersChange={setFilters} />
        </div>
        
        <div className="lg:w-3/4" suppressHydrationWarning>
          <ProductsList filters={filters} />
        </div>
      </div>
    </main>
  )
}