'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getCompanyPortfolio, addPortfolioItem, updatePortfolioItem, deletePortfolioItem, getCompany, getCurrentUser } from '@/lib/supabase'

interface PortfolioItem {
  id: string
  title: string
  description: string
  category: string
  client_name: string
  project_value: number
  start_date: string
  end_date: string
  location: string
  images: string[]
  tags: string[]
  project_url: string
  status: string
  featured: boolean
}

export default function CompanyPortfolioPage() {
  const { id } = useParams()
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    client_name: '',
    project_value: 0,
    start_date: '',
    end_date: '',
    location: '',
    images: [''],
    tags: [''],
    project_url: '',
    status: 'completed',
    featured: false
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return

      try {
        // Загружаем текущего пользователя
        const userResult = await getCurrentUser()
        
        // Загружаем информацию о компании
        const companyResult = await getCompany(id as string)
        
        if (companyResult.data) {
          setCompanyName(companyResult.data.name)
          
          // Проверяем, является ли текущий пользователь владельцем компании
          if (userResult.user && companyResult.data.owner_id === userResult.user.id) {
            setIsOwner(true)
          }
        }

        // Загружаем портфолио
        const portfolioResult = await getCompanyPortfolio(id as string)
        if (portfolioResult.data) {
          setPortfolio(portfolioResult.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const cleanedData = {
        ...formData,
        company_id: id as string,
        images: formData.images.filter(img => img.trim() !== ''),
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        project_value: formData.project_value || undefined
      }

      if (editingItem) {
        await updatePortfolioItem(editingItem.id, cleanedData)
      } else {
        await addPortfolioItem(cleanedData)
      }

      // Refresh portfolio
      const { data } = await getCompanyPortfolio(id as string)
      if (data) setPortfolio(data)
      
      setShowForm(false)
      setEditingItem(null)
      setFormData({
        title: '',
        description: '',
        category: '',
        client_name: '',
        project_value: 0,
        start_date: '',
        end_date: '',
        location: '',
        images: [''],
        tags: [''],
        project_url: '',
        status: 'completed',
        featured: false
      })
    } catch (error) {
      console.error('Error saving portfolio item:', error)
    }
  }

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title || '',
      description: item.description || '',
      category: item.category || '',
      client_name: item.client_name || '',
      project_value: item.project_value || 0,
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      location: item.location || '',
      images: item.images?.length ? item.images : [''],
      tags: item.tags?.length ? item.tags : [''],
      project_url: item.project_url || '',
      status: item.status || 'completed',
      featured: item.featured || false
    })
    setShowForm(true)
  }

  const handleDelete = async (itemId: string) => {
    if (confirm('Вы уверены, что хотите удалить этот проект?')) {
      try {
        await deletePortfolioItem(itemId)
        setPortfolio(portfolio.filter(item => item.id !== itemId))
      } catch (error) {
        console.error('Error deleting portfolio item:', error)
      }
    }
  }

  const handleArrayFieldChange = (field: 'images' | 'tags', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const addArrayField = (field: 'images' | 'tags') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayField = (field: 'images' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Портфолио {companyName ? `компании "${companyName}"` : 'компании'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isOwner ? 'Управление проектами в портфолио' : 'Проекты компании'}
          </p>
        </div>
        <div className="space-x-3">
          <Link
            href={`/companies/${id}`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Назад к профилю
          </Link>
          {isOwner && (
          <Link
            href={`/companies/${id}/portfolio/add`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block text-center"
          >
            Добавить проект
          </Link>
          )}
        </div>
      </div>

      {/* Список проектов */}
      {portfolio.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {item.images && item.images.length > 0 && (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  {item.featured && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-full">
                      Рекомендуемый
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  {item.category && <p>Категория: {item.category}</p>}
                  {item.client_name && <p>Клиент: {item.client_name}</p>}
                  {item.location && <p>Местоположение: {item.location}</p>}
                  {item.project_value && (
                    <p className="text-green-600 font-medium">
                      {item.project_value.toLocaleString('ru-RU')} ₽
                    </p>
                  )}
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 px-2 py-1 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {item.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{item.tags.length - 3}</span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.status === 'completed' ? 'bg-green-100 text-green-800' :
                    item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {item.status === 'completed' ? 'Завершен' :
                     item.status === 'in_progress' ? 'В работе' : 'Черновик'}
                  </span>
                  
                  {isOwner && (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Удалить
                    </button>
                  </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Портфолио пусто</h3>
            <p className="text-gray-500 mb-4">
              {isOwner 
                ? 'Начните добавлять проекты, чтобы продемонстрировать работу компании' 
                : 'У компании пока нет проектов в портфолио'
              }
            </p>
            {isOwner && (
            <Link
              href={`/companies/${id}/portfolio/add`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Добавить первый проект
            </Link>
            )}
          </div>
        </div>
      )}

      {/* Модальное окно формы - только для владельца */}
      {showForm && isOwner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 my-8">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? 'Редактировать проект' : 'Добавить проект'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название проекта *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Категория
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Выберите категорию</option>
                    <option value="residential">Жилые здания</option>
                    <option value="commercial">Коммерческие здания</option>
                    <option value="industrial">Промышленные объекты</option>
                    <option value="infrastructure">Инфраструктура</option>
                    <option value="renovation">Реконструкция</option>
                    <option value="interior">Интерьер</option>
                    <option value="landscape">Ландшафт</option>
                    <option value="other">Другое</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Статус
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="completed">Завершен</option>
                    <option value="in_progress">В работе</option>
                    <option value="draft">Черновик</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Клиент
                  </label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Местоположение
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Стоимость проекта (₽)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.project_value || ''}
                    onChange={(e) => setFormData({...formData, project_value: Number(e.target.value)})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата начала
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дата завершения
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL проекта
                  </label>
                  <input
                    type="url"
                    value={formData.project_url}
                    onChange={(e) => setFormData({...formData, project_url: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание проекта
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Изображения */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL изображений
                </label>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => handleArrayFieldChange('images', index, e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                      {formData.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('images', index)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('images')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Добавить изображение
                  </button>
                </div>
              </div>

              {/* Теги */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Теги
                </label>
                <div className="space-y-2">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={tag}
                        onChange={(e) => handleArrayFieldChange('tags', index, e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Например: современный дизайн"
                      />
                      {formData.tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField('tags', index)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayField('tags')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Добавить тег
                  </button>
                </div>
              </div>

              {/* Рекомендуемый проект */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                  Отображать как рекомендуемый проект
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingItem(null)
                    setFormData({
                      title: '',
                      description: '',
                      category: '',
                      client_name: '',
                      project_value: 0,
                      start_date: '',
                      end_date: '',
                      location: '',
                      images: [''],
                      tags: [''],
                      project_url: '',
                      status: 'completed',
                      featured: false
                    })
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingItem ? 'Сохранить изменения' : 'Добавить проект'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}