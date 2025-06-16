'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCurrentUser, getProfile, supabase, signOut, getUserCompanies } from '@/lib/supabase'
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Edit,
  LogOut,
  Calendar,
  Briefcase
} from 'lucide-react'

interface ProfileData {
  id: string
  email: string
  name_first?: string
  name_last?: string
  company_name?: string
  phone?: string
  website?: string
  country?: string
  city?: string
  street_address?: string
  description?: string
  headline?: string
  role: 'contractor' | 'client' | 'supplier'
  years_experience?: number
  created_at: string
}

interface CompanyData {
  id: string
  name: string
  description?: string
  type?: string
  website?: string
  address?: string
  city?: string
  phone?: string
  email?: string
  industry?: string
  founded_year?: number
  employee_count?: number
  services?: string[]
  specializations?: string[]
}

function ProfileDetails() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [company, setCompany] = useState<CompanyData | null>(null)
  const [employeeCompanies, setEmployeeCompanies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { user, error: authError } = await getCurrentUser()
        if (authError || !user) {
          router.push('/login')
          return
        }

        const { data: profileData, error: profileError } = await getProfile(user.id)
        if (profileError) {
          throw profileError
        }

        setProfile(profileData)

        // Загружаем информацию о компании
        try {
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', user.id)
          .single()

          if (companyError) {
            if (companyError.code !== 'PGRST116') {
          console.error('Error loading company:', companyError)
            }
            // Если компании нет (PGRST116) или другая ошибка - просто не устанавливаем компанию
        } else if (companyData) {
          setCompany(companyData)
          }
        } catch (companyErr) {
          console.error('Exception loading company:', companyErr)
          // Игнорируем ошибку и продолжаем без компании
        }

        // Загружаем компании, где пользователь является сотрудником
        try {
          const { data: employeeCompaniesData, error: employeeError } = await getUserCompanies(user.id)
          if (employeeError) {
            console.error('Error loading employee companies:', employeeError)
          } else if (employeeCompaniesData) {
            setEmployeeCompanies(employeeCompaniesData)
          }
        } catch (employeeErr) {
          console.error('Exception loading employee companies:', employeeErr)
        }

      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Ошибка при загрузке профиля')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start space-x-6">
              <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <p className="text-gray-500">Профиль не найден</p>
        </div>
      </main>
    )
  }

  // Проверяем, заполнен ли профиль
  const isProfileIncomplete = !profile.name_first && !profile.name_last && !profile.phone && !profile.company_name
  
  if (isProfileIncomplete) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-yellow-800 mb-4">
              Завершите настройку профиля
            </h2>
            <p className="text-yellow-700 mb-6">
              Ваш профиль не заполнен. Пожалуйста, добавьте основную информацию о себе.
            </p>
            <Link 
              href="/profile/edit" 
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Заполнить профиль
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const fullName = `${profile.name_first || ''} ${profile.name_last || ''}`.trim() || 'Пользователь'
  const location = [profile.city, profile.country].filter(Boolean).join(', ')

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        {/* Шапка профиля */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                {fullName.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                {profile.headline && (
                  <p className="text-lg text-gray-700 mt-1">{profile.headline}</p>
                )}
                {profile.company_name && (
                  <div className="flex items-center mt-2 text-gray-600">
                    <Building2 className="w-4 h-4 mr-2" />
                    <span>{profile.company_name}</span>
                  </div>
                )}
                {location && (
                  <div className="flex items-center mt-1 text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{location}</span>
                  </div>
                )}
                <div className="flex items-center mt-1 text-gray-600">
                  <Briefcase className="w-4 h-4 mr-2" />
                  <span>
                    {profile.role === 'client' && 'Заказчик'}
                    {profile.role === 'contractor' && 'Исполнитель'}
                    {profile.role === 'supplier' && 'Поставщик'}
                  </span>
                  {profile.years_experience && profile.years_experience > 0 && (
                    <span className="ml-2">• {profile.years_experience} лет опыта</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Link 
                href="/profile/edit" 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Редактировать
              </Link>
              <button
                onClick={handleSignOut}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </button>
            </div>
          </div>

          {profile.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">О себе</h2>
              <p className="text-gray-700">{profile.description}</p>
            </div>
          )}
        </div>

        {/* Контактная информация */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Контактная информация</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-3" />
              <span>{profile.email}</span>
            </div>
            
            {profile.phone && (
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-3" />
                <span>{profile.phone}</span>
              </div>
            )}
            
            {profile.website && (
              <div className="flex items-center text-gray-600">
                <Globe className="w-5 h-5 mr-3" />
                <a 
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {profile.website}
                </a>
              </div>
            )}

            {profile.street_address && (
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-3" />
                <span>{profile.street_address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Информация о компании */}
        {company && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                Профиль компании
              </h2>
              <Link
                href="/companies/edit"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                <Edit className="w-4 h-4 mr-1" />
                Редактировать
              </Link>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{company.name}</h3>
                {company.industry && (
                  <p className="text-gray-600">{company.industry}</p>
                )}
              </div>

              {company.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Описание</h4>
                  <p className="text-gray-700">{company.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.type && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Тип:</span>
                    <p className="text-gray-700">
                      {company.type === 'contractor' && 'Подрядчик'}
                      {company.type === 'supplier' && 'Поставщик'}
                      {company.type === 'both' && 'Подрядчик и поставщик'}
                    </p>
                  </div>
                )}

                {company.founded_year && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Год основания:</span>
                    <p className="text-gray-700">{company.founded_year}</p>
                  </div>
                )}

                {company.employee_count && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Сотрудников:</span>
                    <p className="text-gray-700">{company.employee_count}</p>
                  </div>
                )}

                {company.city && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Город:</span>
                    <p className="text-gray-700">{company.city}</p>
                  </div>
                )}
              </div>

              {company.services && company.services.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Услуги</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.services.map((service, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {company.specializations && company.specializations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Специализации</h4>
                  <div className="flex flex-wrap gap-2">
                    {company.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Призыв к созданию профиля компании */}
        {!company && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Создайте профиль компании
            </h3>
            <p className="text-blue-700 mb-4">
              Детальный профиль компании поможет привлечь больше клиентов и повысить доверие
            </p>
            <Link
              href="/companies/edit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Создать профиль компании
            </Link>
          </div>
        )}

        {/* Компании, где пользователь является сотрудником */}
        {employeeCompanies.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
              <Briefcase className="w-5 h-5 mr-2 text-green-600" />
              Работаю в компаниях
            </h2>
            
            <div className="space-y-4">
              {employeeCompanies.map((employeeCompany) => (
                <div key={employeeCompany.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {employeeCompany.companies.logo_url ? (
                          <img
                            src={employeeCompany.companies.logo_url}
                            alt={employeeCompany.companies.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <Link
                          href={`/companies/${employeeCompany.companies.id}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {employeeCompany.companies.name}
                        </Link>
                        
                        <div className="mt-1 space-y-1">
                          {employeeCompany.position && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Должность:</span> {employeeCompany.position}
                            </p>
                          )}
                          
                          {employeeCompany.companies.type && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Тип:</span> {
                                employeeCompany.companies.type === 'contractor' ? 'Подрядчик' :
                                employeeCompany.companies.type === 'supplier' ? 'Поставщик' :
                                employeeCompany.companies.type === 'both' ? 'Подрядчик и поставщик' :
                                employeeCompany.companies.type
                              }
                            </p>
                          )}
                          
                          {employeeCompany.companies.location && (
                            <p className="text-sm text-gray-600">
                              <MapPin className="w-4 h-4 inline mr-1" />
                              {employeeCompany.companies.location}
                            </p>
                          )}
                          
                          {employeeCompany.is_key_person && (
                            <span className="inline-block mt-1 bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded">
                              Ключевой сотрудник
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Дата регистрации */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            <span>Зарегистрирован: {new Date(profile.created_at).toLocaleDateString('ru-RU')}</span>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ProfilePage() {
  return <ProfileDetails />
}