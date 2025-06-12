'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Tender {
  id: string
  title: string
  description: string
  budget_min?: number
  budget_max?: number
  deadline?: string
  created_at: string
  status: string
  category?: string
  location?: string
}

export default function TendersPage() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [tenders, setTenders] = useState<Tender[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    budget_min: '',
    budget_max: ''
  })

  // Защита от гидратации
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadTenders()
  }, [mounted])

  const loadTenders = async () => {
    try {
      console.log('[Tenders] Загрузка тендеров...')
      
      let query = supabase
        .from('tenders')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      // Применяем фильтры
      if (filters.category) {
        query = query.eq('category', filters.category)
      }
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`)
      }
      if (filters.budget_min) {
        query = query.gte('budget_min', Number(filters.budget_min))
      }
      if (filters.budget_max) {
        query = query.lte('budget_max', Number(filters.budget_max))
      }

      const { data, error } = await query

      if (error) {
        console.error('[Tenders] Ошибка загрузки тендеров:', error)
        setError('Ошибка загрузки тендеров')
        return
      }

      console.log('[Tenders] Тендеры загружены:', data?.length || 0)
      setTenders(data || [])
    } catch (error) {
      console.error('[Tenders] Ошибка:', error)
      setError('Произошла ошибка при загрузке тендеров')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    loadTenders()
  }

  // Не рендерим ничего до монтирования на клиенте
  if (!mounted) {
    return null
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Тендеры</h1>
          <p className="text-gray-600 mt-1">Найдите подходящие проекты для вашего бизнеса</p>
        </div>
        <Link 
          href="/tenders/create" 
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Создать тендер
        </Link>
      </div>
      
      {/* Фильтры */}
      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-lg font-medium mb-4">Фильтры</h2>
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Категория
            </label>
            <select 
              id="category" 
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Все категории</option>
              <option value="construction">Строительство</option>
              <option value="renovation">Ремонт</option>
              <option value="design">Дизайн</option>
              <option value="engineering">Инженерные работы</option>
              <option value="landscaping">Благоустройство</option>
              <option value="other">Другое</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Местоположение
            </label>
            <input 
              type="text" 
              id="location" 
              name="location" 
              value={filters.location}
              onChange={handleFilterChange}
              placeholder="Город или регион"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="budget_min" className="block text-sm font-medium text-gray-700 mb-1">
              Бюджет от (₽)
            </label>
            <input 
              type="number" 
              id="budget_min" 
              name="budget_min"
              value={filters.budget_min}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Минимальный бюджет"
            />
          </div>
          
          <div>
            <label htmlFor="budget_max" className="block text-sm font-medium text-gray-700 mb-1">
              Бюджет до (₽)
            </label>
            <input 
              type="number" 
              id="budget_max" 
              name="budget_max"
              value={filters.budget_max}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Максимальный бюджет"
            />
          </div>
          
          <div className="md:col-span-2 lg:col-span-4 flex justify-end">
            <button 
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Загрузка...' : 'Применить фильтры'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Результаты */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true)
              loadTenders()
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Попробовать снова
          </button>
        </div>
      ) : tenders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Тендеры не найдены</h3>
          <p className="text-gray-500 mb-6">
            Попробуйте изменить параметры поиска или создайте свой первый тендер
          </p>
          <Link
            href="/tenders/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
          >
            <span>Создать тендер</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenders.map((tender) => (
            <Link 
              href={`/tenders/${tender.id}`} 
              key={tender.id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-semibold text-gray-900 flex-1 mr-2">{tender.title}</h3>
              </div>
              
              <p className="text-gray-600 mb-4 line-clamp-3">{tender.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-green-600">
                    {tender.budget_min && tender.budget_max
                      ? `${tender.budget_min.toLocaleString()} - ${tender.budget_max.toLocaleString()} ₽`
                      : tender.budget_min
                      ? `от ${tender.budget_min.toLocaleString()} ₽`
                      : tender.budget_max
                      ? `до ${tender.budget_max.toLocaleString()} ₽`
                      : 'Бюджет не указан'}
                  </span>
                </div>
                
                {tender.deadline && (
                  <div className="text-sm text-gray-500">
                    Срок: {new Date(tender.deadline).toLocaleDateString('ru-RU')}
                  </div>
                )}
                
                {tender.location && (
                  <div className="text-sm text-gray-500">
                    📍 {tender.location}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}