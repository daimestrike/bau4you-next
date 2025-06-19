'use client'

import { useState, useEffect } from 'react'
import { supabase, getSupplierCartStats, getSupplierOrders, getCurrentUser } from '@/lib/supabase'
import { User } from 'lucide-react'
import Link from 'next/link'
import ClientDashboard from '@/components/dashboard/ClientDashboard'
import ContractorDashboard from '@/components/dashboard/ContractorDashboard'
import SupplierDashboard from '@/components/dashboard/SupplierDashboard'


export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<{
    projects: any[]
    tenders: any[]
    products: any[]
    companies: any[]
    applications: any[]
    quotations?: any[]
    inquiries?: any[]
    orders?: any[]
    sales?: any[]
    cartStats?: {
      total_in_carts: number
      unique_users: number
      items: any[]
    }
    regionalProjects?: any[]
    partnerships?: {
      followedCompanies: number
      followers: number
    }
  }>({
    projects: [],
    tenders: [],
    products: [],
    companies: [],
    applications: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, []) // Убираем зависимости, чтобы избежать бесконечных перерендеров
  
  useEffect(() => {
    // Обновляем данные при фокусе на окне только если пользователь загружен
    const handleFocus = () => {
      if (user && profile) {
        refreshPartnershipsData()
      }
    }
    
    if (user && profile) {
      window.addEventListener('focus', handleFocus)
      
      return () => {
        window.removeEventListener('focus', handleFocus)
      }
    }
  }, [user?.id, profile?.id]) // Используем только ID для избежания лишних перерендеров

  const loadUserData = async () => {
    try {
      // Получаем текущего пользователя
      const { user, error: authError } = await getCurrentUser()
      
      if (authError || !user) {
        window.location.href = '/login'
        return
      }

      setUser(user)

      // Загружаем профиль пользователя
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setProfile(profile)
      }

      // Загружаем статистику
      await loadStats(user.id, profile)

    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshPartnershipsData = async () => {
    if (!user) return
    
    try {
      const partnershipsData = { followedCompanies: 0, followers: 0 }
      
      // Количество компаний, на которые подписан пользователь
      const { data: followedData, error: followedError } = await supabase
        .from('company_followers')
        .select('id')
        .eq('user_id', user.id)
      
      if (!followedError) {
        partnershipsData.followedCompanies = followedData?.length || 0
      }
      
      // Количество подписчиков на компании пользователя
      if (stats.companies.length > 0) {
        const companyIds = stats.companies.map(c => c.id)
        const { data: followersData, error: followersError } = await supabase
          .from('company_followers')
          .select('id')
          .in('company_id', companyIds)
        
        if (!followersError) {
          partnershipsData.followers = followersData?.length || 0
        }
      }
      
      setStats(prev => ({
        ...prev,
        partnerships: partnershipsData
      }))
    } catch (error) {
      console.error('Error refreshing partnerships data:', error)
    }
  }

  const loadStats = async (userId: string, userProfile?: any) => {
    try {
      // Загружаем проекты (используем owner_id согласно схеме БД)
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })

      if (projectsError) {
        console.error('Error loading projects:', projectsError)
      }

      // Загружаем тендеры (используем client_id согласно схеме БД)
      const { data: tenders, error: tendersError } = await supabase
        .from('tenders')
        .select('*')
        .eq('client_id', userId)
        .order('created_at', { ascending: false })

      if (tendersError) {
        console.error('Error loading tenders:', tendersError)
      }

      // Загружаем товары (используем seller_id согласно схеме БД)
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', userId)
        .order('created_at', { ascending: false })

      if (productsError) {
        console.error('Error loading products:', productsError)
      }

      // Загружаем компании пользователя (используем owner_id согласно схеме БД)
      let companies = []
      try {
        const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false })

      if (companiesError) {
        console.error('Error loading companies:', companiesError)
        } else {
          companies = companiesData || []
        }
      } catch (companiesErr) {
        console.error('Exception loading companies:', companiesErr)
        companies = []
      }

      // Загружаем заявки для подрядчика
      let applications = []
      let regionalProjects = []
      
      if (userProfile?.role === 'contractor') {
        try {
          // Загружаем заявки подрядчика на тендеры
          let tenderApplicationsData = []
          let tenderApplicationsError = null
          
          try {
            // Сначала пробуем простой запрос без JOIN
            const { data, error } = await supabase
              .from('applications')
              .select('*')
              .eq('contractor_id', userId)
              .order('created_at', { ascending: false })
            
            if (error && error.code === 'PGRST116') {
              // Таблица не существует
              // Applications table does not exist, skipping
              tenderApplicationsData = []
              tenderApplicationsError = null
            } else if (error) {
              console.error('Error fetching applications:', error)
              tenderApplicationsData = []
              tenderApplicationsError = error
            } else {
              tenderApplicationsData = data || []
              tenderApplicationsError = null
            }
          } catch (error) {
            console.error('Applications table might not exist:', error)
            // Если таблица applications не существует, просто игнорируем
            tenderApplicationsData = []
            tenderApplicationsError = null
          }

          let tenderApplications = []
          if (tenderApplicationsError) {
            console.error('Error loading tender applications:', tenderApplicationsError)
          } else {
            tenderApplications = (tenderApplicationsData || []).map(app => ({
              ...app,
              type: 'tender',
              title: `Заявка на тендер ${app.tender_id ? app.tender_id.substring(0, 8) : ''}`,
              description: app.proposal || 'Заявка на тендер',
              budget: 0
            }))
          }

          // Сначала получаем компании пользователя
          const { data: userCompanies, error: companiesError } = await supabase
            .from('companies')
            .select('id')
            .eq('owner_id', userId)

          let projectApplications = []
          if (companiesError) {
            console.error('Error loading user companies:', companiesError)
          } else if (userCompanies && userCompanies.length > 0) {
            const companyIds = userCompanies.map(c => c.id)
            
            // Загружаем заявки подрядчика на проекты от всех его компаний
            const { data: projectApplicationsData, error: projectApplicationsError } = await supabase
              .from('project_applications')
              .select(`
                *,
                projects(
                  id,
                  name,
                  description,
                  budget,
                  location,
                  deadline,
                  category,
                  owner_id
                ),
                companies(
                  id,
                  name,
                  type,
                  description,
                  location,
                  website,
                  phone,
                  email
                )
              `)
              .in('company_id', companyIds) // Загружаем заявки от всех компаний пользователя
              .order('created_at', { ascending: false })

            if (projectApplicationsError) {
              console.error('Error loading project applications:', projectApplicationsError)
              // Если таблица не существует, просто игнорируем
              if (projectApplicationsError.code !== '42P01') {
                console.error('Unexpected error:', projectApplicationsError)
              }
            } else {
              projectApplications = (projectApplicationsData || []).map(app => ({
                ...app,
                type: 'project',
                title: app.projects?.name || 'Проект',
                description: app.projects?.description || '',
                budget: app.projects?.budget || 0,
                // Приводим к единому формату с tender applications
                proposal: app.description || '',
                tender_id: app.project_id,
                tenders: {
                  id: app.projects?.id,
                  title: app.projects?.name,
                  description: app.projects?.description,
                  budget: app.projects?.budget,
                  location: app.projects?.location,
                  deadline: app.projects?.deadline,
                  category: app.projects?.category,
                  client_id: app.projects?.owner_id
                }
              }))
            }
          }

          // Объединяем все заявки
          applications = [...tenderApplications, ...projectApplications]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

          // Загружаем проекты из региона пользователя
          if (userProfile.region_id) {
            const { data: regionalProjectsData, error: regionalError } = await supabase
              .from('projects')
              .select('*')
              .eq('region_id', userProfile.region_id)
              .neq('owner_id', userId) // Исключаем собственные проекты
              .order('created_at', { ascending: false })
              .limit(5)

            if (regionalError) {
              console.error('Error loading regional projects:', regionalError)
            } else {
              regionalProjects = regionalProjectsData || []
            }
          }
        } catch (error) {
          console.error('Error loading contractor data:', error)
        }
      }

      // Загружаем дополнительные данные для поставщиков
      let cartStats = undefined
      let supplierOrders = []
      
      if (userProfile?.role === 'supplier') {
        try {
          // Loading supplier cart stats
          const { data: cartData, error: cartError } = await getSupplierCartStats()
          // Cart stats loaded
          cartStats = cartData
          
          const { data: ordersData, error: ordersError } = await getSupplierOrders()
          // Orders loaded
          supplierOrders = ordersData || []
        } catch (error) {
          console.error('Error loading supplier stats:', error)
        }
      }

      // Загружаем данные partnerships
      const partnershipsData = { followedCompanies: 0, followers: 0 }
      try {
        // Количество компаний, на которые подписан пользователь
        const { data: followedData, error: followedError } = await supabase
          .from('company_followers')
          .select('id')
          .eq('user_id', userId)
        
        if (!followedError) {
          partnershipsData.followedCompanies = followedData?.length || 0
        }
        
        // Количество подписчиков на компании пользователя
        if (companies.length > 0) {
          const companyIds = companies.map(c => c.id)
          const { data: followersData, error: followersError } = await supabase
            .from('company_followers')
            .select('id')
            .in('company_id', companyIds)
          
          if (!followersError) {
            partnershipsData.followers = followersData?.length || 0
          }
        }
      } catch (error) {
        console.error('Error loading partnerships data:', error)
      }

      setStats({
        projects: projects || [],
        tenders: tenders || [],
        products: products || [],
        companies: companies,
        applications: applications,
        orders: supplierOrders,
        cartStats: cartStats || undefined,
        regionalProjects: regionalProjects,
        partnerships: partnershipsData
      })

    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const renderRoleBasedDashboard = () => {
    if (!profile?.role) {
      return (
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Добро пожаловать!</h3>
          <p className="text-gray-600 mb-6">
            Пожалуйста, завершите настройку профиля, чтобы получить доступ к персонализированному дашборду.
          </p>
          <Link 
            href="/profile/edit" 
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg"
          >
            Настроить профиль
          </Link>
        </div>
      )
    }

    switch (profile.role) {
      case 'client':
        return <ClientDashboard user={user} profile={profile} stats={stats} onPartnershipsUpdate={refreshPartnershipsData} />
      case 'contractor':
        return <ContractorDashboard user={user} profile={profile} stats={stats} />
      case 'supplier':
        return <SupplierDashboard user={user} profile={profile} stats={stats} />
      default:
        return (
          <div className="glass-card rounded-2xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Неизвестная роль</h3>
            <p className="text-gray-600">
              Пожалуйста, обратитесь к администратору для настройки вашей роли.
            </p>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка дашборда...</p>
        </div>
      </div>
    )
  }

  const getDisplayName = () => {
    if (profile?.name_first && profile?.name_last) {
      return `${profile.name_first} ${profile.name_last}`
    }
    if (profile?.name_first) {
      return profile.name_first
    }
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Пользователь'
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

  const isProfileIncomplete = () => {
    return !profile?.name_first && !profile?.name_last && !profile?.phone && !profile?.company_name
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden" suppressHydrationWarning>
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
        </div>

        {/* Header */}
        <div className="relative z-10 pt-24 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="glass-card rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Дашборд
                    </h1>
                    <p className="text-gray-600 mt-1">
                      Добро пожаловать, {getDisplayName()}!
                      <span className="ml-3 inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-sm rounded-full border border-blue-200/50">
                        {getRoleDisplayName()}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/profile" 
                    className="inline-flex items-center px-4 py-2 glass-card rounded-xl text-sm font-medium text-gray-700"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Профиль
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          {/* Profile completion notification */}
          {isProfileIncomplete() && (
            <div className="mb-8">
              <div className="glass-card rounded-2xl p-6 border-l-4 border-yellow-400 bg-gradient-to-r from-yellow-50/80 to-orange-50/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Завершите настройку профиля
                      </h3>
                      <p className="text-gray-600 mt-1">
                        Добавьте основную информацию о себе для лучшего взаимодействия с другими пользователями
                      </p>
                    </div>
                  </div>
                  <Link 
                    href="/profile/edit" 
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-medium shadow-lg"
                  >
                    Заполнить
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {renderRoleBasedDashboard()}
        </div>
      </div>
  )
}