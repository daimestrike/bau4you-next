'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { updateCompany, getCompany } from '@/lib/supabase'

interface CompanyData {
  id: string
  name: string
  description: string
  industry: string
  city: string
  email: string
  website: string
  logo_url: string
  cover_image: string
  founded_year: number
  employee_count: number
  services: string[]
  mission_statement: string
  vision_statement: string
  values: string[]
  company_size: string
  social_links: any
  working_hours: any
  specializations: string[]
  certifications: string[]
  awards: string[]
}

export default function EditCompanyPage() {
  const router = useRouter()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [company, setCompany] = useState<CompanyData | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    city: '',
    email: '',
    website: '',
    logo_url: '',
    cover_image: '',
    founded_year: 0,
    employee_count: 0,
    services: [''],
    mission_statement: '',
    vision_statement: '',
    values: [''],
    company_size: '',
    social_links: {
      website: '',
      linkedin: '',
      facebook: '',
      instagram: '',
      youtube: ''
    },
    specializations: [''],
    certifications: [''],
    awards: ['']
  })

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data, error } = await getCompany(id as string)
        if (error) throw error
        
        if (data) {
          setCompany(data)
          setFormData({
            name: data.name || '',
            description: data.description || '',
            industry: data.industry || '',
            city: data.city || '',
            email: data.email || '',
            website: data.website || '',
            logo_url: data.logo_url || '',
            cover_image: data.cover_image || '',
            founded_year: data.founded_year || 0,
            employee_count: data.employee_count || 0,
            services: data.services?.length ? data.services : [''],
            mission_statement: data.mission_statement || '',
            vision_statement: data.vision_statement || '',
            values: data.values?.length ? data.values : [''],
            company_size: data.company_size || '',
            social_links: data.social_links || {
              website: '',
              linkedin: '',
              facebook: '',
              instagram: '',
              youtube: ''
            },
            specializations: data.specializations?.length ? data.specializations : [''],
            certifications: data.certifications?.length ? data.certifications : [''],
            awards: data.awards?.length ? data.awards : ['']
          })
        }
      } catch {
        setError('Ошибка загрузки данных компании')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchCompany()
    }
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleArrayFieldChange = (field: string, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev as any)[field].map((item: string, i: number) => i === index ? value : item)
    }))
  }

  const addArrayField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev as any)[field], '']
    }))
  }

  const removeArrayField = (field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev as any)[field].filter((_: any, i: number) => i !== index)
    }))
  }

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      // Фильтруем пустые значения из массивов
      const cleanedData = {
        ...formData,
        services: formData.services.filter(s => s.trim() !== ''),
        values: formData.values.filter(v => v.trim() !== ''),
        specializations: formData.specializations.filter(s => s.trim() !== ''),
        certifications: formData.certifications.filter(c => c.trim() !== ''),
        awards: formData.awards.filter(a => a.trim() !== ''),
        founded_year: formData.founded_year || null,
        employee_count: formData.employee_count || null
      }

      const { data, error } = await updateCompany(id as string, cleanedData)
      
      if (error) {
        throw error
      }

      router.push(`/companies/${id}`)
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при сохранении')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Редактировать профиль компании</h1>
        <p className="text-gray-600 mt-1">Обновите информацию о вашей компании</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Основная информация */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Название компании *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Отрасль *
              </label>
              <select
                name="industry"
                required
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Выберите отрасль</option>
                <option value="construction">Строительство</option>
                <option value="architecture">Архитектура</option>
                <option value="engineering">Инженерия</option>
                <option value="design">Дизайн</option>
                <option value="materials">Строительные материалы</option>
                <option value="equipment">Оборудование</option>
                <option value="consulting">Консалтинг</option>
                <option value="other">Другое</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Город *
              </label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Год основания
              </label>
              <input
                type="number"
                name="founded_year"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.founded_year || ''}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Размер компании
              </label>
              <select
                name="company_size"
                value={formData.company_size}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Выберите размер</option>
                <option value="1-10">1-10 сотрудников</option>
                <option value="11-50">11-50 сотрудников</option>
                <option value="51-200">51-200 сотрудников</option>
                <option value="201-500">201-500 сотрудников</option>
                <option value="500+">500+ сотрудников</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Описание компании *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Расскажите о вашей компании, её деятельности и преимуществах"
              />
            </div>
          </div>
        </div>

        {/* Контактная информация */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Контактная информация</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Веб-сайт
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>

        {/* Изображения */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Изображения</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL логотипа
              </label>
              <input
                type="url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL обложки
              </label>
              <input
                type="url"
                name="cover_image"
                value={formData.cover_image}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com/cover.jpg"
              />
            </div>
          </div>
        </div>

        {/* Услуги */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Услуги</h2>
          
          <div className="space-y-4">
            {formData.services.map((service, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={service}
                  onChange={(e) => handleArrayFieldChange('services', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Например: Строительство жилых домов"
                />
                {formData.services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('services', index)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addArrayField('services')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Добавить услугу
            </button>
          </div>
        </div>

        {/* Миссия и видение */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Миссия и видение</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Миссия компании
              </label>
              <textarea
                name="mission_statement"
                rows={3}
                value={formData.mission_statement}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Опишите миссию вашей компании"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Видение компании
              </label>
              <textarea
                name="vision_statement"
                rows={3}
                value={formData.vision_statement}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Опишите видение вашей компании"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ценности компании
              </label>
              <div className="space-y-2">
                {formData.values.map((value, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleArrayFieldChange('values', index, e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Например: Качество превыше всего"
                    />
                    {formData.values.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField('values', index)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addArrayField('values')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Добавить ценность
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Социальные сети */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Социальные сети</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.social_links.linkedin}
                onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facebook
              </label>
              <input
                type="url"
                value={formData.social_links.facebook}
                onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://facebook.com/yourcompany"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                type="url"
                value={formData.social_links.instagram}
                onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://instagram.com/yourcompany"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube
              </label>
              <input
                type="url"
                value={formData.social_links.youtube}
                onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://youtube.com/c/yourcompany"
              />
            </div>
          </div>
        </div>

        {/* Специализации */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Специализации</h2>
          
          <div className="space-y-4">
            {formData.specializations.map((spec, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={spec}
                  onChange={(e) => handleArrayFieldChange('specializations', index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Например: Монолитное строительство"
                />
                {formData.specializations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField('specializations', index)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addArrayField('specializations')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Добавить специализацию
            </button>
          </div>
        </div>

        {/* Кнопки управления */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => router.push(`/companies/${id}`)}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
        </div>
      </form>
    </div>
  )
} 