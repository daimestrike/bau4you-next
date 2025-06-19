'use client'

import { useState } from 'react'
import { applyToTender } from '@/lib/supabase'

interface ApplyToTenderFormProps {
  tenderId: string
}

export function ApplyToTenderForm({ tenderId }: ApplyToTenderFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [proposal, setProposal] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await applyToTender(tenderId, proposal)
      
      if (error) {
        throw error
      }

      setSuccess(true)
      setProposal('')
      setIsOpen(false)
    } catch (err: unknown) {
      const error = err as Error
      setError(error.message || 'Произошла ошибка при подаче заявки')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Заявка отправлена!</h3>
          <p className="text-gray-600">Ваша заявка успешно отправлена заказчику. Ожидайте ответа.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Подать заявку</h2>
      
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Откликнуться на тендер
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="proposal" className="block text-sm font-medium text-gray-700 mb-1">
              Ваше предложение *
            </label>
            <textarea
              id="proposal"
              required
              rows={4}
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Опишите ваш опыт, подход к выполнению работ, сроки и другие важные детали..."
            />
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                setError(null)
                setProposal('')
              }}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading || !proposal.trim()}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Отправка...' : 'Отправить заявку'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}