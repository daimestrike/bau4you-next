'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createCompany } from '@/lib/supabase'

interface CompanyFormData {
  name: string
  description: string
  type: string
  website: string
  logo_url: string
  location: string
}

export default function CreateCompanyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    description: '',
    type: '',
    website: '',
    logo_url: '',
    location: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: ['founding_year', 'employee_count'].includes(name) 
          ? (value === '' ? '' : Number(value)) 
          : value
      }))
    }
  }

  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...formData.services]
    newServices[index] = value
    setFormData(prev => ({
      ...prev,
      services: newServices
    }))
  }

  const addServiceField = () => {
    if (formData.services.length < 10) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, '']
      }))
    }
  }

  const removeServiceField = (index: number) => {
    if (formData.services.length > 1) {
      const newServices = formData.services.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        services: newServices
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Фильтруем пустые услуги
      const filteredServices = formData.services.filter(service => service.trim() !== '')
      
      const companyData = {
        ...formData,
        services: filteredServices,
        founding_year: formData.founding_year === '' ? null : formData.founding_year,
        employee_count: formData.employee_count === '' ? null : formData.employee_count,
        status: 'active'
      }

      const { data, error } = await createCompany(companyData)
      
      if (error) {
        throw error
      }

      router.push(`/companies/${data.id}`)
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Произошла ошибка при создании компании')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/companies" 
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          ← Назад к компаниям
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Создать компанию</h1>
        <p className="text-gray-600 mt-1">Зарегистрируйте вашу компанию на платформе</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Название компании *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="ООО 'Строительная компания'"
              />
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                Отрасль *
              </label>
              <select
                id="industry"
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
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Город *
              </label>
              <input
                type="text"
                id="city"
                name="city"
                required
                value={formData.city}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Москва"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Описание компании *
              </label>
              <textarea
                id="description"
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

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Контактная информация</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="info@company.ru"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Веб-сайт
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://company.ru"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Дополнительная информация</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="founding_year" className="block text-sm font-medium text-gray-700 mb-1">
                Год основания
              </label>
              <input
                type="number"
                id="founding_year"
                name="founding_year"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.founding_year}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="2020"
              />
            </div>

            <div>
              <label htmlFor="employee_count" className="block text-sm font-medium text-gray-700 mb-1">
                Количество сотрудников
              </label>
              <input
                type="number"
                id="employee_count"
                name="employee_count"
                min="1"
                value={formData.employee_count}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="50"
              />
            </div>

            <div>
              <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                Логотип (URL)
              </label>
              <input
                type="url"
                id="logo_url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div>
              <label htmlFor="cover_image_url" className="block text-sm font-medium text-gray-700 mb-1">
                Обложка (URL)
              </label>
              <input
                type="url"
                id="cover_image_url"
                name="cover_image_url"
                value={formData.cover_image_url}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://example.com/cover.jpg"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Услуги</h2>
          
          <div className="space-y-4">
            {formData.services.map((service, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={service}
                  onChange={(e) => handleServiceChange(index, e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Например: Строительство жилых домов"
                />
                {formData.services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeServiceField(index)}
                    className="text-red-600 hover:text-red-800 p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
            
            {formData.services.length < 10 && (
              <button
                type="button"
                onClick={addServiceField}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Добавить услугу
              </button>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            Укажите основные услуги, которые предоставляет ваша компания.
          </p>
        </div>

        <div className="flex justify-end space-x-4">
          <Link
            href="/companies"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Создание...' : 'Создать компанию'}
          </button>
        </div>
      </form>
    </main>
  )
}