'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase, getCurrentUser, followCompany, unfollowCompany, isFollowingCompany, getRegions } from '@/lib/supabase'
import { Heart, HeartOff, Building2, Globe, MapPin, Search } from 'lucide-react'
import SEOHead from '@/components/SEO/SEOHead'
import { generateCompaniesSEO } from '@/lib/seo'

interface Company {
  id: string
  name: string
  description: string
  type: string
  website: string
  logo_url: string
  created_at: string
  region_id: number
  regions?: {
    id: number
    name: string
  }
}

interface Region {
  id: number
  name: string
}

interface FilterState {
  search: string
  region_id: string
  specialization: string
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
          .select(`
            *,
            regions (
              id,
              name
            )
          `)
          .order('name')

        // Применяем фильтры
        if (filters.search) {
          query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
        }
        
        if (filters.region_id) {
          query = query.eq('region_id', parseInt(filters.region_id))
        }

        if (filters.specialization) {
          query = query.ilike('description', `%${filters.specialization}%`)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse" suppressHydrationWarning>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden" suppressHydrationWarning>
            <div className="h-40 bg-gray-200" suppressHydrationWarning></div>
            <div className="p-4" suppressHydrationWarning>
              <div className="flex items-center mb-2" suppressHydrationWarning>
                <div className="h-10 w-10 rounded-full bg-gray-200 mr-3" suppressHydrationWarning></div>
                <div className="h-4 bg-gray-200 rounded w-1/2" suppressHydrationWarning></div>
              </div>
              <div className="h-4 bg-gray-200 rounded mb-2" suppressHydrationWarning></div>
              <div className="h-4 bg-gray-200 rounded w-3/4" suppressHydrationWarning></div>
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
        <Link key={company.id} href={`/companies/${company.id}`}>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
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
                    <p className="text-sm text-gray-600 capitalize">{getCompanyTypeText(company.type)}</p>
                    {company.regions && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {company.regions.name}
                      </div>
                    )}
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{company.description}</p>

            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {company.website && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(company.website, '_blank', 'noopener,noreferrer')
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                    title="Перейти на сайт компании"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {new Date(company.created_at).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>
        </Link>
      ))}
    </div>
  )
}

function getCompanyTypeText(type: string): string {
  const types: Record<string, string> = {
    'contractor': 'Подрядчик',
    'supplier': 'Поставщик',
    'both': 'Подрядчик и поставщик'
  }
  return types[type] || type
}

// Компонент фильтрации
function CompaniesFilter({ filters, onFiltersChange }: { 
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void 
}) {
  const [regions, setRegions] = useState<Region[]>([])
  const [loadingRegions, setLoadingRegions] = useState(true)

  useEffect(() => {
    async function loadRegions() {
      try {
        const { data, error } = await getRegions()

        if (error) {
          console.error('Ошибка загрузки регионов:', error)
        } else {
          setRegions(data || [])
        }
      } catch (error) {
        console.error('Ошибка загрузки регионов:', error)
      } finally {
        setLoadingRegions(false)
      }
    }

    loadRegions()
  }, [])

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      region_id: '',
      specialization: ''
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6" suppressHydrationWarning>
      <div className="flex justify-between items-center mb-4" suppressHydrationWarning>
        <h2 className="text-lg font-semibold text-gray-900">Фильтры</h2>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Очистить все
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" suppressHydrationWarning>
        {/* Поиск по названию */}
        <div suppressHydrationWarning>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Поиск по названию
          </label>
          <div className="relative" suppressHydrationWarning>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Введите название компании..."
              className="w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Регион */}
        <div suppressHydrationWarning>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Регион
          </label>
          <select
            value={filters.region_id}
            onChange={(e) => handleFilterChange('region_id', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            disabled={loadingRegions}
          >
            <option value="">Все регионы</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>

        {/* Поиск по специализации */}
        <div suppressHydrationWarning>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Специализация
          </label>
          <input
            type="text"
            value={filters.specialization}
            onChange={(e) => handleFilterChange('specialization', e.target.value)}
            placeholder="Например: полимерные полы, кровля..."
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
    region_id: '',
    specialization: ''
  })

  const companiesSEO = generateCompaniesSEO()

  return (
    <>
      <SEOHead structuredData={undefined} />
      <main className="container mx-auto px-4 py-8">
      <div className="mb-8" suppressHydrationWarning>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Компании</h1>
        <p className="text-gray-600">Найдите надежных подрядчиков и поставщиков для ваших проектов</p>
      </div>

      <div className="flex justify-between items-center mb-6" suppressHydrationWarning>
        <div suppressHydrationWarning></div>
        <Link 
          href="/companies/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Создать компанию
        </Link>
      </div>

      <CompaniesFilter filters={filters} onFiltersChange={setFilters} />
      <CompanyList filters={filters} />
    </main>
    </>
  )
}