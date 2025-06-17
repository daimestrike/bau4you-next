'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { globalSearch, getSearchSuggestions, getPopularSearches, saveSearchHistory, getSearchHistory } from '@/lib/supabase'
import { formatPriceSimple } from '@/utils/formatPrice'
import SEOHead from '@/components/SEO/SEOHead'
import { generateSearchSEO } from '@/lib/seo'

// Отключаем SSG для этой страницы
export const dynamic = 'force-dynamic'

interface SearchResult {
  tenders: any[]
  products: any[]
  companies: any[]
}

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState<SearchResult>({ tenders: [], products: [], companies: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<'all' | 'tenders' | 'products' | 'companies'>('all')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [popularSearches, setPopularSearches] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<any[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const loadInitialData = async () => {
      const [popularData, historyData] = await Promise.all([
        getPopularSearches(),
        getSearchHistory()
      ])
      
      if (popularData.data) setPopularSearches(popularData.data)
      if (historyData.data) setSearchHistory(historyData.data)
    }

    loadInitialData()

    // Выполняем поиск если есть query в URL
    const initialQuery = searchParams.get('q')
    if (initialQuery) {
      setQuery(initialQuery)
      performSearch(initialQuery)
    }
  }, [])

  useEffect(() => {
    const getSuggestions = async () => {
      if (query.length >= 2) {
        const { data } = await getSearchSuggestions(query)
        if (data) setSuggestions(data)
      } else {
        setSuggestions([])
      }
    }

    const debounceTimer = setTimeout(getSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const performSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    try {
      const { data, error } = await globalSearch(searchQuery, { 
        type: activeFilter === 'all' ? undefined : activeFilter,
        limit: 50
      })

      if (data) {
        setResults(data)
        setTotalResults(data.tenders.length + data.products.length + data.companies.length)
        
        // Сохраняем в историю поиска
        await saveSearchHistory(searchQuery, activeFilter)
        
        // Обновляем URL
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`, { scroll: false })
      }

      if (error) {
        console.error('Search error:', error)
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
      setShowSuggestions(false)
    }
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch()
  }

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    setShowSuggestions(false)
    performSearch(suggestion)
  }

  const handleFilterChange = (filter: typeof activeFilter) => {
    setActiveFilter(filter)
    if (query.trim()) {
      performSearch()
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))
  }

  // Генерируем SEO данные
  const searchSEO = generateSearchSEO(query)

  return (
    <>
      <SEOHead structuredData={undefined} />
      <div className="min-h-screen bg-gray-50" suppressHydrationWarning={true}>
      {/* Шапка поиска */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40" suppressHydrationWarning={true}>
        <div className="container mx-auto px-4 py-4" suppressHydrationWarning={true}>
          <div className="flex items-center space-x-4" suppressHydrationWarning={true}>
            {/* Логотип */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center" suppressHydrationWarning={true}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">Bau.Поиск</span>
            </Link>

            {/* Поисковая строка */}
            <div className="flex-1 max-w-2xl relative" suppressHydrationWarning={true}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Поиск тендеров, товаров и компаний..."
                  className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-blue-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </form>

              {/* Выпадающий список с подсказками */}
              {showSuggestions && (suggestions.length > 0 || popularSearches.length > 0) && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50">
                  {suggestions.length > 0 && (
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 mb-2 px-2">Предложения</div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {!query && popularSearches.length > 0 && (
                    <div className="p-2 border-t border-gray-100">
                      <div className="text-xs font-medium text-gray-500 mb-2 px-2">Популярные запросы</div>
                      {popularSearches.slice(0, 6).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(search)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Фильтры */}
          <div className="flex items-center space-x-1 mt-4" suppressHydrationWarning={true}>
            {[
              { key: 'all', label: 'Все результаты' },
              { key: 'tenders', label: 'Тендеры' },
              { key: 'products', label: 'Товары' },
              { key: 'companies', label: 'Компании' }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => handleFilterChange(filter.key as typeof activeFilter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="container mx-auto px-4 py-8" suppressHydrationWarning={true}>
        {/* Загрузка */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Нет запроса - показываем стартовую страницу */}
        {!query && !isLoading && (
          <div className="max-w-4xl mx-auto text-center py-12" suppressHydrationWarning={true}>
            <div className="mb-8" suppressHydrationWarning={true}>
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6" suppressHydrationWarning={true}>
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Bau.Поиск</h1>
              <p className="text-xl text-gray-600 mb-8">
                Найдите тендеры, товары и компании в строительной сфере
              </p>
            </div>

            {/* Популярные категории */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12" suppressHydrationWarning={true}>
              <div className="bg-white rounded-lg p-6 shadow-sm border" suppressHydrationWarning={true}>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4" suppressHydrationWarning={true}>
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Тендеры</h3>
                <p className="text-gray-600">Поиск по строительным тендерам и проектам</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border" suppressHydrationWarning={true}>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4" suppressHydrationWarning={true}>
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Товары</h3>
                <p className="text-gray-600">Строительные материалы и оборудование</p>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border" suppressHydrationWarning={true}>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4" suppressHydrationWarning={true}>
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Компании</h3>
                <p className="text-gray-600">Подрядчики, поставщики и партнеры</p>
              </div>
            </div>

            {/* Популярные запросы */}
            {popularSearches.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Популярные запросы</h2>
                <div className="flex flex-wrap justify-center gap-3">
                  {popularSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(search)}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 hover:bg-gray-50 hover:border-blue-300 transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Результаты поиска */}
        {query && !isLoading && (
          <div>
            {/* Заголовок результатов */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Результаты поиска для "{query}"
              </h2>
              <p className="text-gray-600">
                Найдено {totalResults} результатов
              </p>
            </div>

            {/* Тендеры и Проекты */}
            {(activeFilter === 'all' || activeFilter === 'tenders') && results.tenders.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Тендеры и Проекты ({results.tenders.length})
                </h3>
                <div className="space-y-4">
                  {results.tenders.map((tender) => (
                    <Link
                      key={tender.id}
                      href={tender.type === 'project' ? `/projects/${tender.id}` : `/tenders/${tender.id}`}
                      className="block bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow p-6"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 hover:text-blue-600 flex-1">
                          {tender.name || tender.title}
                        </h4>
                        {tender.category && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">
                            Проект
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">{tender.description}</p>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-500">{tender.city}</span>
                          <span className="text-gray-500">
                            {new Date(tender.created_at).toLocaleDateString('ru-RU')}
                          </span>
                          {tender.companies && (
                            <span className="text-gray-500">
                              Заказчик: {tender.companies.name}
                            </span>
                          )}
                        </div>
                        <div className="text-green-600 font-medium">
                          {tender.budget_min && tender.budget_max
                            ? `${tender.budget_min.toLocaleString()} - ${tender.budget_max.toLocaleString()} ₽`
                            : tender.budget_min
                              ? `от ${tender.budget_min.toLocaleString()} ₽`
                              : 'Бюджет не указан'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Товары */}
            {(activeFilter === 'all' || activeFilter === 'products') && results.products.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Товары ({results.products.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="block bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {product.image_url && (
                  <img
                    src={`/api/image-proxy?url=${encodeURIComponent(product.image_url)}`}
                    alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      )}
                      <div className="p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                          {product.name}
                        </h4>
                        <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-green-600">
                            {formatPriceSimple(product.price || 0)}
                          </span>
                          <span className="text-sm text-gray-500">{product.category}</span>
                        </div>
                        {product.companies && (
                          <div className="mt-2 text-sm text-gray-500">
                            Поставщик: {product.companies.name}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Компании */}
            {(activeFilter === 'all' || activeFilter === 'companies') && results.companies.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Компании ({results.companies.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.companies.map((company) => (
                    <Link
                      key={company.id}
                      href={`/companies/${company.id}`}
                      className="block bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow overflow-hidden"
                    >
                      {company.cover_image && (
                        <img
                          src={company.cover_image}
                          alt={company.name}
                          className="w-full h-32 object-cover"
                        />
                      )}
                      <div className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                            {company.logo_url ? (
                              <img
                                src={company.logo_url}
                                alt={company.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xl font-bold text-gray-500">
                                {company.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                                {company.name}
                              </h4>
                              {company.verified && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full">
                                  ✓ Проверено
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 mb-3 line-clamp-2">{company.description}</p>
                            <div className="flex justify-between items-center text-sm">
                              <div className="space-x-2">
                                <span className="text-gray-500">{company.industry}</span>
                                <span className="text-gray-500">• {company.city}</span>
                                <span className="text-gray-500">
                                  • {company.type === 'contractor' ? 'Подрядчик' : 
                                      company.type === 'supplier' ? 'Поставщик' : 'Универсальная'}
                                </span>
                              </div>
                              {company.rating > 0 && (
                                <div className="flex items-center">
                                  <div className="flex items-center mr-1">
                                    {renderStars(Math.round(company.rating))}
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    {company.rating.toFixed(1)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Нет результатов */}
            {query && totalResults === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ничего не найдено</h3>
                <p className="text-gray-600 mb-6">
                  Попробуйте изменить поисковый запрос или использовать другие ключевые слова
                </p>
                <div className="space-x-2">
                  <button
                    onClick={() => setQuery('')}
                    className="px-4 py-2 text-blue-600 hover:text-blue-800"
                  >
                    Очистить поиск
                  </button>
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Показать все категории
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Закрытие выпадающего списка при клике вне его */}
      {showSuggestions && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
    </>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка поиска...</p>
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}