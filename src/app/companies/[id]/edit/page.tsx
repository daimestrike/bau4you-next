'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { updateCompany, getCompany, getRegions, getCurrentUser } from '@/lib/supabase'
import ImageUpload from '@/components/ui/ImageUpload'

export default function EditCompanyPage() {
  const router = useRouter()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [regions, setRegions] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    type: '',
    location: '',
    email: '',
    website: '',
    logo_url: '',
    cover_image: '',
    founded_year: 0,
    employee_count: 0,
    specializations: [''],
    address: '',
    phone: '',
    region_id: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Проверяем авторизацию
        const userResult = await getCurrentUser()
        if (!userResult.user) {
          setError('Необходимо войти в систему')
          return
        }

        // Загружаем данные компании
        const { data, error } = await getCompany(id as string)
        if (error) throw error
        
        if (data) {
          // Проверяем, является ли пользователь владельцем
          if (data.owner_id !== userResult.user.id) {
            setError('У вас нет прав для редактирования этой компании')
            return
          }

          setFormData({
            name: data.name || '',
            description: data.description || '',
            industry: data.industry || '',
            type: data.type || '',
            location: data.location || '',
            email: data.email || '',
            website: data.website || '',
            logo_url: data.logo_url || '',
            cover_image: data.cover_image || '',
            founded_year: data.founded_year || 0,
            employee_count: data.employee_count || 0,
            specializations: data.specializations?.length ? data.specializations : [''],
            address: data.address || '',
            phone: data.phone || '',
            region_id: data.region_id || 0
          })
        }

        // Загружаем регионы
        const regionsResult = await getRegions()
        if (regionsResult.data) {
          setRegions(regionsResult.data)
        }

      } catch {
        setError('Ошибка загрузки данных компании')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'founded_year' || name === 'employee_count' || name === 'region_id' 
        ? Number(value) 
        : value
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      // Фильтруем пустые значения из массивов
      const cleanedData = {
        ...formData,
        specializations: formData.specializations.filter(s => s.trim() !== ''),
        founded_year: formData.founded_year || null,
        employee_count: formData.employee_count || null
      }

      console.log('🔍 Отправляем данные компании:', cleanedData)
      console.log('🖼️ Logo URL:', cleanedData.logo_url)
      console.log('🎨 Cover Image:', cleanedData.cover_image)

      const { data, error } = await updateCompany(id as string, cleanedData)
      
      if (error) {
        console.error('❌ Ошибка обновления компании:', error)
        throw error
      }

      console.log('✅ Компания успешно обновлена:', data)
      router.push(`/companies/${id}`)
    } catch (err: any) {
      console.error('💥 Ошибка при сохранении:', err)
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ошибка</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/companies/${id}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Вернуться к профилю компании
          </button>
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
                Тип компании *
              </label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Выберите тип</option>
                <option value="contractor">Подрядчик</option>
                <option value="supplier">Поставщик</option>
                <option value="client">Заказчик</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Регион *
              </label>
              <select
                name="region_id"
                required
                value={formData.region_id}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Выберите регион</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Город
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Например: Москва"
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
                Количество сотрудников
              </label>
              <input
                type="number"
                name="employee_count"
                min="1"
                value={formData.employee_count || ''}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
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
                Телефон
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="+7 (999) 123-45-67"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Адрес
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Полный адрес компании"
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
                Логотип
              </label>
              <ImageUpload
                value={formData.logo_url}
                onChange={(url) => setFormData(prev => ({ ...prev, logo_url: typeof url === 'string' ? url : '' }))}
                multiple={false}
                maxFiles={1}
                placeholder="Загрузите логотип компании"
                disabled={isSaving}
              />
              <p className="text-sm text-gray-500 mt-1">
                Рекомендуемый размер: 200x200px. Максимальный размер файла: 10MB
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Обложка
              </label>
              <ImageUpload
                value={formData.cover_image}
                onChange={(url) => setFormData(prev => ({ ...prev, cover_image: typeof url === 'string' ? url : '' }))}
                multiple={false}
                maxFiles={1}
                placeholder="Загрузите обложку компании"
                disabled={isSaving}
              />
              <p className="text-sm text-gray-500 mt-1">
                Рекомендуемый размер: 1200x400px. Максимальный размер файла: 10MB
              </p>
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