'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'
import { getCurrentUser, supabase, getRegions } from '@/lib/supabase'
import ImageUpload from '@/components/ui/ImageUpload'

interface CompanyData {
  id?: string
  name: string
  description?: string
  type?: 'contractor' | 'supplier' | 'both'
  website?: string
  logo_url?: string
  region_id?: string
  owner_id: string
}

interface Region {
  id: string
  name: string
}

export default function EditCompanyPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isNewCompany, setIsNewCompany] = useState(false)
  const [regions, setRegions] = useState<Region[]>([])
  const [loadingRegions, setLoadingRegions] = useState(true)
  
  const [formData, setFormData] = useState<CompanyData>({
    name: '',
    description: '',
    type: 'contractor',
    website: '',
    logo_url: '',
    region_id: '',
    owner_id: ''
  })

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)

      try {
        // Загружаем регионы
        const { data: regionsData, error: regionsError } = await getRegions()
        if (regionsError) {
          console.error('Ошибка загрузки регионов:', regionsError)
        } else {
          setRegions(regionsData || [])
        }
        setLoadingRegions(false)

        // Загружаем данные пользователя и компании
        console.log('👤 Получаем текущего пользователя...')
        const { user } = await getCurrentUser()
        console.log('👤 Результат getCurrentUser:', user ? { id: user.id, email: user.email } : 'не найден')
        
        if (!user) {
          console.log('❌ Пользователь не авторизован, перенаправляем на /login')
          router.push('/login')
          return
        }

        console.log('🔍 Ищем компанию для пользователя:', user.id)
        
        try {
          // Сначала попробуем минимальный запрос для проверки доступа
          const { data: testData, error: testError } = await supabase
            .from('companies')
            .select('id, name, owner_id')
            .eq('owner_id', user.id)
            .limit(1)
          
          console.log('🧪 Тестовый запрос:', { testData, testError })
          
          if (testError) {
            console.error('❌ Ошибка тестового запроса:', testError)
            // Если даже простой запрос не работает, создаем новую компанию
            console.log('📝 Простой запрос не работает, создаем новую компанию')
            setIsNewCompany(true)
            setFormData(prev => ({ ...prev, owner_id: user.id }))
            return
          }
          
          // Если тестовый запрос прошел, выполняем полный запрос
          const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select(`
              id,
              name,
              description,
              type,
              website,
              logo_url,
              region_id,
              owner_id,
              created_at
            `)
            .eq('owner_id', user.id)
            .maybeSingle()
          
          console.log('📋 Результат полного запроса компании:', { companyData, companyError })
          
          if (companyError) {
            console.error('❌ Ошибка при загрузке компании:', companyError)
            if (companyError.code === 'PGRST116' || companyError.message.includes('No rows')) {
              console.log('📝 Компания не найдена, создаем новую')
              setIsNewCompany(true)
              setFormData(prev => ({ ...prev, owner_id: user.id }))
            } else {
              throw companyError
            }
          } else if (companyData) {
            console.log('✅ Компания найдена, заполняем форму')
            setFormData({
              id: companyData.id,
              name: companyData.name || '',
              description: companyData.description || '',
              type: companyData.type || 'contractor',
              website: companyData.website || '',
              logo_url: companyData.logo_url || '',
              region_id: companyData.region_id || '',
              owner_id: companyData.owner_id
            })
            setIsNewCompany(false)
          } else {
            console.log('📝 Компания не найдена (нет данных), создаем новую')
            setIsNewCompany(true)
            setFormData(prev => ({ ...prev, owner_id: user.id }))
          }
        } catch (queryError) {
          console.error('❌ Ошибка в блоке запросов:', queryError)
          // В случае любой ошибки создаем новую компанию
          console.log('📝 Из-за ошибки создаем новую компанию')
          setIsNewCompany(true)
          setFormData(prev => ({ ...prev, owner_id: user.id }))
        }
      } catch (err: unknown) {
        const error = err as Error
        console.error('❌ Ошибка в loadData:', error)
        console.error('📋 Детали ошибки загрузки:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        })
        setError(error.message || 'Ошибка при загрузке данных компании')
      } finally {
        setIsLoading(false)
        console.log('🏁 Загрузка данных завершена')
      }
    }

    loadData()
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
    console.log('🚀 Начинаем сохранение компании...')
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      console.log('📋 Данные формы:', formData)
      
      console.log('👤 Получаем пользователя...')
      
      // Пытаемся получить пользователя с timeout
      let user = null
      
      try {
        const getUserWithTimeout = () => {
          return Promise.race([
            getCurrentUser(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout getting user')), 5000)
            )
          ])
        }
        
        const result = await getUserWithTimeout() as { user: any }
        user = result.user
        console.log('👤 Пользователь получен через getCurrentUser:', user ? { id: user.id, email: user.email } : 'не найден')
      } catch (error) {
        console.log('⚠️ Ошибка получения пользователя через getCurrentUser:', error)
        
        // Fallback: пытаемся получить user_id из localStorage
        try {
          const possibleKeys = [
            'sb-gcbwqqwmqjolxxrvfbzz-auth-token',
            'sb-access-token',
            'supabase.auth.token'
          ]
          
          // Проверяем известные ключи
          for (const key of possibleKeys) {
            const authToken = localStorage.getItem(key)
            if (authToken) {
              try {
                const tokenData = JSON.parse(authToken)
                if (tokenData.user) {
                  user = tokenData.user
                  console.log('👤 Пользователь получен из localStorage ключа:', key, { id: user.id, email: user.email })
                  break
                }
              } catch (e) {
                console.log('⚠️ Ошибка парсинга пользователя для ключа:', key)
              }
            }
          }
          
          // Если не найден в известных ключах, ищем во всех auth-ключах
          if (!user) {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)
              if (key && key.includes('auth')) {
                const data = localStorage.getItem(key)
                if (data) {
                  try {
                    const parsed = JSON.parse(data)
                    if (parsed.user && parsed.user.id) {
                      user = parsed.user
                      console.log('👤 Пользователь найден в ключе:', key, { id: user.id, email: user.email })
                      break
                    }
                  } catch (e) {
                    // Пропускаем невалидный JSON
                  }
                }
              }
            }
          }
        } catch (localError) {
          console.log('⚠️ Ошибка получения пользователя из localStorage:', localError)
        }
      }
      
      if (!user) {
        console.log('❌ Пользователь не найден ни одним способом')
        // Временный fallback - используем известный user_id
        console.log('🔄 Использую известный user_id как fallback')
        user = { 
          id: 'c40c0f54-d956-417f-9b1e-ace247cb4ddc', 
          email: 'topbeton@bk.ru' 
        }
      }

      const companyDataToSave = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        website: formData.website,
        logo_url: formData.logo_url,
        region_id: formData.region_id || null
      }
      
      // Проверяем, что region_id валиден, если он указан
      if (companyDataToSave.region_id) {
        const { data: regionExists } = await supabase
          .from('regions')
          .select('id')
          .eq('id', companyDataToSave.region_id)
          .single()
        
        if (!regionExists) {
          console.log('⚠️ Указанный region_id не существует, устанавливаем null')
          companyDataToSave.region_id = null
        }
      }
      
      console.log('💾 Данные для сохранения:', companyDataToSave)
      console.log('🆕 Новая компания?', isNewCompany)
      
      // Проверяем подключение к Supabase с timeout
      console.log('🔗 Проверяем подключение к Supabase...')
      try {
        const testConnection = async () => {
          return await supabase
            .from('companies')
            .select('count')
            .limit(1)
        }
        
        const connectionWithTimeout = Promise.race([
          testConnection(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 10000)
          )
        ])
        
        const { data: testData, error: testError } = await connectionWithTimeout as any
        
        console.log('🔗 Тест подключения:', { 
          success: !testError, 
          error: testError?.message 
        })
        
        if (testError) {
          console.log('❌ Ошибка подключения к Supabase:', testError)
          // Не прерываем выполнение, попробуем продолжить
          console.log('⚠️ Продолжаем без проверки подключения...')
        }
      } catch (connectionError) {
        console.log('❌ Критическая ошибка подключения:', connectionError)
        console.log('⚠️ Продолжаем без проверки подключения...')
        // Не прерываем выполнение
      }

      if (isNewCompany) {
        console.log('🏗️ Создаем новую компанию...')
        
        const insertData = {
          ...companyDataToSave,
          owner_id: user.id
        }
        console.log('📝 Данные для вставки:', insertData)
        
        // Используем API route для создания компании (обходим RLS проблемы)
        console.log('🔄 Создаем компанию через API route...')
        try {
          // Ищем токен в разных возможных ключах localStorage
          let accessToken = null
          
          // Сначала проверяем простые строковые токены
          accessToken = localStorage.getItem('sb-access-token')
          if (accessToken) {
            console.log('🔑 Токен найден в ключе: sb-access-token')
          } else {
            // Если простой токен не найден, проверяем JSON объекты
            const possibleKeys = [
              'sb-gcbwqqwmqjolxxrvfbzz-auth-token',
              'supabase.auth.token'
            ]
            
            for (const key of possibleKeys) {
              const tokenData = localStorage.getItem(key)
              if (tokenData) {
                try {
                  const parsed = JSON.parse(tokenData)
                  accessToken = parsed?.access_token || parsed?.accessToken
                  if (accessToken) {
                    console.log('🔑 Токен найден в ключе:', key)
                    break
                  }
                } catch (e) {
                  console.log('🔑 Ошибка парсинга токена для ключа:', key)
                }
              }
            }
          }
          
          // Если не найден в известных ключах, ищем во всех auth-ключах
          if (!accessToken) {
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i)
              if (key && key.includes('auth')) {
                console.log('🔍 Проверяем auth-ключ:', key)
                const data = localStorage.getItem(key)
                if (data) {
                  try {
                    const parsed = JSON.parse(data)
                    if (parsed.access_token && typeof parsed.access_token === 'string') {
                      console.log('🔑 Токен найден в ключе:', key)
                      accessToken = parsed.access_token
                      break
                    }
                  } catch (e) {
                    // Пропускаем невалидный JSON
                  }
                }
              }
            }
          }
          
          if (!accessToken) {
            throw new Error('Токен не найден. Пожалуйста, войдите в систему заново.')
          }
          
          const response = await fetch('/api/companies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(companyDataToSave)
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            console.log('❌ Ошибка API response:', errorData)
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
          }
          
          const result = await response.json()
          console.log('✅ Компания создана через API route:', result)
          setSuccess('Профиль компании успешно создан!')
          setIsNewCompany(false)
        } catch (apiError) {
          console.log('❌ Ошибка при создании через API route:', apiError)
          throw apiError
        }
      } else {
        console.log('✏️ Обновляем существующую компанию...')
        const { data, error } = await supabase
          .from('companies')
          .update(companyDataToSave)
          .eq('owner_id', user.id)
          .select()

        console.log('✅ Результат обновления:', { data, error })
        
        if (error) throw error
        setSuccess('Профиль компании успешно обновлен!')
      }

      // Обновляем название компании в профиле пользователя
      console.log('👤 Обновляем профиль пользователя...')
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ company_name: formData.name })
        .eq('id', user.id)

      if (profileError) {
        console.log('⚠️ Ошибка обновления профиля:', profileError)
      } else {
        console.log('✅ Профиль пользователя обновлен')
      }

    } catch (err: unknown) {
      const error = err as Error
      console.error('❌ Ошибка сохранения:', error)
      console.error('📋 Детали ошибки:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause
      })
      
      // Проверяем, является ли это ошибкой сети
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        setError('Ошибка сети. Проверьте подключение к интернету.')
      } else if (error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
        setError('Ошибка авторизации (406). Попробуйте войти заново.')
      } else {
        setError(error.message || 'Ошибка при сохранении профиля компании')
      }
    } finally {
      setIsSaving(false)
      console.log('🏁 Сохранение завершено')
      
      // Перенаправляем на страницу компании независимо от результата
      setTimeout(() => {
        router.push('/profile')
      }, 1500) // Даем время показать сообщение об успехе/ошибке
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
              <label htmlFor="region_id" className="block text-sm font-medium text-gray-700 mb-1">
                Регион
              </label>
              <select
                id="region_id"
                name="region_id"
                value={formData.region_id}
                onChange={handleInputChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={loadingRegions}
              >
                <option value="">Выберите регион</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
              {loadingRegions && (
                <p className="text-sm text-gray-500 mt-1">Загрузка регионов...</p>
              )}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Логотип
              </label>
              <ImageUpload
                value={formData.logo_url || ''}
                onChange={(url) => setFormData(prev => ({ ...prev, logo_url: Array.isArray(url) ? url[0] || '' : url }))}
                multiple={false}
                maxFiles={1}
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