'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCurrentUser, supabase, followCompany, unfollowCompany } from '@/lib/supabase'
import { 
  Star, 
  Building2, 
  Phone, 
  Mail, 
  MapPin,
  Globe,
  Heart,
  HeartOff,
  MessageSquare,
  Send
} from 'lucide-react'

interface Company {
  id: string
  name: string
  description: string
  type: string
  industry: string
  city: string
  email: string
  website: string
  logo_url: string
  services: string[]
  verified: boolean
  created_at: string
}

export default function FavoritesPage() {
  const [favoriteCompanies, setFavoriteCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unfollowingIds, setUnfollowingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const { user, error: authError } = await getCurrentUser()
        if (authError || !user) {
          setError('Необходимо войти в систему')
          return
        }

        // Получаем избранные компании пользователя
        const { data: followersData, error: followersError } = await supabase
          .from('company_followers')
          .select(`
            company_id,
            companies (
              id,
              name,
              description,
              type,
              industry,
              city,
              email,
              website,
              logo_url,
              services,
              verified,
              created_at
            )
          `)
          .eq('user_id', user.id)

        if (followersError) {
          throw followersError
        }

        const companies = followersData?.map(item => item.companies).filter(Boolean) || []
        setFavoriteCompanies(companies as any[])
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Ошибка при загрузке избранных компаний')
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [])

  const handleUnfollow = async (companyId: string) => {
    setUnfollowingIds(prev => new Set(prev).add(companyId))
    
    try {
      const { error } = await unfollowCompany(companyId)
      if (error) throw error

      setFavoriteCompanies(prev => prev.filter(company => company.id !== companyId))
    } catch (err: unknown) {
      const error = err as Error
      alert('Ошибка при удалении из избранного: ' + error.message)
    } finally {
      setUnfollowingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(companyId)
        return newSet
      })
    }
  }

  const handleSendMessage = (companyId: string) => {
    // Переход к странице отправки сообщения
    window.location.href = `/messages/new?company=${companyId}`
  }

  const handleSendApplication = (companyId: string) => {
    // Переход к странице отправки заявки
    window.location.href = `/applications/new?company=${companyId}`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 text-xl mb-4">❌ {error}</div>
          <Link 
            href="/login"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Войти в систему
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Избранные компании</h1>
          <p className="text-gray-600 mt-2">
            Управляйте списком ваших избранных партнеров и подрядчиков
          </p>
        </div>
        <Link
          href="/companies"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Найти компании
        </Link>
      </div>

      {favoriteCompanies.length === 0 ? (
        <div className="text-center py-12">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            У вас пока нет избранных компаний
          </h2>
          <p className="text-gray-500 mb-6">
            Добавьте компании в избранное, чтобы легко находить их и взаимодействовать с ними
          </p>
          <Link
            href="/companies"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Найти компании
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 text-gray-600">
            Найдено: <span className="font-semibold">{favoriteCompanies.length}</span> избранных компаний
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                {/* Заголовок карточки */}
                <div className="p-6 border-b">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        {company.logo_url ? (
                          <img 
                            src={company.logo_url} 
                            alt={company.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {company.name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            company.type === 'contractor' ? 'bg-blue-100 text-blue-800' :
                            company.type === 'supplier' ? 'bg-green-100 text-green-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {company.type === 'contractor' ? 'Подрядчик' :
                             company.type === 'supplier' ? 'Поставщик' : 'Подрядчик и поставщик'}
                          </span>
                          {company.verified && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">
                              ✓ Проверено
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnfollow(company.id)}
                      disabled={unfollowingIds.has(company.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Убрать из избранного"
                    >
                      {unfollowingIds.has(company.id) ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <HeartOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Информация о компании */}
                <div className="p-6">
                  {company.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {company.description}
                    </p>
                  )}

                  {/* Контактная информация */}
                  <div className="space-y-2 mb-4">
                    {company.city && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {company.city}
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <a href={`mailto:${company.email}`} className="hover:text-blue-600">
                          {company.email}
                        </a>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="w-4 h-4 mr-2" />
                        <a 
                          href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-600"
                        >
                          {company.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Услуги */}
                  {company.services && company.services.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {company.services.slice(0, 3).map((service, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded-full"
                          >
                            {service}
                          </span>
                        ))}
                        {company.services.length > 3 && (
                          <span className="text-gray-500 text-xs px-2 py-1">
                            +{company.services.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Действия */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSendMessage(company.id)}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Написать
                    </button>
                    <button
                      onClick={() => handleSendApplication(company.id)}
                      className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Заявка
                    </button>
                    <Link
                      href={`/companies/${company.id}`}
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Профиль
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
} 