'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, UserPlus, X } from 'lucide-react'
import { getCurrentUser, supabase, addTeamMember } from '@/lib/supabase'

interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  phone?: string
}

interface TeamMemberData {
  email: string
  position: string
  bio: string
  is_key_person: boolean
}

export default function AddTeamMemberPage() {
  const router = useRouter()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [foundUser, setFoundUser] = useState<User | null>(null)
  const [searchEmail, setSearchEmail] = useState('')
  
  const [formData, setFormData] = useState<TeamMemberData>({
    email: '',
    position: '',
    bio: '',
    is_key_person: false
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { user } = await getCurrentUser()
      if (!user) {
        router.push('/login')
        return
      }
      setCurrentUser(user)

      // Проверяем, является ли пользователь владельцем компании
      const { data: company, error } = await supabase
        .from('companies')
        .select('owner_id')
        .eq('id', id)
        .single()

      if (error || !company) {
        setError('Компания не найдена')
        return
      }

      if (company.owner_id !== user.id) {
        setError('У вас нет прав для добавления сотрудников в эту компанию')
        return
      }

      setIsOwner(true)
    } catch (err) {
      console.error('Auth error:', err)
      setError('Ошибка авторизации')
    }
  }

  const searchUserByEmail = async () => {
    if (!searchEmail.trim()) {
      setError('Введите email для поиска')
      return
    }

    setIsSearching(true)
    setError(null)
    setFoundUser(null)

    try {
      // Ищем пользователя по email в таблице profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, phone')
        .eq('email', searchEmail.trim().toLowerCase())
        .single()

      if (profileError || !profile) {
        setError('Пользователь с таким email не найден на платформе')
        return
      }

      // Проверяем, не является ли пользователь уже членом команды
      const { data: existingMember, error: memberError } = await supabase
        .from('company_team')
        .select('id')
        .eq('company_id', id)
        .eq('user_id', profile.id)
        .eq('is_active', true)
        .single()

      if (existingMember) {
        setError('Этот пользователь уже является членом команды')
        return
      }

      setFoundUser(profile)
      setFormData(prev => ({ ...prev, email: profile.email }))
    } catch (err) {
      console.error('Search error:', err)
      setError('Ошибка при поиске пользователя')
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!foundUser) {
      setError('Сначала найдите пользователя по email')
      return
    }

    if (!formData.position.trim()) {
      setError('Укажите должность сотрудника')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const teamMemberData = {
        company_id: id as string,
        user_id: foundUser.id,
        name: foundUser.full_name || foundUser.email,
        position: formData.position.trim(),
        bio: formData.bio.trim(),
        avatar_url: foundUser.avatar_url,
        email: foundUser.email,
        phone: foundUser.phone,
        is_key_person: formData.is_key_person,
        joined_date: new Date().toISOString(),
        is_active: true
      }

      const { error: addError } = await addTeamMember(teamMemberData)
      
      if (addError) {
        throw addError
      }

      setSuccess('Сотрудник успешно добавлен в команду!')
      
      // Перенаправляем обратно на страницу компании через 2 секунды
      setTimeout(() => {
        router.push(`/companies/${id}?tab=team`)
      }, 2000)
      
    } catch (err: any) {
      console.error('Add member error:', err)
      setError(err.message || 'Ошибка при добавлении сотрудника')
    } finally {
      setIsLoading(false)
    }
  }

  const clearSearch = () => {
    setFoundUser(null)
    setSearchEmail('')
    setFormData(prev => ({ ...prev, email: '' }))
    setError(null)
  }

  if (!isOwner && !error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <Link
            href={`/companies/${id}?tab=team`}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к команде
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Добавить сотрудника</h1>
          <p className="text-gray-600 mt-2">
            Найдите зарегистрированного пользователя по email и добавьте его в команду
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Поиск пользователя */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Найти пользователя</h2>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email пользователя
                </label>
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSearching || !!foundUser}
                />
              </div>
              <div className="flex items-end">
                {foundUser ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Очистить
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={searchUserByEmail}
                    disabled={isSearching || !searchEmail.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {isSearching ? 'Поиск...' : 'Найти'}
                  </button>
                )}
              </div>
            </div>

            {/* Результат поиска */}
            {foundUser && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mr-4">
                    {foundUser.avatar_url ? (
                      <img
                        src={foundUser.avatar_url}
                        alt={foundUser.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium text-gray-500">
                        {(foundUser.full_name || foundUser.email).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {foundUser.full_name || 'Имя не указано'}
                    </h3>
                    <p className="text-sm text-gray-600">{foundUser.email}</p>
                    {foundUser.phone && (
                      <p className="text-sm text-gray-600">{foundUser.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Форма добавления */}
          {foundUser && (
            <form onSubmit={handleAddMember}>
              <h2 className="text-xl font-semibold mb-4">2. Информация о сотруднике</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Должность *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Например: Менеджер проектов"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_key_person}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_key_person: e.target.checked }))}
                      className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Ключевой сотрудник
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Ключевые сотрудники отображаются первыми в списке команды
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Описание (опционально)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Краткое описание опыта и обязанностей сотрудника"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <Link
                  href={`/companies/${id}?tab=team`}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Отмена
                </Link>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isLoading ? 'Добавление...' : 'Добавить сотрудника'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Информационный блок */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-medium text-blue-900 mb-2">Как это работает:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Пользователь должен быть зарегистрирован на платформе</li>
            <li>• После добавления сотрудник сможет видеть компанию в своем профиле</li>
            <li>• Сотрудник может самостоятельно покинуть команду в любое время</li>
            <li>• Только владелец компании может добавлять новых сотрудников</li>
          </ul>
        </div>
      </div>
    </div>
  )
}