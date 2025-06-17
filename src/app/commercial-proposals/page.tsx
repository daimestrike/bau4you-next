'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  FileText, 
  Plus, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Edit3, 
  Trash2, 
  Eye,
  Calendar,
  FileSpreadsheet,
  ArrowLeft,
  StickyNote,
  AlertCircle
} from 'lucide-react'
import { 
  getCommercialProposals, 
  createCommercialProposal, 
  updateCommercialProposal,
  deleteCommercialProposal,
  uploadCommercialProposalFile,
  updateCommercialProposalNote,
  getCurrentUser,
} from '@/lib/supabase'

interface CommercialProposal {
  id: string
  title: string
  type: 'created' | 'uploaded'
  proposal_data?: any
  file_name?: string
  file_url?: string
  file_size?: number
  note?: string
  created_at: string
  updated_at: string
  user_id: string
}

export default function CommercialProposalsPage() {
  const router = useRouter()
  
  // Добавим состояние для отслеживания аутентификации
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking')
  
  const [proposals, setProposals] = useState<CommercialProposal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'created' | 'uploaded'>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [selectedProposal, setSelectedProposal] = useState<CommercialProposal | null>(null)
  const [noteText, setNoteText] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const checkAuthAndLoadProposals = async () => {
    try {
      console.log('🔍 CHECKING AUTHENTICATION STATUS')
      
      // Используем клиентскую проверку Supabase вместо серверного API
      const { user, error } = await getCurrentUser()
      
      console.log('👤 Auth status:', { 
        hasUser: !!user, 
        userId: user?.id, 
        userEmail: user?.email,
        error: error?.message 
      })
      
      if (user) {
        console.log('✅ User is authenticated:', user.email)
        setAuthStatus('authenticated')
        
        // Загружаем предложения
        const result = await getCommercialProposals()
        if (result.error) {
          setError(result.error.message)
        } else {
          setProposals(result.data || [])
        }
      } else {
        console.log('❌ User is not authenticated')
        setAuthStatus('unauthenticated')
        setError('Необходима авторизация для просмотра коммерческих предложений')
      }
    } catch (err) {
      console.error('Error loading proposals:', err)
      setError('Ошибка при загрузке данных')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuthAndLoadProposals()
  }, [])

  const handleUpload = async () => {
    if (!uploadFile) return

    try {
      setUploading(true)
      
      // Загружаем файл
      const { data: fileData, error: uploadError } = await uploadCommercialProposalFile(uploadFile)
      if (uploadError) {
        console.error('Upload error:', uploadError)
        return
      }

      // Создаем запись в базе
      const { data, error } = await createCommercialProposal({
        title: uploadFile.name.replace(/\.[^/.]+$/, ''),
        type: 'uploaded',
        file_name: fileData?.file_name,
        file_url: fileData?.file_url,
        file_size: fileData?.file_size
      })

      if (error) {
        console.error('Error creating proposal:', error)
      } else {
        await checkAuthAndLoadProposals()
        setShowUploadModal(false)
        setUploadFile(null)
      }
    } catch (error) {
      console.error('Error uploading:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить коммерческое предложение?')) return

    try {
      const { error } = await deleteCommercialProposal(id)
      if (error) {
        console.error('Error deleting proposal:', error)
      } else {
        await checkAuthAndLoadProposals()
      }
    } catch (error) {
      console.error('Error deleting proposal:', error)
    }
  }

  const handleUpdateNote = async () => {
    if (!selectedProposal) {
      console.error('❌ No selected proposal')
      return
    }

    try {
      console.log('🔍 Starting note update for proposal:', selectedProposal.id, 'Note:', noteText)
      console.log('🔍 Note text length:', noteText.length)
      
      const result = await updateCommercialProposalNote(selectedProposal.id, noteText)
      console.log('🔍 Function result:', result)
      
      if (result.error) {
        console.error('❌ Error updating note:', result.error)
        alert('Ошибка при сохранении заметки: ' + (result.error.message || JSON.stringify(result.error)))
        return
      }
      
      if (result.data) {
        console.log('✅ Note update successful:', result.data)
        console.log('🔄 Refreshing proposals list...')
        await checkAuthAndLoadProposals()
        setShowNoteModal(false)
        setSelectedProposal(null)
        setNoteText('')
        console.log('✅ UI updated and modal closed')
      } else {
        console.error('❌ No data returned from update')
        alert('Ошибка: нет данных от сервера')
      }
    } catch (error) {
      console.error('❌ Caught error updating note:', error)
      alert('Ошибка при сохранении заметки: ' + (error instanceof Error ? error.message : 'Неизвестная ошибка'))
    }
  }

  const openNoteModal = (proposal: CommercialProposal) => {
    setSelectedProposal(proposal)
    setNoteText(proposal.note || '')
    setShowNoteModal(true)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (proposal.note && proposal.note.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterType === 'all' || proposal.type === filterType
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка коммерческих предложений...</p>
        </div>
      </div>
    )
  }

  if (authStatus === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Требуется авторизация</h2>
          <p className="text-gray-600 mb-6">Для просмотра коммерческих предложений необходимо авторизоваться</p>
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            Войти в систему
          </Link>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ошибка загрузки</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => checkAuthAndLoadProposals()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Назад к дашборду</span>
            </Link>
            <div className="w-px h-6 bg-gray-300"></div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                Коммерческие предложения
              </h1>
              <p className="text-gray-600 mt-1">
                Управление коммерческими предложениями
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Upload className="w-4 h-4" />
              Загрузить файл
            </button>
            <Link
              href="/commercial-proposal"
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <Plus className="w-4 h-4" />
              Создать КП
            </Link>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по названию или заметкам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="pl-10 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Все типы</option>
                <option value="created">Созданные</option>
                <option value="uploaded">Загруженные</option>
              </select>
            </div>
          </div>
        </div>

        {/* Proposals Grid */}
        {filteredProposals.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' ? 'Ничего не найдено' : 'Нет коммерческих предложений'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterType !== 'all' 
                ? 'Попробуйте изменить параметры поиска'
                : 'Создайте первое коммерческое предложение или загрузите готовый файл'
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <Link
                href="/commercial-proposal"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-4 h-4" />
                Создать первое КП
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProposals.map((proposal) => (
              <div key={proposal.id} className="glass-card rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      proposal.type === 'created' 
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                        : 'bg-gradient-to-br from-green-500 to-teal-600'
                    }`}>
                      {proposal.type === 'created' ? (
                        <FileText className="w-5 h-5 text-white" />
                      ) : (
                        <FileSpreadsheet className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {proposal.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-lg ${
                          proposal.type === 'created'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {proposal.type === 'created' ? 'Создано' : 'Загружено'}
                        </span>
                        {proposal.note && (
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" title="Есть заметка"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {proposal.file_size && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Download className="w-4 h-4" />
                    <span>{formatFileSize(proposal.file_size)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(proposal.created_at)}</span>
                </div>

                {proposal.note && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {proposal.note}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  {proposal.type === 'created' ? (
                    <Link
                      href={`/commercial-proposal?edit=${proposal.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                      Редактировать
                    </Link>
                  ) : (
                    <a
                      href={proposal.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Просмотр
                    </a>
                  )}
                  
                  <button
                    onClick={() => openNoteModal(proposal)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    title="Добавить/редактировать заметку"
                  >
                    <StickyNote className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(proposal.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Загрузить файл КП
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Выберите файл
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Поддерживаются форматы: PDF, DOC, DOCX, XLS, XLSX
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      setUploadFile(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={uploading}
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!uploadFile || uploading}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Загрузка...' : 'Загрузить'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Note Modal */}
        {showNoteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Заметка к КП
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Текст заметки
                  </label>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    rows={4}
                    placeholder="Введите заметку..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowNoteModal(false)
                      setSelectedProposal(null)
                      setNoteText('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleUpdateNote}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Сохранить
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 