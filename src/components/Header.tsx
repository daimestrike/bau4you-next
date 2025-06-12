'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { supabase, signOut } from '@/lib/supabase'
import type { User } from '@supabase/auth-js'
import { 
  Bars3Icon, 
  XMarkIcon,
  UserIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface Profile {
  id: string
  name_first: string
  name_last: string
  role: string
  avatar_url?: string
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  
  const router = useRouter()
  const pathname = usePathname()

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Фикс гидратации
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    let isMounted = true
    
    // Получаем текущего пользователя
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!isMounted) return
        
        setUser(user)
        
        if (user) {
          // Загружаем профиль пользователя
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (isMounted && profile) {
            setProfile(profile)
          }
        }
      } catch (error) {
        console.error('[Header] Error loading user:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    getUser()

    // Подписываемся на изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return
      
      if (session?.user) {
        setUser(session.user)
        
        // Загружаем профиль
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (isMounted && profile) {
          setProfile(profile)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      
      if (isMounted) {
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [mounted])

  // Предотвращаем рендеринг до монтирования на клиенте
  if (!mounted) {
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setProfile(null)
    setIsUserMenuOpen(false)
    router.push('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const navigation = [
    { name: 'Главная', href: '/' },
    { name: 'Поиск', href: '/search' },
    { name: 'Тендеры', href: '/tenders' },
    { name: 'Материалы', href: '/products' },
    { name: 'Компании', href: '/companies' },
    ...(user ? [
      { name: 'Проекты', href: '/projects' }
    ] : [])
  ]

  // Быстрые действия для создания контента
  const getQuickActions = () => {
    if (!profile?.role) return []
    
    const actions = []
    
    if (profile.role === 'client') {
      actions.push(
        { name: 'Создать тендер', href: '/tenders/create', icon: 'plus', color: 'green' },
        { name: 'Новый проект', href: '/projects/create', icon: 'plus', color: 'blue' }
      )
    }
    
    if (profile.role === 'contractor') {
      actions.push(
        { name: 'Найти тендеры', href: '/tenders', icon: 'search', color: 'blue' }
      )
    }
    
    if (profile.role === 'supplier') {
      actions.push(
        { name: 'Добавить товар', href: '/products/create', icon: 'plus', color: 'purple' },
        { name: 'Мои товары', href: '/products/manage', icon: 'list', color: 'blue' }
      )
    }
    
    return actions
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
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

  const getInitials = () => {
    if (profile?.name_first && profile?.name_last) {
      return `${profile.name_first.charAt(0)}${profile.name_last.charAt(0)}`.toUpperCase()
    }
    if (profile?.name_first) {
      return profile.name_first.charAt(0).toUpperCase()
    }
    return (user?.email || 'U').charAt(0).toUpperCase()
  }

  return (
    <>
      {/* Spacer для fixed header */}
      <div className="h-20"></div>
      
      {/* Header */}
      <header className={`fixed top-4 left-4 right-4 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'header-scrolled bg-white/80' 
          : 'header-floating bg-white/70'
      } rounded-2xl border border-white/20 shadow-2xl`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Логотип */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Bau4You
                </span>
              </Link>
            </div>

            {/* Навигация для десктопа */}
            <nav className="hidden lg:flex space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50/80 shadow-md'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
                  }`}
                >
                  {item.name}
                  {isActive(item.href) && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl"></div>
                  )}
                </Link>
              ))}
            </nav>

            {/* Поисковая строка */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch} className="w-full relative group">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Поиск тендеров, товаров, компаний..."
                    className="w-full pl-4 pr-12 py-3 bg-white/60 border border-white/30 rounded-xl 
                             focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 focus:bg-white/80
                             text-sm placeholder-gray-500 backdrop-blur-sm transition-all duration-300
                             group-hover:bg-white/70"
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 
                             text-gray-400 hover:text-blue-600 transition-colors duration-300
                             hover:bg-blue-50 rounded-lg"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Пользовательское меню */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 
                             transition-all duration-300 p-2 rounded-xl hover:bg-white/50 group"
                  >
                    <div className="relative">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={getDisplayName()} 
                          className="h-9 w-9 rounded-xl object-cover shadow-md group-hover:shadow-lg transition-shadow duration-300"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 
                                      flex items-center justify-center shadow-md group-hover:shadow-lg 
                                      transition-shadow duration-300">
                          <span className="text-white font-medium text-sm">
                            {getInitials()}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium block">
                        {getDisplayName()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {profile?.role === 'client' ? 'Заказчик' :
                         profile?.role === 'contractor' ? 'Исполнитель' :
                         profile?.role === 'supplier' ? 'Поставщик' : 
                         profile?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                      </span>
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white/90 backdrop-blur-xl rounded-2xl 
                                  shadow-2xl border border-white/20 py-2 z-50 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-gray-50/80"></div>
                      
                      <div className="relative px-4 py-3 border-b border-gray-100/50">
                        <div className="text-sm text-gray-600">{user.email}</div>
                        {profile?.role && (
                          <div className="inline-flex items-center px-2 py-1 bg-blue-50/80 text-blue-600 text-xs rounded-lg mt-1">
                            {profile.role === 'client' ? 'Заказчик' :
                             profile.role === 'contractor' ? 'Исполнитель' :
                             profile.role === 'supplier' ? 'Поставщик' : 
                             profile.role === 'admin' ? 'Администратор' : profile.role}
                          </div>
                        )}
                      </div>
                      
                      {/* Быстрые действия в меню */}
                      {getQuickActions().length > 0 && (
                        <>
                          <div className="relative px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                            Быстрые действия
                          </div>
                          {getQuickActions().map((action, index) => (
                            <Link
                              key={index}
                              href={action.href}
                              className="relative flex items-center px-4 py-2.5 text-sm text-gray-700 
                                       hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 
                                       transition-all duration-300 group"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <PlusIcon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                              {action.name}
                            </Link>
                          ))}
                          <div className="relative border-t border-gray-100/50 my-2"></div>
                        </>
                      )}
                      
                      <Link
                        href="/dashboard"
                        className="relative flex items-center px-4 py-2.5 text-sm text-gray-700 
                                 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 
                                 transition-all duration-300 group"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ChartBarIcon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                        Dashboard
                      </Link>
                      
                      <Link
                        href="/projects"
                        className="relative flex items-center px-4 py-2.5 text-sm text-gray-700 
                                 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 
                                 transition-all duration-300 group"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ClipboardDocumentListIcon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                        Мои проекты
                      </Link>
                      
                      <div className="relative border-t border-gray-100/50 my-2"></div>
                      
                      <Link
                        href="/profile"
                        className="relative flex items-center px-4 py-2.5 text-sm text-gray-700 
                                 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 
                                 transition-all duration-300 group"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <UserIcon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                        Профиль
                      </Link>
                      
                      <Link
                        href="/profile/edit"
                        className="relative flex items-center px-4 py-2.5 text-sm text-gray-700 
                                 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 
                                 transition-all duration-300 group"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="h-4 w-4 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                        Настройки профиля
                      </Link>
                      
                      <div className="relative border-t border-gray-100/50 my-2"></div>
                      
                      <button
                        onClick={handleSignOut}
                        className="relative flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 
                                 hover:bg-gradient-to-r hover:from-red-50/50 hover:to-pink-50/50 
                                 transition-all duration-300 group"
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3 text-red-400 group-hover:text-red-600 transition-colors duration-300" />
                        Выйти
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium 
                             transition-all duration-300 rounded-xl hover:bg-white/50"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2.5 
                             rounded-xl text-sm font-medium hover:from-blue-600 hover:to-purple-700 
                             transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Регистрация
                  </Link>
                </div>
              )}
            </div>

            {/* Мобильное меню */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-300 p-2 rounded-xl hover:bg-white/50"
              >
                {isMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Мобильная навигация */}
          {isMenuOpen && (
            <div className="md:hidden border-t border-white/20 py-4 mt-4">
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-4 py-3 text-base font-medium transition-all duration-300 rounded-xl ${
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50/80'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-white/50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                {user ? (
                  <div className="border-t border-white/20 pt-4 mt-4">
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {user.email}
                      {profile?.role && (
                        <div className="text-blue-600 capitalize mt-1">
                          {profile.role === 'client' ? 'Заказчик' :
                           profile.role === 'contractor' ? 'Исполнитель' :
                           profile.role === 'supplier' ? 'Поставщик' : 
                           profile.role === 'admin' ? 'Администратор' : profile.role}
                        </div>
                      )}
                    </div>
                    
                    <Link
                      href="/profile"
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 
                               hover:bg-white/50 transition-all duration-300 rounded-xl"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Профиль
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-3 text-base font-medium text-red-600 
                               hover:bg-red-50/50 transition-all duration-300 rounded-xl"
                    >
                      Выйти
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-white/20 pt-4 mt-4 space-y-2">
                    <Link
                      href="/login"
                      className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 
                               hover:bg-white/50 transition-all duration-300 rounded-xl"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Войти
                    </Link>
                    <Link
                      href="/register"
                      className="block px-4 py-3 text-base font-medium bg-gradient-to-r from-blue-500 to-purple-600 
                               text-white rounded-xl hover:from-blue-600 hover:to-purple-700 
                               transition-all duration-300 mx-4"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Регистрация
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
        
        {/* Закрытие выпадающих меню при клике вне их */}
        {(isUserMenuOpen || isMenuOpen) && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setIsUserMenuOpen(false)
              setIsMenuOpen(false)
            }}
          />
        )}
      </header>
    </>
  )
}