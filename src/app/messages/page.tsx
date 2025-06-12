'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, supabase } from '@/lib/supabase'
interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  tender_id?: string
  project_id?: string
  is_read: boolean
  created_at: string
}

interface Conversation {
  userId: string
  fullName: string
  avatarUrl?: string
  lastMessage: string
  lastMessageDate: string
  unreadCount: number
}

interface MessageWithUser extends Message {
  profiles: {
    name_first?: string
    name_last?: string
    avatar_url?: string
  }
}

export default function MessagesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<MessageWithUser[]>([])
  const [newMessage, setNewMessage] = useState('')

  // Загрузка текущего пользователя
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const { user, error } = await getCurrentUser()
        if (error) throw error
        if (!user) {
          router.push('/login?redirect=/messages')
          return
        }
        setCurrentUser(user)
        loadConversations(user.id)
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки пользователя')
      }
    }

    loadCurrentUser()
  }, [])

  // Загрузка списка диалогов
  const loadConversations = async (userId: string) => {
    setIsLoading(true)
    try {
      // Получаем все сообщения, где пользователь является отправителем или получателем
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!sender_id(*)
        `)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (messagesError) throw messagesError

      // Группируем сообщения по собеседникам
      const conversationsMap = new Map<string, Conversation>()

      messagesData?.forEach((message: any) => {
        const otherUserId = message.sender_id === userId ? message.recipient_id : message.sender_id
        
        // Пропускаем, если это сообщение от системы или уже обработали этого пользователя
        if (otherUserId === 'system') return

        if (!conversationsMap.has(otherUserId)) {
          // Получаем данные о собеседнике
          const otherUserProfile = message.profiles || {}
          
          conversationsMap.set(otherUserId, {
            userId: otherUserId,
            fullName: `${otherUserProfile.name_first || ''} ${otherUserProfile.name_last || ''}`.trim() || 'Пользователь',
            avatarUrl: otherUserProfile.avatar_url,
            lastMessage: message.content,
            lastMessageDate: message.created_at,
            unreadCount: message.recipient_id === userId && !message.read ? 1 : 0
          })
        } else if (message.recipient_id === userId && !message.read) {
          // Увеличиваем счетчик непрочитанных сообщений
          const conversation = conversationsMap.get(otherUserId)!
          conversation.unreadCount += 1
          conversationsMap.set(otherUserId, conversation)
        }
      })

      setConversations(Array.from(conversationsMap.values()))

      // Если есть диалоги, выбираем первый по умолчанию
      if (conversationsMap.size > 0 && !selectedConversation) {
        const firstConversationId = conversationsMap.keys().next().value
        setSelectedConversation(firstConversationId || null)
        if (firstConversationId) loadMessages(userId, firstConversationId)
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки диалогов')
    } finally {
      setIsLoading(false)
    }
  }

  // Загрузка сообщений для выбранного диалога
  const loadMessages = async (userId: string, otherUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!sender_id(*)
        `)
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])

      // Отмечаем сообщения как прочитанные
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('recipient_id', userId)
        .eq('sender_id', otherUserId)

      // Обновляем счетчик непрочитанных сообщений
      setConversations(prev => 
        prev.map(conv => 
          conv.userId === otherUserId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      )
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки сообщений')
    }
  }

  // Отправка нового сообщения
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || !currentUser) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser.id,
          recipient_id: selectedConversation,
          content: newMessage.trim(),
          read: false
        })
        .select()

      if (error) throw error

      // Добавляем новое сообщение в список
      if (data && data[0]) {
        const newMessageWithUser = {
          ...data[0],
          profiles: {
            name_first: currentUser.user_metadata?.name_first || currentUser.user_metadata?.full_name?.split(' ')[0] || 'Вы',
        name_last: currentUser.user_metadata?.name_last || currentUser.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
            avatar_url: currentUser.user_metadata?.avatar_url
          }
        }
        setMessages(prev => [...prev, newMessageWithUser])
      }

      // Обновляем последнее сообщение в списке диалогов
      setConversations(prev => 
        prev.map(conv => 
          conv.userId === selectedConversation 
            ? { 
                ...conv, 
                lastMessage: newMessage.trim(),
                lastMessageDate: new Date().toISOString()
              }
            : conv
        )
      )

      // Очищаем поле ввода
      setNewMessage('')
    } catch (err: any) {
      setError(err.message || 'Ошибка отправки сообщения')
    }
  }

  // Выбор диалога
  const selectConversation = (userId: string) => {
    setSelectedConversation(userId)
    if (currentUser) {
      loadMessages(currentUser.id, userId)
    }
  }

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date >= today) {
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    } else if (date >= yesterday) {
      return 'Вчера'
    } else {
      return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
    }
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Сообщения</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex h-[calc(80vh-100px)]">
          {/* Список диалогов */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map(conversation => (
                <div 
                  key={conversation.userId}
                  onClick={() => selectConversation(conversation.userId)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedConversation === conversation.userId ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                      {conversation.avatarUrl ? (
                        <img 
                          src={conversation.avatarUrl} 
                          alt={conversation.fullName} 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <span>{conversation.fullName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-medium text-gray-900 truncate">{conversation.fullName}</h3>
                        <span className="text-xs text-gray-500">{formatDate(conversation.lastMessageDate)}</span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="ml-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                У вас пока нет сообщений
              </div>
            )}
          </div>

          {/* Окно сообщений */}
          <div className="w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Заголовок с именем собеседника */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  {conversations.find(c => c.userId === selectedConversation)?.avatarUrl ? (
                    <img 
                      src={conversations.find(c => c.userId === selectedConversation)?.avatarUrl} 
                      alt="Avatar" 
                      className="h-8 w-8 rounded-full object-cover mr-2"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-2">
                      <span>{(conversations.find(c => c.userId === selectedConversation)?.fullName || '?').charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  <h2 className="text-lg font-medium">
                    {conversations.find(c => c.userId === selectedConversation)?.fullName}
                  </h2>
                </div>

                {/* Сообщения */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length > 0 ? (
                    messages.map(message => (
                      <div 
                        key={message.id}
                        className={`flex ${message.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${message.sender_id === currentUser?.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}
                        >
                          <p>{message.content}</p>
                          <div className={`text-xs mt-1 ${message.sender_id === currentUser?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                            {formatDate(message.created_at)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      Начните диалог, отправив сообщение
                    </div>
                  )}
                </div>

                {/* Форма отправки сообщения */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={sendMessage} className="flex">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Введите сообщение..."
                      className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Отправить
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Выберите диалог из списка слева
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}