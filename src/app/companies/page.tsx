'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getCurrentUser, followCompany, unfollowCompany, isFollowingCompany } from '@/lib/supabase'
import { Heart, HeartOff, Building2, Globe } from 'lucide-react'

interface Company {
  id: string
  name: string
  description: string
  type: string
  city: string
  website: string
  logo_url: string
  location: string
  created_at: string
}

interface FilterState {
  search: string
  city: string
}

// Компонент для отображения списка компаний
function CompanyList({ filters }: { filters: FilterState }) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [followedCompanies, setFollowedCompanies] = useState<Set<string>>(new Set())
  const [followingInProgress, setFollowingInProgress] = useState<Set<string>>(new Set())
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const loadUser = async () => {
      const { user } = await getCurrentUser()
      setCurrentUser(user)
    }
    loadUser()
  }, [])

  useEffect(() => {
    async function loadCompanies() {
      setLoading(true)
      setError(null)
      
      try {
        let query = supabase
          .from('companies')
          .select('*')
          .order('name')

        // Применяем фильтры
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
        }
        
        if (filters.city) {
          query = query.ilike('location', `%${filters.city}%`)
        }

        const { data, error } = await query
        
        if (error) {
          setError(error.message)
        } else {
          setCompanies(data || [])
          
          // Загружаем информацию о подписках пользователя
          if (currentUser && data?.length) {
            const followingPromises = data.map(company => 
              isFollowingCompany(company.id)
            )
            const followingResults = await Promise.all(followingPromises)
            const followed = new Set<string>()
            
            followingResults.forEach((result, index) => {
              if (result.data) {
                followed.add(data[index].id)
              }
            })
            
            setFollowedCompanies(followed)
          }
        }
      } catch {
        setError('Произошла ошибка при загрузке компаний')
      } finally {
        setLoading(false)
      }
    }

    loadCompanies()
  }, [filters, currentUser])

  const handleFollowToggle = async (companyId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!currentUser) {
      alert('Войдите в систему, чтобы добавлять компании в избранное')
      return
    }

    setFollowingInProgress(prev => new Set(prev).add(companyId))
    
    try {
      const isFollowing = followedCompanies.has(companyId)
      
      if (isFollowing) {
        const { error } = await unfollowCompany(companyId)
        if (error) throw error
        
        setFollowedCompanies(prev => {
          const newSet = new Set(prev)
          newSet.delete(companyId)
          return newSet
        })
      } else {
        const { error } = await followCompany(companyId)
        if (error) throw error
        
        setFollowedCompanies(prev => new Set(prev).add(companyId))
      }
    } catch (err: unknown) {
      const error = err as Error
      alert('Ошибка: ' + error.message)
    } finally {
      setFollowingInProgress(prev => {
        const newSet = new Set(prev)
        newSet.delete(companyId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="h-40 bg-gray-200"></div>
            <div className="p-4">
              <div className="flex items-center mb-2">
                <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">Ошибка загрузки компаний: {error}</div>
  }

  if (!companies || companies.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl text-gray-300 mb-4">🏢</div>
        <h2 className="text-xl font-semibold text-gray-700">Компании не найдены</h2>
        <p className="text-gray-500 mt-2">Попробуйте изменить фильтры поиска</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {companies.map((company) => (
        <div key={company.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700" />
            
            {/* Favorite button */}
            <button
              onClick={(e) => handleFollowToggle(company.id, e)}
              disabled={followingInProgress.has(company.id)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
            >
              {followedCompanies.has(company.id) ? (
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              ) : (
                <Heart className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>

          <div className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-12 h-12 rounded-lg object-cover mr-3"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                    <Building2 className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{company.name}</h3>
                  <p className="text-sm text-gray-600">{company.type}</p>
                  <p className="text-sm text-gray-500">{company.location}</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{company.description}</p>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(company.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function getEmployeeCountText(count: number): string {
  if (count === 1) return 'сотрудник'
  if (count >= 2 && count <= 4) return 'сотрудника'
  return 'сотрудников'
}

// Утилита для получения читабельного названия отрасли
function getIndustryName(industry: string): string {
  const industries: Record<string, string> = {
    'construction': 'Строительство',
    'architecture': 'Архитектура',
    'design': 'Дизайн',
    'engineering': 'Инженерия',
    'renovation': 'Ремонт',
    'landscaping': 'Ландшафтный дизайн',
    'real_estate': 'Недвижимость',
    'consulting': 'Консалтинг',
    'manufacturing': 'Производство',
    'logistics': 'Логистика',
    'other': 'Другое'
  }
  return industries[industry] || industry
}

// Компонент фильтрации
function CompaniesFilter({ filters, onFiltersChange }: { 
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void 
}) {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      city: ''
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Очистить все
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Поиск */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Поиск по названию
          </label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Введите название компании..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        {/* Город */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Город
          </label>
          <input
            type="text"
            value={filters.city}
            onChange={(e) => handleFilterChange('city', e.target.value)}
            placeholder="Введите город..."
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}

export default function CompaniesPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    city: ''
  })

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Компании</h1>
        <p className="text-gray-600">Найдите надежных подрядчиков и поставщиков для ваших проектов</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div></div>
        <Link 
          href="/companies/edit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Создать компанию
        </Link>
      </div>

      <CompaniesFilter filters={filters} onFiltersChange={setFilters} />
      <CompanyList filters={filters} />
    </main>
  )
}