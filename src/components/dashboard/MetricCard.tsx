'use client'

import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: LucideIcon
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
}

export default function MetricCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  color = 'blue'
}: MetricCardProps) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500/20 to-blue-600/20',
      icon: 'text-blue-600',
      iconBg: 'bg-blue-500/20',
      border: 'border-blue-200/30'
    },
    green: {
      bg: 'from-green-500/20 to-green-600/20',
      icon: 'text-green-600',
      iconBg: 'bg-green-500/20',
      border: 'border-green-200/30'
    },
    purple: {
      bg: 'from-purple-500/20 to-purple-600/20',
      icon: 'text-purple-600',
      iconBg: 'bg-purple-500/20',
      border: 'border-purple-200/30'
    },
    orange: {
      bg: 'from-orange-500/20 to-orange-600/20',
      icon: 'text-orange-600',
      iconBg: 'bg-orange-500/20',
      border: 'border-orange-200/30'
    },
    red: {
      bg: 'from-red-500/20 to-red-600/20',
      icon: 'text-red-600',
      iconBg: 'bg-red-500/20',
      border: 'border-red-200/30'
    },
    indigo: {
      bg: 'from-indigo-500/20 to-indigo-600/20',
      icon: 'text-indigo-600',
      iconBg: 'bg-indigo-500/20',
      border: 'border-indigo-200/30'
    }
  }

  const changeClasses = {
    positive: 'text-green-600 bg-green-50/80',
    negative: 'text-red-600 bg-red-50/80',
    neutral: 'text-gray-600 bg-gray-50/80'
  }

  return (
    <div className="group relative">
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color].bg} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      
      {/* Main card */}
      <div className={`relative glass-card hover-glass rounded-2xl p-6 border ${colorClasses[color].border} transition-all duration-300 group-hover:scale-[1.02]`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {change && (
              <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${changeClasses[changeType]}`}>
                {changeType === 'positive' && (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                  </svg>
                )}
                {changeType === 'negative' && (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                  </svg>
                )}
                {change}
              </div>
            )}
          </div>
          
          <div className={`relative p-3 ${colorClasses[color].iconBg} rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-6 h-6 ${colorClasses[color].icon}`} />
            
            {/* Glow effect */}
            <div className={`absolute inset-0 ${colorClasses[color].iconBg} rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300`}></div>
          </div>
        </div>
        
        {/* Shine effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
      </div>
    </div>
  )
} 