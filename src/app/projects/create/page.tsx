'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import NoSSR from '@/components/NoSSR'
import { 
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface ProjectFormData {
  name: string
  description: string
  location: string
  region_id: string
  budget: number | null
  deadline: string
  category: string
}

interface MaterialItem {
  id: string
  name: string
  category: string
  quantity: number
  estimated_price: number
}

interface CompanyRequirement {
  id: string
  role: string
  skills: string[]
  budget_min: number
  budget_max: number
}

export default function CreateProjectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    location: '',
    region_id: '',
    budget: null,
    deadline: '',
    category: ''
  })
  
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [companyRequirements, setCompanyRequirements] = useState<CompanyRequirement[]>([])
  const [regions, setRegions] = useState<{id: string, name: string}[]>([])
  
  // Загрузка регионов при монтировании компонента
  useEffect(() => {
    const loadRegions = async () => {
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('id, name')
          .order('name')
        
        if (error) {
          console.error('Ошибка загрузки регионов:', error)
          return
        }
        
        setRegions(data || [])
      } catch (error) {
        console.error('Ошибка при загрузке регионов:', error)
      }
    }
    
    loadRegions()
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget' ? (value ? Number(value) : null) : value
    }))
  }
  
  const addMaterial = () => {
    const newMaterial: MaterialItem = {
      id: Date.now().toString(),
      name: '',
      category: '',
      quantity: 1,
      estimated_price: 0
    }
    setMaterials([...materials, newMaterial])
  }
  
  const updateMaterial = (id: string, field: keyof MaterialItem, value: any) => {
    setMaterials(materials.map(material => 
      material.id === id ? { 
        ...material, 
        [field]: (field === 'quantity' || field === 'estimated_price') ? (value || 0) : value 
      } : material
    ))
  }
  
  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(material => material.id !== id))
  }
  
  const addCompanyRequirement = () => {
    const newRequirement: CompanyRequirement = {
      id: Date.now().toString(),
      role: '',
      skills: [],
      budget_min: 0,
      budget_max: 0
    }
    setCompanyRequirements([...companyRequirements, newRequirement])
  }
  
  const updateCompanyRequirement = (id: string, field: keyof CompanyRequirement, value: any) => {
    setCompanyRequirements(companyRequirements.map(req => 
      req.id === id ? { 
        ...req, 
        [field]: (field === 'budget_min' || field === 'budget_max') ? (value || 0) : value 
      } : req
    ))
  }
  
  const removeCompanyRequirement = (id: string) => {
    setCompanyRequirements(companyRequirements.filter(req => req.id !== id))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      console.log('=== СОЗДАНИЕ ПРОЕКТА ===')
      console.log('Исходные данные формы:', formData)
      
      // Очищаем пустые строки для UUID полей и числовых полей
      const cleanedFormData = {
        ...formData,
        region_id: formData.region_id || null,
        budget: formData.budget || null,
        deadline: formData.deadline || null // Добавляем очистку для даты
      }
      
      console.log('Очищенные данные формы:', cleanedFormData)
      
      // Очищаем данные материалов
      const cleanedMaterials = materials.map(material => ({
        ...material,
        quantity: material.quantity || 0,
        estimated_price: material.estimated_price || 0
      }))
      
      console.log('Очищенные материалы:', cleanedMaterials)
      
      // Очищаем данные требований к компаниям
      const cleanedCompanyRequirements = companyRequirements.map(req => ({
        ...req,
        budget_min: req.budget_min || 0,
        budget_max: req.budget_max || 0
      }))
      
      console.log('Очищенные требования к компаниям:', cleanedCompanyRequirements)
      
      const projectData = {
        ...cleanedFormData,
        materials_list: cleanedMaterials,
        company_requirements: cleanedCompanyRequirements
      }
      
      console.log('Финальные данные для отправки:', projectData)
      
      // Получаем токен авторизации
      console.log('🔑 Начинаем получение токена...')
      let session, token
      try {
        console.log('🔍 Вызываем supabase.auth.getSession()...')
        
        // Добавляем таймаут для getSession
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 10000)
        )
        
        const sessionResult = await Promise.race([sessionPromise, timeoutPromise]) as any
        console.log('🔍 getSession завершен, обрабатываем результат...')
        
        session = sessionResult.data?.session
        token = session?.access_token
        
        console.log('🔑 Токен получен:', !!token)
        console.log('👤 Пользователь из сессии:', session?.user?.email)
        
        if (!session) {
          console.log('⚠️ Сессия не найдена, но продолжаем без токена')
        }
      } catch (tokenError) {
        console.error('❌ Ошибка получения токена:', tokenError)
        console.log('⚠️ Продолжаем без токена авторизации')
        session = null
        token = null
      }

      // Используем API route вместо прямого обращения к Supabase
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
        console.log('🔐 Заголовок авторизации установлен')
      } else {
        console.log('⚠️ Токен отсутствует, отправляем без авторизации')
      }

      console.log('🌐 Отправляем запрос к API...')
      console.log('📋 Headers:', headers)
      
      let response
      try {
        response = await fetch('/api/projects', {
          method: 'POST',
          headers,
          body: JSON.stringify(projectData)
        })
        console.log('📡 Fetch завершен успешно')
      } catch (fetchError) {
        console.error('❌ Ошибка fetch:', fetchError)
        throw new Error(`Ошибка сетевого запроса: ${fetchError}`)
      }

      console.log('📡 Получен ответ от API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.log('❌ Ошибка от API:', errorData)
        throw new Error(errorData.error || 'Ошибка при создании проекта')
      }

      const result = await response.json()
      console.log('✅ Проект создан успешно:', result)
      
      // Получаем ID созданного проекта
      const projectId = result.data?.[0]?.id || result.data?.id
      if (projectId) {
        router.push(`/projects/${projectId}`)
      } else {
        router.push('/projects')
      }
    } catch (err: unknown) {
      const error = err as Error
      console.error('Полная ошибка при создании проекта:', err)
      setError(error.message || 'Произошла ошибка при создании проекта')
    } finally {
      setIsLoading(false)
    }
  }
  
  const categories = [
    'Строительство домов',
    'Ремонт квартир', 
    'Коммерческое строительство',
    'Ландшафтный дизайн',
    'Дорожные работы',
    'Инженерные системы',
    'Промышленность',
    'Коммерческая недвижимость',
    'Частное строительство',
    'Другое'
  ]
  
  const materialCategories = [
    'Стройматериалы',
    'Инструменты',
    'Электрика',
    'Сантехника',
    'Отделочные материалы',
    'Изоляция',
    'Кровельные материалы'
  ]
  
  const companyRoles = [
    'Генеральный подрядчик',
    'Архитектор',
    'Дизайнер',
    'Строительная бригада',
    'Электрик',
    'Сантехник',
    'Отделочники',
    'Поставщик материалов'
  ]
  
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Основная информация</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Название проекта *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Строительство загородного дома"
          />
        </div>
        
        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Описание проекта *
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Подробное описание проекта, требования, особенности..."
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Категория *
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Выберите категорию</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="region_id" className="block text-sm font-medium text-gray-700">
            Регион *
          </label>
          <select
            id="region_id"
            name="region_id"
            required
            value={formData.region_id}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Выберите регион</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Адрес
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Укажите адрес проекта"
          />
        </div>
        
        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
            Бюджет (₽)
          </label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={formData.budget || ''}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="1000000"
          />
        </div>
        
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
            Планируемое завершение
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={formData.deadline}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  )
  
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Материалы</h2>
        <button
          type="button"
          onClick={addMaterial}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Добавить материал</span>
        </button>
      </div>
      
      <p className="text-gray-600">
        Добавьте материалы, которые понадобятся для проекта. Это поможет найти поставщиков и рассчитать бюджет.
      </p>
      
      {materials.length > 0 ? (
        <div className="space-y-4">
          {materials.map((material) => (
            <div key={material.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название материала
                  </label>
                  <input
                    type="text"
                    value={material.name}
                    onChange={(e) => updateMaterial(material.id, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Кирпич керамический"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Категория
                  </label>
                  <select
                    value={material.category}
                    onChange={(e) => updateMaterial(material.id, 'category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Выберите</option>
                    {materialCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Количество
                  </label>
                  <input
                    type="number"
                    value={material.quantity}
                    onChange={(e) => updateMaterial(material.id, 'quantity', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeMaterial(material.id)}
                    className="w-full bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 flex items-center justify-center"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Материалы пока не добавлены</p>
          <button
            type="button"
            onClick={addMaterial}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Добавить первый материал
          </button>
        </div>
      )}
    </div>
  )
  
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Требования к компаниям</h2>
        <button
          type="button"
          onClick={addCompanyRequirement}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Добавить требование</span>
        </button>
      </div>
      
      <p className="text-gray-600">
        Укажите, какие специалисты нужны для проекта. Это поможет найти подходящие компании.
      </p>
      
      {companyRequirements.length > 0 ? (
        <div className="space-y-4">
          {companyRequirements.map((requirement) => (
            <div key={requirement.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Роль/Специализация
                  </label>
                  <select
                    value={requirement.role}
                    onChange={(e) => updateCompanyRequirement(requirement.id, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Выберите роль</option>
                    {companyRoles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Бюджет от (₽)
                  </label>
                  <input
                    type="number"
                    value={requirement.budget_min}
                    onChange={(e) => updateCompanyRequirement(requirement.id, 'budget_min', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="50000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Бюджет до (₽)
                  </label>
                  <input
                    type="number"
                    value={requirement.budget_max}
                    onChange={(e) => updateCompanyRequirement(requirement.id, 'budget_max', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="200000"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeCompanyRequirement(requirement.id)}
                    className="w-full bg-red-100 text-red-700 px-3 py-2 rounded-md hover:bg-red-200 flex items-center justify-center"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">Требования к компаниям пока не добавлены</p>
          <button
            type="button"
            onClick={addCompanyRequirement}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Добавить первое требование
          </button>
        </div>
      )}
    </div>
  )
  
  return (
    <NoSSR fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка формы создания проекта...</p>
        </div>
      </div>
    }>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/projects"
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Назад к проектам
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">Создание проекта</h1>
          
          {/* Прогресс */}
          <div className="mt-6">
            <div className="flex items-center">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-12 h-1 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm">
              <span className={currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}>
                Основная информация
              </span>
              <span className={currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}>
                Материалы
              </span>
              <span className={currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}>
                Компании
              </span>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          
          <div className="mt-8 flex justify-between">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200"
                >
                  Назад
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={currentStep === 1 && (!formData.name || !formData.description || !formData.category || !formData.location)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Далее
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Создание...' : 'Создать проект'}
                </button>
              )}
            </div>
          </div>
        </form>
      </main>
    </NoSSR>
  )
}