'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createProject } from '@/lib/supabase'
import { 
  ArrowLeftIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface ProjectFormData {
  name: string
  description: string
  location: string
  budget: number | null
  deadline: string
  status: 'planning' | 'active' | 'completed' | 'on_hold'
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
    budget: null,
    deadline: '',
    status: 'planning',
    category: ''
  })
  
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [companyRequirements, setCompanyRequirements] = useState<CompanyRequirement[]>([])
  
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
      material.id === id ? { ...material, [field]: value } : material
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
      req.id === id ? { ...req, [field]: value } : req
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
      const projectData = {
        ...formData,
        materials_list: materials,
        company_requirements: companyRequirements
      }
      
      const { data, error } = await createProject(projectData)
      
      if (error) {
        throw error
      }
      
      router.push(`/projects/${data.id}`)
    } catch (err: unknown) {
      const error = err as Error
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
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Местоположение *
          </label>
          <input
            type="text"
            id="location"
            name="location"
            required
            value={formData.location}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Москва, МО, Подольск"
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
  )
} 