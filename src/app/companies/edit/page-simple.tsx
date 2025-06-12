'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'

interface CompanyData {
  id?: string
  name: string
  description?: string
  type?: 'contractor' | 'supplier' | 'both'
  website?: string
  logo_url?: string
  location?: string
  owner_id: string
}

export default function EditCompanyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isNewCompany, setIsNewCompany] = useState(false)
  
  const [formData, setFormData] = useState<CompanyData>({
    name: '',
    description: '',
    type: 'contractor',
    website: '',
    logo_url: '',
    location: '',
    owner_id: ''
  })

  useEffect(() => {
    async function fetchCompany() {
      setIsLoading(true)
      setError(null)

      try {
        const { user } = await getCurrentUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .select('*')
          .eq('owner_id', user.id)
          .single()

        if (companyError && companyError.code === 'PGRST116') {
          // Компания не найдена, создаем новую
          setIsNewCompany(true)
          setFormData(prev => ({ ...prev, owner_id: user.id }))
        } else if (companyError) {
          throw companyError
        } else {
          if (companyData) {
            setFormData({
              id: companyData.id,
              name: companyData.name || '',
              description: companyData.description || '',
              type: companyData.type || 'contractor',
              website: companyData.website || '',
              logo_url: companyData.logo_url || '',
              location: companyData.location || '',
              owner_id: companyData.owner_id
            })
          } else {
            setIsNewCompany(true)
            setFormData(prev => ({ ...prev, owner_id: user.id }))
          }
        }
      } catch (err: unknown) {
        const error = err as Error
        setError(error.message || 'Ошибка при загрузке данных компании')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompany()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const { user } = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }

      if (isNewCompany) {
        const { error } = await supabase
          .from('companies')
          .insert([{
            name: formData.name,
            description: formData.description,
            type: formData.type,
            website: formData.website,
            logo_url: formData.logo_url,
            location: formData.location,
            owner_id: user.id
          }])

        if (error) throw error
        setSuccess('Профиль компании успешно создан!')
        setIsNewCompany(false)
      } else {
        const { error } = await supabase
          .from('companies')
          .update({
            name: formData.name,
            description: formData.description,
            type: formData.type,
            website: formData.website,
            logo_url: formData.logo_url,
            location: formData.location
          })
          .eq('owner_id', user.id)

        if (error) throw error
        setSuccess('Профиль компании успешно обновлен!')
      }

      // Обновляем название компании в профиле пользователя
      await supabase
        .from('profiles')
        .update({ company_name: formData.name })
        .eq('id', user.id)

    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Ошибка при сохранении профиля компании')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/profile" 
          className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Вернуться к профилю
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Building2 className="w-8 h-8 mr-3 text-blue-600" />
          {isNewCompany ? 'Создать профиль компании' : 'Редактировать профиль компании'}
        </h1>
        <p className="text-gray-600 mt-2">
          Детальная информация о вашей компании поможет привлечь больше клиентов
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="text-green-800">{success}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Основная информация */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
            Основная информация
          </h2>
          
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
                placeholder="ООО «Строительная компания»"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Тип компании *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="contractor">Подрядчик</option>
                <option value="supplier">Поставщик</option>
                <option value="both">Подрядчик и поставщик</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Местоположение
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Москва"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Описание компании
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Расскажите о вашей компании, услугах, достижениях..."
              />
            </div>

            <div>
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

            <div>
              <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                URL логотипа
              </label>
              <input
                type="url"
                id="logo_url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://company.ru/logo.png"
              />
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/profile"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Сохранение...' : (isNewCompany ? 'Создать компанию' : 'Сохранить изменения')}
          </button>
        </div>
      </form>
    </main>
  )
} 