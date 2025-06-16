'use client'

import { Clock, User, Building, FileText } from 'lucide-react'
import Link from 'next/link'

interface ActivityItem {
  id: string
  title: string
  type: 'project' | 'tender' | 'application' | 'company' | 'product'
  status?: string
  created_at: string
  description?: string
  href?: string
}

interface RecentActivityProps {
  items: ActivityItem[]
  title: string
  className?: string
  viewAllHref?: string
  viewAllText?: string
}

const getIcon = (type: string) => {
  switch (type) {
    case 'project':
      return Building
    case 'tender':
      return FileText
    case 'application':
      return User
    case 'company':
      return Building
    case 'product':
      return FileText
    default:
      return Clock
  }
}

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'published':
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'pending':
    case 'draft':
      return 'bg-yellow-100 text-yellow-800'
    case 'completed':
    case 'closed':
      return 'bg-blue-100 text-blue-800'
    case 'rejected':
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Сегодня'
  if (days === 1) return 'Вчера'
  if (days < 7) return `${days} дн. назад`
  return date.toLocaleDateString('ru-RU')
}

export default function RecentActivity({ items, title, className = '', viewAllHref, viewAllText = 'Просмотреть все' }: RecentActivityProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {viewAllHref && (
          <Link 
            href={viewAllHref}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            {viewAllText} →
          </Link>
        )}
      </div>
      
      {items.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Нет недавней активности</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const Icon = getIcon(item.type)
            const content = (
              <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="flex items-center mt-2 space-x-2">
                    {item.status && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )
            
            return item.href ? (
              <Link key={item.id} href={item.href} className="block">
                {content}
              </Link>
            ) : (
              <div key={item.id}>
                {content}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
} 