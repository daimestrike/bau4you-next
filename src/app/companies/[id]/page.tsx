'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getCompany, getCompanyPortfolio, getCompanyProducts, getCompanyReviews, getCompanyTeam, getCompanyAchievements, getCompanyUpdates, isFollowingCompany, followCompany, unfollowCompany, addCompanyReview, getCurrentUser } from '@/lib/supabase'
import SEOHead from '@/components/SEO/SEOHead'
import { generateCompanySEO, generateBreadcrumbSchema } from '@/lib/seo'

interface Company {
  id: string
  name: string
  description: string
  industry: string
  type: string
  email: string
  website: string
  logo_url: string
  cover_image: string
  founded_year: number
  employee_count: number
  verified: boolean
  created_at: string
  owner_id: string
  rating?: number
  reviews_count?: number
  mission_statement?: string
  vision_statement?: string
  values?: string[]
  specializations?: string[]
  address?: string
  phone?: string
  social_links?: Record<string, string>
  region_id?: number
  regions?: { id: number; name: string }
}

export default function CompanyPage() {
  const { id } = useParams()
  const [company, setCompany] = useState<Company | null>(null)
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [team, setTeam] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [updates, setUpdates] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    review_text: '',
    pros: '',
    cons: '',
    work_quality_rating: 5,
    communication_rating: 5,
    deadline_rating: 5,
    price_rating: 5
  })

  // Отслеживаем изменения isOwner
  useEffect(() => {
    console.log('🔄 isOwner изменился на:', isOwner)
  }, [isOwner])

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        // Загружаем текущего пользователя и компанию параллельно
        const [userResult, companyResult] = await Promise.all([
          getCurrentUser(),
          getCompany(id as string)
        ])
        
        console.log('👤 Результат getCurrentUser:', userResult)
        console.log('🏢 Результат getCompany:', companyResult)
        
        if (userResult.user) {
          setCurrentUser(userResult.user)
          console.log('👤 Установлен текущий пользователь:', userResult.user.id)
        }
        
        if (companyResult.data) {
          console.log('🏢 Загружена компания:', companyResult.data.name)
          console.log('🖼️ Logo URL:', companyResult.data.logo_url || 'не установлен')
          console.log('🎨 Cover Image:', companyResult.data.cover_image || 'не установлен')
          console.log('📋 Полные данные компании:', companyResult.data)
          console.log('🔑 Owner ID компании:', companyResult.data.owner_id)
          
          setCompany(companyResult.data)
          
          // Проверяем, является ли текущий пользователь владельцем компании
          const userId = userResult.user?.id
          const ownerId = companyResult.data.owner_id
          const isUserOwner = userId && ownerId && userId === ownerId
          
          console.log('🔍 Проверка владельца:')
          console.log('👤 User ID:', userId)
          console.log('🏢 Owner ID:', ownerId)
          console.log('✅ isUserOwner:', isUserOwner)
          
          setIsOwner(!!isUserOwner)
          
          if (isUserOwner) {
            console.log('✅ Пользователь является владельцем компании')
          } else {
            console.log('❌ Пользователь НЕ является владельцем компании')
          }
        }
        
        // Загружаем портфолио компании
        try {
          const portfolioResult = await getCompanyPortfolio(id as string)
          if (portfolioResult.data) {
            setPortfolio(portfolioResult.data)
          }
        } catch (error) {
          console.error('Error loading portfolio:', error)
          setPortfolio([])
        }

        // Загружаем товары компании (только для поставщиков)
        if (companyResult.data && (companyResult.data.type === 'supplier' || companyResult.data.type === 'both')) {
          try {
            const productsResult = await getCompanyProducts(id as string)
            if (productsResult.data) {
              setProducts(productsResult.data)
            }
          } catch (error) {
            console.error('Error loading products:', error)
            setProducts([])
          }
        }
        
        // Проверяем статус подписки
        if (userResult.user) {
          try {
            const followResult = await isFollowingCompany(id as string)
            if (followResult.data !== undefined) {
              setIsFollowing(followResult.data)
            }
          } catch (error) {
            console.error('Error checking follow status:', error)
            setIsFollowing(false)
          }
        }
        
        // Остальные данные пока не загружаем (таблицы не созданы)
        setReviews([])
        setTeam([])
        setAchievements([])
        setUpdates([])
        
      } catch (error) {
        console.error('Error fetching company data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        const result = await unfollowCompany(id as string)
        if (!result.error) {
          setIsFollowing(false)
        } else {
          console.error('Error unfollowing company:', result.error)
        }
      } else {
        const result = await followCompany(id as string)
        if (!result.error) {
          setIsFollowing(true)
        } else {
          console.error('Error following company:', result.error)
        }
      }
    } catch (error) {
      console.error('Error following company:', error)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Временно отключаем функционал отзывов
      // TODO: Добавить таблицу company_reviews в схему БД
      console.log('Review functionality temporarily disabled')
      setShowReviewForm(false)
      /*
      await addCompanyReview({
        company_id: id as string,
        ...reviewData
      })
      setShowReviewForm(false)
      // Refresh reviews
      const reviewsResult = await getCompanyReviews(id as string)
      if (reviewsResult.data) setReviews(reviewsResult.data)
      */
    } catch (error) {
      console.error('Error submitting review:', error)
    }
  }

  const handleRemoveTeamMember = async (teamMemberId: string, memberName: string) => {
    console.log('Team member removal functionality temporarily disabled')
    // Функция временно отключена - требует исправления импорта
  }

  const handleLeaveTeam = async () => {
    console.log('Leave team functionality temporarily disabled')
    // Функция временно отключена - требует исправления импорта
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" suppressHydrationWarning>
        <div className="animate-pulse space-y-4" suppressHydrationWarning>
          <div className="h-64 bg-gray-200 rounded" suppressHydrationWarning></div>
          <div className="h-8 bg-gray-200 rounded w-1/3" suppressHydrationWarning></div>
          <div className="h-32 bg-gray-200 rounded" suppressHydrationWarning></div>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Компания не найдена</h1>
        </div>
      </div>
    )
  }

  // Генерируем SEO данные
  const companySEO = company ? generateCompanySEO(company) : null
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Главная', url: '/' },
    { name: 'Компании', url: '/companies' },
    { name: company?.name || 'Компания', url: `/companies/${id}` }
  ])

  return (
    <>
      {companySEO && (
                 <SEOHead 
           structuredData={breadcrumbSchema} 
         />
      )}
      <div className="min-h-screen bg-gray-50" suppressHydrationWarning>
      {/* Обложка и основная информация */}
      <div className="bg-white">
        {/* Обложка */}
        <div className="h-64 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
          {(() => {
            console.log('🎨 Проверка обложки в JSX:', {
              hasCoverImage: !!company.cover_image,
              coverImageUrl: company.cover_image,
              companyName: company.name
            })
            return null
          })()}
          {company.cover_image && (
            <img
              src={company.cover_image}
              alt={company.name}
              className="w-full h-full object-cover"
              onLoad={() => console.log('✅ Обложка загружена успешно')}
              onError={(e) => console.error('❌ Ошибка загрузки обложки:', e)}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-blue-600/30"></div>
        </div>

        {/* Название компании под обложкой */}
        <div className="container mx-auto px-4 py-4 border-b border-gray-200" suppressHydrationWarning>
          <div className="flex items-center justify-between">
            {/* Отступ слева равный ширине логотипа (w-32) + отступ (mr-6) */}
            <div className="flex items-center ml-32 md:ml-38">
              <h1 className="text-3xl font-bold text-gray-900 mr-3">
                {company.name}
              </h1>
              {company.verified && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-full">
                  ✓ Проверено
                </span>
              )}
            </div>
            
            {/* Кнопки действий */}
            <div className="flex space-x-3">
              <button
                onClick={handleFollow}
                className={`px-8 py-3 rounded-lg font-medium transition-colors cursor-pointer min-w-[140px] ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                style={{
                  minHeight: '44px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  touchAction: 'manipulation'
                }}
              >
                {isFollowing ? 'Отписаться' : 'Подписаться'}
              </button>

              {(() => {
                console.log('🔍 Проверка отображения кнопки редактирования:')
                console.log('isOwner:', isOwner)
                console.log('currentUser?.id:', currentUser?.id)
                console.log('company?.owner_id:', company?.owner_id)
                console.log('Равенство ID:', currentUser?.id === company?.owner_id)
                
                // Дополнительная проверка на всякий случай
                const shouldShowEditButton = isOwner || (currentUser?.id && company?.owner_id && currentUser.id === company.owner_id)
                console.log('shouldShowEditButton:', shouldShowEditButton)
                
                if (shouldShowEditButton) {
                  console.log('✅ Показываем кнопку редактирования')
                  return (
                    <Link
                      href={`/companies/${id}/edit`}
                      className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer font-medium min-w-[140px] text-center"
                      onClick={(e) => {
                        console.log('🔗 Клик по кнопке редактирования')
                        console.log('🔗 Переходим на:', `/companies/${id}/edit`)
                      }}
                      style={{ 
                        minHeight: '44px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        touchAction: 'manipulation'
                      }}
                    >
                      Редактировать
                    </Link>
                  )
                } else {
                  console.log('❌ Не показываем кнопку редактирования')
                  return null
                }
              })()}
            </div>
          </div>
        </div>

        {/* Профиль компании */}
        <div className="container mx-auto px-4 py-6" suppressHydrationWarning>
          <div className="flex flex-col md:flex-row items-start md:items-end -mt-20 relative z-10">
            {/* Логотип */}
            <div className="w-32 h-32 bg-white rounded-lg shadow-lg flex items-center justify-center overflow-hidden mb-4 md:mb-0 md:mr-6">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-gray-500">
                  {company.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* Информация о компании */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-end justify-between">
                <div className="mt-4">
                  <p className="text-lg text-gray-600 mb-2">
                    {company.type === 'supplier' ? 'Поставщик' : 
                     company.type === 'contractor' ? 'Подрядчик' : 
                     company.type === 'both' ? 'Подрядчик и поставщик' : 
                     company.industry}
                  </p>
                  <div className="flex items-center text-gray-500 space-x-4">
                    {company.regions?.name && <span>{company.regions.name}</span>}
                    {company.employee_count && <span>• {company.employee_count} человек</span>}
                    {company.founded_year && <span>• С {company.founded_year}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Навигация по табам */}
      <div className="bg-white border-b sticky top-0 z-40" suppressHydrationWarning>
        <div className="container mx-auto px-4" suppressHydrationWarning>
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Обзор' },
              ...(company.type === 'supplier' || company.type === 'both' ? [{ id: 'shop', label: `Магазин${products.length > 0 ? ` (${products.length})` : ''}` }] : []),
              { id: 'portfolio', label: 'Портфолио' },
              { id: 'team', label: 'Команда' },
              { id: 'reviews', label: 'Отзывы' },
              { id: 'about', label: 'О компании' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Контент */}
      <div className="container mx-auto px-4 py-8" suppressHydrationWarning>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основной контент */}
          <div className="lg:col-span-2">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Описание */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">О компании</h2>
                  <p className="text-gray-700 leading-relaxed">{company.description}</p>
                </div>

                {/* Специализации */}
                {company.specializations && company.specializations.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Специализации</h2>
                    <div className="flex flex-wrap gap-2">
                      {company.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Последние обновления */}
                {updates.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Последние обновления</h2>
                    <div className="space-y-4">
                      {updates.slice(0, 3).map((update: any) => (
                        <div key={update.id} className="border-b border-gray-100 pb-4 last:border-0">
                          <h3 className="font-medium text-gray-900">{update.title}</h3>
                          <p className="text-gray-600 mt-1">{update.content}</p>
                          <p className="text-sm text-gray-500 mt-2">
                            {new Date(update.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'shop' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Магазин товаров</h2>
                  {isOwner && (
                    <Link
                      href="/products/create"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Добавить товар
                    </Link>
                  )}
                </div>

                {/* Фильтр по категориям */}
                {products.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory('')}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedCategory === ''
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Все ({products.length})
                      </button>
                      {Array.from(new Set(products.map(p => p.category))).map(category => {
                        const categoryProducts = products.filter(p => p.category === category)
                        const categoryNames: Record<string, string> = {
                          building_materials: 'Строительные материалы',
                          tools: 'Инструменты',
                          equipment: 'Оборудование',
                          plumbing: 'Сантехника',
                          electrical: 'Электрика',
                          finishing_materials: 'Отделочные материалы',
                          furniture: 'Мебель',
                          other: 'Другое'
                        }
                        return (
                          <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                              selectedCategory === category
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {categoryNames[category] || category} ({categoryProducts.length})
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products
                      .filter(product => selectedCategory === '' || product.category === selectedCategory)
                      .map((product: any) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="group border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        {/* Изображение товара */}
                        <div className="aspect-square bg-gray-100 relative overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                          
                          {/* Статус наличия */}
                          <div className="absolute top-2 right-2">
                            {(product.stock_quantity || 0) > 0 ? (
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                                В наличии
                              </span>
                            ) : (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                                Нет в наличии
                              </span>
                            )}
                          </div>
                          
                          {/* Скидка */}
                          {product.discount && (
                            <div className="absolute top-2 left-2">
                              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                                -{product.discount}%
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Информация о товаре */}
                        <div className="p-4">
                          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {product.description}
                          </p>
                          
                          {/* Цена */}
                          <div className="flex items-baseline gap-2">
                            {product.discount ? (
                              <>
                                <span className="text-lg font-bold text-red-600">
                                  {new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'RUB',
                                    minimumFractionDigits: 0
                                  }).format(product.price - (product.price * product.discount / 100))}
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {new Intl.NumberFormat('ru-RU', {
                                    style: 'currency',
                                    currency: 'RUB',
                                    minimumFractionDigits: 0
                                  }).format(product.price)}
                                </span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">
                                {new Intl.NumberFormat('ru-RU', {
                                  style: 'currency',
                                  currency: 'RUB',
                                  minimumFractionDigits: 0
                                }).format(product.price)}
                              </span>
                            )}
                          </div>
                          
                          {/* Категория */}
                          <div className="mt-2">
                            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {(() => {
                                const categories: Record<string, string> = {
                                  building_materials: 'Строительные материалы',
                                  tools: 'Инструменты',
                                  equipment: 'Оборудование',
                                  plumbing: 'Сантехника',
                                  electrical: 'Электрика',
                                  finishing_materials: 'Отделочные материалы',
                                  furniture: 'Мебель',
                                  other: 'Другое'
                                }
                                return categories[product.category] || product.category
                              })()}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Магазин пуст</h3>
                      <p className="text-gray-500 mb-4">
                        {isOwner 
                          ? 'Добавьте первый товар в ваш магазин' 
                          : 'В магазине этой компании пока нет товаров'
                        }
                      </p>
                      {isOwner && (
                        <Link
                          href="/products/create"
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Добавить товар
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'portfolio' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Портфолио проектов</h2>
                  <div className="flex space-x-3">
                    {portfolio.length > 0 && (
                      <Link
                        href={`/companies/${id}/portfolio`}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Просмотреть все ({portfolio.length})
                      </Link>
                    )}
                    {isOwner && (
                      <Link
                        href={`/companies/${id}/portfolio/add`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Добавить проект
                      </Link>
                    )}
                  </div>
                </div>
                
                {portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {portfolio.slice(0, 4).map((project: any) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        {project.images && project.images.length > 0 && (
                          <img
                            src={project.images[0]}
                            alt={project.title}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          {project.featured && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-full ml-2">
                              Рекомендуемый
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                          <span>{project.category}</span>
                          <span>{project.location}</span>
                        </div>
                        {project.start_date && project.end_date && (
                          <div className="text-sm text-gray-500 mb-2">
                            {new Date(project.start_date).toLocaleDateString('ru-RU')} - {new Date(project.end_date).toLocaleDateString('ru-RU')}
                          </div>
                        )}
                        {project.project_value && (
                          <p className="text-green-600 font-medium">
                            {project.project_value.toLocaleString('ru-RU')} ₽
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="max-w-md mx-auto">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Портфолио пусто</h3>
                      <p className="text-gray-500 mb-4">Здесь будут отображаться проекты компании</p>
                      {isOwner && (
                        <Link
                          href={`/companies/${id}/portfolio/add`}
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Добавить первый проект
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'team' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Команда</h2>
                  <Link
                    href={`/companies/${id}/team/add`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Добавить сотрудника
                  </Link>
                </div>
                
                {team.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.map((member: any) => (
                      <div key={member.id} className="text-center p-4 border border-gray-200 rounded-lg relative">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {member.avatar_url ? (
                            <img
                              src={member.avatar_url}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xl font-medium text-gray-500">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.position}</p>
                        {member.bio && (
                          <p className="text-xs text-gray-500 mt-1">{member.bio}</p>
                        )}
                        {member.is_key_person && (
                          <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded">
                            Ключевой сотрудник
                          </span>
                        )}
                        
                        {/* Кнопки действий */}
                        <div className="mt-3 space-y-2">
                          {isOwner && (
                            <button
                              onClick={() => handleRemoveTeamMember(member.id, member.name)}
                              className="w-full text-xs px-2 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors"
                            >
                              Удалить
                            </button>
                          )}
                          {currentUser && member.user_id === currentUser.id && !isOwner && (
                            <button
                              onClick={() => handleLeaveTeam()}
                              className="w-full text-xs px-2 py-1 text-orange-600 border border-orange-300 rounded hover:bg-orange-50 transition-colors"
                            >
                              Покинуть команду
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Команда не указана</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Отзывы</h2>
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Оставить отзыв
                    </button>
                  </div>

                  {/* Статистика отзывов */}
                  {(company.reviews_count || 0) > 0 && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <span className="text-3xl font-bold mr-2">{(company.rating || 0).toFixed(1)}</span>
                            <div className="flex items-center">
                              {renderStars(Math.round(company.rating || 0))}
                            </div>
                          </div>
                          <p className="text-gray-600">{company.reviews_count} отзывов</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Список отзывов */}
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                              {review.profiles?.avatar_url ? (
                                <img
                                  src={review.profiles.avatar_url}
                                  alt={`${review.profiles.name_first || ''} ${review.profiles.name_last || ''}`.trim() || 'Пользователь'}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-gray-500">
                                  {(review.profiles?.name_first || 'П').charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">{`${review.profiles?.name_first || ''} ${review.profiles?.name_last || ''}`.trim() || 'Пользователь'}</h4>
                                <div className="flex items-center">
                                  {renderStars(review.rating)}
                                  <span className="ml-2 text-sm text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString('ru-RU')}
                                  </span>
                                </div>
                              </div>
                              {review.title && (
                                <h5 className="font-medium text-gray-900 mt-1">{review.title}</h5>
                              )}
                              {review.review_text && (
                                <p className="text-gray-700 mt-2">{review.review_text}</p>
                              )}
                              {review.pros && (
                                <div className="mt-2">
                                  <span className="text-green-600 font-medium">Плюсы: </span>
                                  <span className="text-gray-700">{review.pros}</span>
                                </div>
                              )}
                              {review.cons && (
                                <div className="mt-1">
                                  <span className="text-red-600 font-medium">Минусы: </span>
                                  <span className="text-gray-700">{review.cons}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Отзывов пока нет</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* Миссия и видение */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-4">Миссия и видение</h2>
                  {company.mission_statement && (
                    <div className="mb-4">
                      <h3 className="font-medium text-gray-900 mb-2">Миссия</h3>
                      <p className="text-gray-700">{company.mission_statement}</p>
                    </div>
                  )}
                  {company.vision_statement && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Видение</h3>
                      <p className="text-gray-700">{company.vision_statement}</p>
                    </div>
                  )}
                </div>

                {/* Ценности */}
                {company.values && company.values.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Ценности</h2>
                    <ul className="space-y-2">
                      {company.values.map((value, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                          {value}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Специализации */}
                {company.specializations && company.specializations.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Специализации</h2>
                    <div className="flex flex-wrap gap-2">
                      {company.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Достижения */}
                {achievements.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Достижения и награды</h2>
                    <div className="space-y-4">
                      {achievements.map((achievement: any) => (
                        <div key={achievement.id} className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            🏆
                          </div>
                          <div>
                            <h3 className="font-medium">{achievement.title}</h3>
                            <p className="text-gray-600">{achievement.description}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              {achievement.issuer && <span>{achievement.issuer}</span>}
                              {achievement.date_received && (
                                <span className="ml-2">
                                  {new Date(achievement.date_received).toLocaleDateString('ru-RU')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Контактная информация */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Контакты</h3>
              <div className="space-y-3">
                {company.address && (
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-700">{company.address}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${company.phone}`} className="text-blue-600 hover:text-blue-800">
                      {company.phone}
                    </a>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${company.email}`} className="text-blue-600 hover:text-blue-800">
                      {company.email}
                    </a>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                    </svg>
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Социальные сети */}
            {company.social_links && Object.values(company.social_links).some(link => link) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Социальные сети</h3>
                <div className="space-y-2">
                  {company.social_links.linkedin && (
                    <a
                      href={company.social_links.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      LinkedIn
                    </a>
                  )}
                  {company.social_links.facebook && (
                    <a
                      href={company.social_links.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      Facebook
                    </a>
                  )}
                  {company.social_links.instagram && (
                    <a
                      href={company.social_links.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      Instagram
                    </a>
                  )}
                  {company.social_links.youtube && (
                    <a
                      href={company.social_links.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      YouTube
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Статистика */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Статистика</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Проектов в портфолио:</span>
                  <span className="font-medium">{portfolio.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Отзывы:</span>
                  <span className="font-medium">{company.reviews_count || 0}</span>
                </div>
                {company.founded_year && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Опыт работы:</span>
                    <span className="font-medium">{new Date().getFullYear() - company.founded_year} лет</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно для отзыва */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-gradient-to-br from-white/80 to-blue-100/90 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Оставить отзыв</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Общая оценка *
                </label>
                <select
                  value={reviewData.rating}
                  onChange={(e) => setReviewData({...reviewData, rating: Number(e.target.value)})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  {[5, 4, 3, 2, 1].map(num => (
                    <option key={num} value={num}>{num} звезд</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Заголовок отзыва
                </label>
                <input
                  type="text"
                  value={reviewData.title}
                  onChange={(e) => setReviewData({...reviewData, title: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Отзыв
                </label>
                <textarea
                  rows={4}
                  value={reviewData.review_text}
                  onChange={(e) => setReviewData({...reviewData, review_text: e.target.value})}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Отправить отзыв
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  )
}