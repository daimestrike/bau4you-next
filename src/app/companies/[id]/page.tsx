'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getCompany, getCompanyPortfolio, getCompanyReviews, getCompanyTeam, getCompanyAchievements, getCompanyUpdates, isFollowingCompany, followCompany, unfollowCompany, addCompanyReview } from '@/lib/supabase'

interface Company {
  id: string
  name: string
  description: string
  industry: string
  city: string
  email: string
  website: string
  logo_url: string
  cover_image: string
  founding_year: number
  employee_count: number
  services: string[]
  verified: boolean
  created_at: string
  rating?: number
  reviews_count?: number
  mission_statement?: string
}

export default function CompanyPage() {
  const { id } = useParams()
  const [company, setCompany] = useState<Company | null>(null)
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [team, setTeam] = useState<any[]>([])
  const [achievements, setAchievements] = useState<any[]>([])
  const [updates, setUpdates] = useState<any[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
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

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        const [
          companyResult,
          portfolioResult,
          reviewsResult,
          teamResult,
          achievementsResult,
          updatesResult,
          followingResult
        ] = await Promise.all([
          getCompany(id as string),
          getCompanyPortfolio(id as string),
          getCompanyReviews(id as string),
          getCompanyTeam(id as string),
          getCompanyAchievements(id as string),
          getCompanyUpdates(id as string),
          isFollowingCompany(id as string)
        ])

        if (companyResult.data) setCompany(companyResult.data)
        if (portfolioResult.data) setPortfolio(portfolioResult.data)
        if (reviewsResult.data) setReviews(reviewsResult.data)
        if (teamResult.data) setTeam(teamResult.data)
        if (achievementsResult.data) setAchievements(achievementsResult.data)
        if (updatesResult.data) setUpdates(updatesResult.data)
        if (followingResult.data !== undefined) setIsFollowing(followingResult.data)
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
        await unfollowCompany(id as string)
        setIsFollowing(false)
      } else {
        await followCompany(id as string)
        setIsFollowing(true)
      }
    } catch (error) {
      console.error('Error following company:', error)
    }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addCompanyReview({
        company_id: id as string,
        ...reviewData
      })
      setShowReviewForm(false)
      // Refresh reviews
      const reviewsResult = await getCompanyReviews(id as string)
      if (reviewsResult.data) setReviews(reviewsResult.data)
    } catch (error) {
      console.error('Error submitting review:', error)
    }
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
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Обложка и основная информация */}
      <div className="bg-white">
        {/* Обложка */}
        <div className="h-64 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
          {company.cover_image && (
            <img
              src={company.cover_image}
              alt={company.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        </div>

        {/* Профиль компании */}
        <div className="container mx-auto px-4 py-6">
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
                <div>
                  <div className="flex items-center mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 mr-3">
                      {company.name}
                    </h1>
                    {company.verified && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 text-sm rounded-full">
                        ✓ Проверено
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-gray-600 mb-2">{company.industry}</p>
                  <div className="flex items-center text-gray-500 space-x-4">
                    <span>{company.city}</span>
                    {company.employee_count && <span>• {company.employee_count} человек</span>}
                    {company.founding_year && <span>• С {company.founding_year}</span>}
                  </div>

                </div>

                {/* Кнопки действий */}
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <button
                    onClick={handleFollow}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isFollowing ? 'Отписаться' : 'Подписаться'}
                  </button>
                  <Link
                    href={`/companies/${id}/edit`}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Редактировать
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Навигация по табам */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Обзор' },
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
      <div className="container mx-auto px-4 py-8">
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

                {/* Услуги */}
                {company.services && company.services.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold mb-4">Услуги</h2>
                    <div className="flex flex-wrap gap-2">
                      {company.services.map((service, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {service}
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

            {activeTab === 'portfolio' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Портфолио проектов</h2>
                  <Link
                    href={`/companies/${id}/portfolio/add`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Добавить проект
                  </Link>
                </div>
                
                {portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {portfolio.map((project: any) => (
                      <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                        {project.images && project.images.length > 0 && (
                          <img
                            src={project.images[0]}
                            alt={project.title}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <h3 className="font-semibold text-lg mb-2">{project.title}</h3>
                        <p className="text-gray-600 mb-2">{project.description}</p>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>{project.category}</span>
                          <span>{project.location}</span>
                        </div>
                        {project.project_value && (
                          <p className="text-green-600 font-medium mt-2">
                            {project.project_value.toLocaleString('ru-RU')} ₽
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Портфолио пусто</p>
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
                      <div key={member.id} className="text-center p-4 border border-gray-200 rounded-lg">
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
                        {member.is_key_person && (
                          <span className="inline-block mt-2 bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded">
                            Ключевой сотрудник
                          </span>
                        )}
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
                  {company.reviews_count > 0 && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <span className="text-3xl font-bold mr-2">{company.rating.toFixed(1)}</span>
                            <div className="flex items-center">
                              {renderStars(Math.round(company.rating))}
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
                  <span className="text-gray-600">Команда:</span>
                  <span className="font-medium">{team.length} человек</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Отзывы:</span>
                  <span className="font-medium">{company.reviews_count}</span>
                </div>
                {company.founding_year && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Опыт работы:</span>
                    <span className="font-medium">{new Date().getFullYear() - company.founding_year} лет</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно для отзыва */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
  )
}