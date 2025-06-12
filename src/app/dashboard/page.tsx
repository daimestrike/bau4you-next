'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
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
  }, [])

  const loadUserData = async () => {
    try {
      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
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
      await loadStats(user.id)

    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async (userId: string) => {
    try {
      // Загружаем проекты
      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Загружаем тендеры
      const { data: tenders } = await supabase
        .from('tenders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Загружаем товары
      const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Загружаем компании
      const { data: companies } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })

      setStats({
        projects: projects || [],
        tenders: tenders || [],
        products: products || [],
        companies: companies || [],
        applications: []
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
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Настроить профиль
          </Link>
        </div>
      )
    }

    switch (profile.role) {
      case 'client':
        return <ClientDashboard user={user} profile={profile} stats={stats} />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
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
                  className="inline-flex items-center px-4 py-2 glass-card hover-glass rounded-xl text-sm font-medium text-gray-700 transition-all duration-300 hover:scale-105"
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
        {renderRoleBasedDashboard()}
      </div>
    </div>
  )
} 