'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { 
  UserIcon, 
  EnvelopeIcon, 
  BuildingOfficeIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

interface ProfilePageProps {
  params: Promise<{
    id: string
  }>
}

interface Profile {
  id: string
  email: string
  name_first?: string
  name_last?: string
  company_name?: string
  phone?: string
  avatar_url?: string
  role: string
  created_at: string
}

interface Company {
  id: string
  name: string
  description?: string
  type: string
  website?: string
  logo_url?: string
  address?: string
  location?: string
  phone?: string
  email?: string
  created_at: string
}

interface Project {
  id: string
  name: string
  description: string
  category?: string
  location?: string
  budget?: number
  status: string
  created_at: string
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const { id } = await params

        // Получаем профиль
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single()

        if (profileError) {
          setError('Профиль не найден')
          return
        }

        setProfile(profileData)

        // Получаем компании пользователя
        const { data: companiesData, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', id)
          .order('created_at', { ascending: false })

        if (!companiesError) {
          setCompanies(companiesData || [])
        }

        // Получаем проекты пользователя (только активные и завершенные)
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, name, description, category, location, budget, status, created_at')
          .eq('owner_id', id)
          .in('status', ['active', 'completed'])
          .order('created_at', { ascending: false })
          .limit(5)

        if (!projectsError) {
          setProjects(projectsData || [])
        }

      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Ошибка загрузки профиля')
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [params])

  const getDisplayName = () => {
    if (!profile) return 'Пользователь'
    
    if (profile.name_first && profile.name_last) {
      return `${profile.name_first} ${profile.name_last}`
    }
    if (profile.name_first) {
      return profile.name_first
    }
    return profile.email.split('@')[0]
  }

  const getRoleDisplayName = () => {
    switch (profile?.role) {
      case 'client': return 'Заказчик'
      case 'contractor': return 'Исполнитель'
      case 'supplier': return 'Поставщик'
      case 'admin': return 'Администратор'
      default: return 'Пользователь'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Профиль не найден</h3>
            <p className="text-gray-500 mb-6">{error || 'Профиль не существует или был удален'}</p>
            <Link
              href="/"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Профиль пользователя</h1>
            <p className="text-gray-600">Информация о пользователе и его деятельности</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={getDisplayName()}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <UserIcon className="h-12 w-12 text-white" />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{getDisplayName()}</h2>
                <span className="px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-sm rounded-full border border-blue-200/50">
                  {getRoleDisplayName()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{profile.email}</span>
                </div>

                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">📞</span>
                    <span className="text-gray-700">{profile.phone}</span>
                  </div>
                )}

                {profile.company_name && (
                  <div className="flex items-center gap-3">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">{profile.company_name}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Регистрация: {formatDate(profile.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Companies */}
        {companies.length > 0 && (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Компании</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {companies.map((company) => (
                <div key={company.id} className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {company.logo_url ? (
                        <img 
                          src={company.logo_url} 
                          alt={company.name}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <BuildingOfficeIcon className="h-6 w-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{company.name}</h4>
                      <p className="text-sm text-gray-600 capitalize mb-2">{company.type}</p>
                      {company.description && (
                        <p className="text-sm text-gray-700 line-clamp-2">{company.description}</p>
                      )}
                      {company.location && (
                        <div className="flex items-center gap-1 mt-2">
                          <MapPinIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{company.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Projects */}
        {projects.length > 0 && (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Недавние проекты</h3>
            <div className="space-y-4">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/30 hover:bg-white/70 transition-colors"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {project.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status === 'active' ? 'Активный' :
                       project.status === 'completed' ? 'Завершен' :
                       project.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">{project.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      {project.category && (
                        <span>{project.category}</span>
                      )}
                      {project.location && (
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="h-4 w-4" />
                          <span>{project.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {project.budget && (
                        <span className="font-medium text-green-600">
                          {formatCurrency(project.budget)}
                        </span>
                      )}
                      <span>{formatDate(project.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {projects.length === 5 && (
              <div className="text-center mt-6">
                <Link
                  href="/projects"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Посмотреть все проекты →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* No content message */}
        {companies.length === 0 && projects.length === 0 && (
          <div className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="text-center py-8">
              <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Пока нет активности</h3>
              <p className="text-gray-600">У пользователя пока нет публичных проектов или компаний</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 