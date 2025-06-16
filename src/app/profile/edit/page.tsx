'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, getProfile, updateProfile, supabase } from '@/lib/supabase'
import LocationSelector from '@/components/ui/LocationSelector'

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
  region?: string
  region_id?: string | null
  city_id?: string | null
  street_address?: string
  description?: string
  headline?: string
  role: 'contractor' | 'client' | 'supplier'
  years_experience?: number | null
}

interface ProfileExperience {
  id?: string
  title: string
  company?: string
  description?: string
  start_date: string
  end_date?: string
}

interface ProfileService {
  id?: string
  service_name: string
  description?: string
  price_range?: string
}

export default function EditProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [experiences, setExperiences] = useState<ProfileExperience[]>([])
  const [services, setServices] = useState<ProfileService[]>([])
  
  const [formData, setFormData] = useState({
    name_first: '',
    name_last: '',
    company_name: '',
    phone: '',
    website: '',
    country: '',
    city: '',
    region: '',
    region_id: '',
    city_id: '',
    street_address: '',
    description: '',
    headline: '',
    role: 'client' as 'contractor' | 'client' | 'supplier',
    years_experience: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { user, error: authError } = await getCurrentUser()
        if (authError || !user) {
          router.push('/login?redirect=/profile/edit')
          return
        }

        const { data: profileData, error: profileError } = await getProfile(user.id)
        if (profileError) {
          throw profileError
        }

        if (profileData) {
          setProfile(profileData)
          setFormData({
            name_first: profileData.name_first || '',
            name_last: profileData.name_last || '',
            company_name: profileData.company_name || '',
            phone: profileData.phone || '',
            website: profileData.website || '',
            country: profileData.country || '',
            city: profileData.city || '',
            region: profileData.region || '',
            region_id: profileData.region_id || '',
            city_id: profileData.city_id || '',
            street_address: profileData.street_address || '',
            description: profileData.description || '',
            headline: profileData.headline || '',
            role: profileData.role,
            years_experience: profileData.years_experience ? profileData.years_experience.toString() : ''
          })
        }

        // Загружаем опыт работы
        const { data: experienceData, error: expError } = await supabase
          .from('profile_experience')
          .select('*')
          .eq('profile_id', user.id)
          .order('start_date', { ascending: false })

        if (expError) {
          console.error('Error loading experiences:', expError)
        } else {
          setExperiences(experienceData || [])
        }

        // Загружаем услуги
        const { data: servicesData, error: servicesError } = await supabase
          .from('profile_services')
          .select('*')
          .eq('profile_id', user.id)

        if (servicesError) {
          console.error('Error loading services:', servicesError)
        } else {
          setServices(servicesData || [])
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

    try {
      const { user } = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Подготавливаем данные для отправки
      const dataToUpdate: Record<string, unknown> = { ...formData }
      
      console.log('Form data before processing:', formData)
      console.log('Data to update before processing:', dataToUpdate)
      console.log('Keys in dataToUpdate before processing:', Object.keys(dataToUpdate))
      
      // Конвертируем years_experience в число или null
      if (typeof dataToUpdate.years_experience === 'string') {
        if (dataToUpdate.years_experience === '' || dataToUpdate.years_experience === '0') {
          dataToUpdate.years_experience = null
        } else {
          const parsed = parseInt(dataToUpdate.years_experience as string, 10)
          dataToUpdate.years_experience = isNaN(parsed) ? null : parsed
        }
      }
      
      // Убираем пустые строки для ID полей
      if (dataToUpdate.region_id === '') {
        dataToUpdate.region_id = null
      }
      if (dataToUpdate.city_id === '') {
        dataToUpdate.city_id = null
      }

      console.log('Data to update after processing:', dataToUpdate)
      console.log('Keys in dataToUpdate after processing:', Object.keys(dataToUpdate))
      
      // Check if updated_at is somehow in the data
      if ('updated_at' in dataToUpdate) {
        console.error('CRITICAL: updated_at found in form data!', dataToUpdate.updated_at)
        delete dataToUpdate.updated_at
      }

      const { error } = await updateProfile(user.id, dataToUpdate)
      if (error) {
        throw error
      }

      router.push('/profile')
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Ошибка при сохранении профиля')
    } finally {
      setIsSaving(false)
    }
  }

  const addExperience = () => {
    setExperiences(prev => [...prev, {
      title: '',
      company: '',
      description: '',
      start_date: '',
      end_date: ''
    }])
  }

  const updateExperience = (index: number, field: keyof ProfileExperience, value: string) => {
    setExperiences(prev => prev.map((exp, i) => 
      i === index ? { ...exp, [field]: value } : exp
    ))
  }

  const removeExperience = (index: number) => {
    setExperiences(prev => prev.filter((_, i) => i !== index))
  }

  const addService = () => {
    setServices(prev => [...prev, {
      service_name: '',
      description: '',
      price_range: ''
    }])
  }

  const updateService = (index: number, field: keyof ProfileService, value: string) => {
    setServices(prev => prev.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    ))
  }

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index))
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
          className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block"
        >
          ← Вернуться к профилю
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Редактировать профиль</h1>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Основная информация */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name_first" className="block text-sm font-medium text-gray-700 mb-1">
                Имя *
              </label>
              <input
                type="text"
                id="name_first"
                name="name_first"
                required
                value={formData.name_first}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="name_last" className="block text-sm font-medium text-gray-700 mb-1">
                Фамилия *
              </label>
              <input
                type="text"
                id="name_last"
                name="name_last"
                required
                value={formData.name_last}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                Название компании
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="+7 (999) 123-45-67"
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
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Роль *
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="client">Заказчик</option>
                <option value="contractor">Исполнитель</option>
                <option value="supplier">Поставщик</option>
              </select>
            </div>

            <div>
              <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700 mb-1">
                Опыт работы (лет)
              </label>
              <input
                type="number"
                id="years_experience"
                name="years_experience"
                min="0"
                max="50"
                value={formData.years_experience}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
                Профессиональный заголовок
              </label>
              <input
                type="text"
                id="headline"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Например: Генеральный подрядчик строительных работ"
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              О себе / компании
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Расскажите о своем опыте, услугах, достижениях..."
            />
          </div>
        </div>

        {/* Адрес */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Адрес</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Страна
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Россия"
              />
            </div>

            <div className="md:col-span-2">
              <LocationSelector
                regionId={formData.region_id || ''}
                cityId={formData.city_id || ''}
                onRegionChange={(regionId, regionName) => {
                  setFormData(prev => ({
                    ...prev,
                    region_id: regionId,
                    region: regionName
                  }))
                }}
                onCityChange={(cityId, cityName) => {
                  setFormData(prev => ({
                    ...prev,
                    city_id: cityId,
                    city: cityName
                  }))
                }}
                placeholder={{
                  region: 'Выберите регион',
                  city: 'Выберите город'
                }}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="street_address" className="block text-sm font-medium text-gray-700 mb-1">
                Адрес
              </label>
              <input
                type="text"
                id="street_address"
                name="street_address"
                value={formData.street_address}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Улица, дом, офис"
              />
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/profile"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>

      {/* Ссылка на редактирование компании */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Управление компанией
        </h3>
        <p className="text-blue-700 mb-4">
          Создайте или отредактируйте профиль вашей компании для повышения доверия клиентов
        </p>
        <Link
          href="/companies/edit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Редактировать профиль компании
        </Link>
      </div>
    </main>
  )
}