import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'

async function ProductsList() {
  // Загружаем список продуктов
  const supabase = await createClient()
  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      companies(id, name, logo_url)
    `)
    .order('created_at', { ascending: false })
  
  if (error) {
    return <div className="text-red-500">Ошибка загрузки продуктов: {error.message}</div>
  }
  
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-700">Продукты не найдены</h2>
        <p className="text-gray-500 mt-2">В данный момент в маркетплейсе нет продуктов</p>
      </div>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <Link 
          key={product.id} 
          href={`/products/${product.id}`}
          className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="h-48 bg-gray-100 relative">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100">
                <span className="text-4xl text-gray-300">Нет фото</span>
              </div>
            )}
            
            {product.discount_percent > 0 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
                -{product.discount_percent}%
              </div>
            )}
          </div>
          
          <div className="p-4">
            <h2 className="font-medium text-lg line-clamp-1">{product.name}</h2>
            
            {product.description && (
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
            )}
            
            <div className="mt-3 flex items-center justify-between">
              <div>
                {product.price && (
                  <div className="flex items-center">
                    <span className="font-semibold text-lg text-gray-900">
                      {product.discount_percent > 0 
                        ? (product.price * (1 - product.discount_percent / 100)).toLocaleString() 
                        : product.price.toLocaleString()} ₽
                    </span>
                    
                    {product.discount_percent > 0 && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        {product.price.toLocaleString()} ₽
                      </span>
                    )}
                  </div>
                )}
                
                {product.price_unit && (
                  <p className="text-xs text-gray-500 mt-1">Цена за {product.price_unit}</p>
                )}
              </div>
              
              {product.in_stock && (
                <span className="text-green-600 text-sm">В наличии</span>
              )}
            </div>
            
            {product.companies && (
              <div className="mt-3 flex items-center">
                <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-2">
                  {product.companies.logo_url ? (
                    <img 
                      src={product.companies.logo_url} 
                      alt={product.companies.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-500">{product.companies.name.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-sm text-gray-600">{product.companies.name}</span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

// Компонент для фильтрации продуктов
function ProductsFilter() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 className="text-lg font-semibold mb-3">Фильтры</h2>
      
      <form className="space-y-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Категория
          </label>
          <select 
            id="category" 
            name="category"
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
            <option value="other">Другое</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Цена
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input 
                type="number" 
                id="price_min" 
                name="price_min" 
                placeholder="От"
                min="0"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <input 
                type="number" 
                id="price_max" 
                name="price_max" 
                placeholder="До"
                min="0"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Наличие
          </label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="in_stock" 
                name="in_stock" 
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="in_stock" className="ml-2 text-sm text-gray-700">
                Только в наличии
              </label>
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="with_discount" 
                name="with_discount" 
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="with_discount" className="ml-2 text-sm text-gray-700">
                Со скидкой
              </label>
            </div>
          </div>
        </div>
        
        <div className="pt-2">
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Применить фильтры
          </button>
        </div>
      </form>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Маркетплейс</h1>
        <Link 
          href="/products/create" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Добавить продукт
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/4">
          <ProductsFilter />
        </div>
        
        <div className="md:w-3/4">
          <Suspense fallback={
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
            <ProductsList />
          </Suspense>
        </div>
      </div>
    </main>
  )
}