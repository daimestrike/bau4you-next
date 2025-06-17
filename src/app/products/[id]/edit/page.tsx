'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getProduct, updateProduct, supabase } from '@/lib/supabase'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

interface ProductFormData {
  name: string
  description: string
  price: string
  stock_quantity: string
  category: string
  unit: string
  images: string[]
  status: string
}

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EditProductPage({ params }: ProductPageProps) {
  const router = useRouter()
  const [productId, setProductId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: '',
    unit: 'шт',
    images: [],
    status: 'active'
  })

  useEffect(() => {
    params.then(resolved => {
      setProductId(resolved.id)
      loadProduct(resolved.id)
    })
  }, [])

  const loadProduct = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Необходима авторизация')
        return
      }

      const { data: product, error } = await getProduct(id)

      if (error || !product) {
        setError('Товар не найден')
        return
      }

      // Проверяем, является ли пользователь владельцем товара
      if (product.seller_id !== user.id) {
        setError('У вас нет прав для редактирования этого товара')
        return
      }

      setIsOwner(true)
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        category: product.category || '',
        unit: product.unit || 'шт',
        images: product.images || [],
        status: product.status || 'active'
      })
    } catch {
      setError('Ошибка загрузки товара')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageAdd = () => {
    const url = prompt('Введите URL изображения:')
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url.trim()]
      }))
    }
  }

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Необходима авторизация')
        return
      }

      // Валидация
      if (!formData.name.trim()) {
        setError('Название товара обязательно')
        return
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        setError('Цена должна быть больше 0')
        return
      }

      if (!formData.category) {
        setError('Категория обязательна')
        return
      }

      const updateData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        category: formData.category,
        unit: formData.unit,
        images: formData.images,
        status: formData.status
      }

      const { error } = await updateProduct(productId, updateData)

      if (error) {
        setError(error.message)
      } else {
        router.push('/orders/my-products')
      }
    } catch {
      setError('Ошибка сохранения товара')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error && !isOwner) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ошибка доступа</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/orders/my-products"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Вернуться к товарам
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/orders/my-products"
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center gap-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Назад к товарам
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Редактировать товар</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Название */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Название товара *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Введите название товара"
          />
        </div>

        {/* Описание */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Опишите ваш товар"
          />
        </div>

        {/* Категория */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Категория *
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleInputChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Выберите категорию</option>
            <option value="building_materials">Строительные материалы</option>
            <option value="tools">Инструменты</option>
            <option value="equipment">Оборудование</option>
            <option value="plumbing">Сантехника</option>
            <option value="electrical">Электрика</option>
            <option value="finishing_materials">Отделочные материалы</option>
            <option value="furniture">Мебель</option>
            <option value="roofing">Кровельные материалы</option>
            <option value="insulation">Утеплители</option>
            <option value="windows_doors">Окна и двери</option>
            <option value="other">Другое</option>
          </select>
        </div>

        {/* Цена и единица измерения */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Цена *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
            />
            <p className="text-sm text-gray-500 mt-1">
              Укажите 0, если цена предоставляется по запросу
            </p>
          </div>

          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
              Единица измерения
            </label>
            <input
              type="text"
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="шт, кг, м, м²"
            />
          </div>
        </div>

        {/* Количество в наличии */}
        <div>
          <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-2">
            Количество в наличии
          </label>
          <input
            type="number"
            id="stock_quantity"
            name="stock_quantity"
            min="0"
            value={formData.stock_quantity}
            onChange={handleInputChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="0"
          />
        </div>

        {/* Статус */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Статус
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="active">Активен</option>
            <option value="inactive">Неактивен</option>
          </select>
        </div>

        {/* Изображения */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Изображения
          </label>
          <div className="space-y-2">
            {formData.images.map((image, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <img src={`/api/image-proxy?url=${encodeURIComponent(image)}`} alt={`Изображение ${index + 1}`} className="w-16 h-16 object-cover rounded" />
                <span className="flex-1 text-sm text-gray-600 truncate">{image}</span>
                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Удалить
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleImageAdd}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              + Добавить изображение
            </button>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Сохранение...' : 'Сохранить изменения'}
          </button>
          
          <Link
            href="/orders/my-products"
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors text-center"
          >
            Отмена
          </Link>
        </div>
      </form>
    </main>
  )
}