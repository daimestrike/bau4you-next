'use client'

import Link from 'next/link'
import { LucideIcon } from 'lucide-react'

interface QuickAction {
  title: string
  description: string
  icon: LucideIcon
  href?: string
  onClick?: () => void
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo'
  enabled: boolean
}

interface QuickActionsProps {
  actions: QuickAction[]
  title: string
  className?: string
}

export default function QuickActions({ actions, title, className = '' }: QuickActionsProps) {
  const colorClasses = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      hover: 'hover:from-blue-600 hover:to-blue-700',
      icon: 'bg-blue-500/20 text-blue-600',
      border: 'border-blue-200/50'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      hover: 'hover:from-green-600 hover:to-green-700',
      icon: 'bg-green-500/20 text-green-600',
      border: 'border-green-200/50'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      hover: 'hover:from-purple-600 hover:to-purple-700',
      icon: 'bg-purple-500/20 text-purple-600',
      border: 'border-purple-200/50'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      hover: 'hover:from-orange-600 hover:to-orange-700',
      icon: 'bg-orange-500/20 text-orange-600',
      border: 'border-orange-200/50'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      hover: 'hover:from-red-600 hover:to-red-700',
      icon: 'bg-red-500/20 text-red-600',
      border: 'border-red-200/50'
    },
    indigo: {
      bg: 'from-indigo-500 to-indigo-600',
      hover: 'hover:from-indigo-600 hover:to-indigo-700',
      icon: 'bg-indigo-500/20 text-indigo-600',
      border: 'border-indigo-200/50'
    }
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mr-3"></div>
        {title}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon
          const colors = colorClasses[action.color]
          
          const content = (
            <div className={`
              group relative p-5 rounded-2xl transition-all duration-300
              ${action.enabled 
                ? `glass-card hover-glass border ${colors.border} hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl`
                : 'glass-card border border-gray-200/50 cursor-not-allowed opacity-60'
              }
            `}>
              {/* Gradient background on hover */}
              {action.enabled && (
                <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
              )}
              
              <div className="relative z-10 flex items-start space-x-4">
                <div className={`
                  w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                  ${action.enabled 
                    ? `${colors.icon} group-hover:scale-110` 
                    : 'bg-gray-200/50 text-gray-400'
                  }
                `}>
                  <Icon className="w-6 h-6" />
                </div>
                
                <div className="flex-1">
                  <h4 className={`
                    font-semibold text-base mb-1 transition-colors duration-300
                    ${action.enabled 
                      ? 'text-gray-900 group-hover:text-gray-800' 
                      : 'text-gray-500'
                    }
                  `}>
                    {action.title}
                  </h4>
                  <p className={`
                    text-sm leading-relaxed
                    ${action.enabled 
                      ? 'text-gray-600 group-hover:text-gray-700' 
                      : 'text-gray-400'
                    }
                  `}>
                    {action.description}
                  </p>
                </div>
                
                {action.enabled && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Shine effect */}
              {action.enabled && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              )}
            </div>
          )
          
          if (!action.enabled) {
            return (
              <div key={index}>
                {content}
              </div>
            )
          }

          if (action.onClick) {
            return (
              <button key={index} onClick={action.onClick} className="w-full text-left">
                {content}
              </button>
            )
          }

          if (action.href) {
            return (
              <Link key={index} href={action.href}>
                {content}
              </Link>
            )
          }

          return (
            <div key={index}>
              {content}
            </div>
          )
        })}
      </div>
    </div>
  )
} 