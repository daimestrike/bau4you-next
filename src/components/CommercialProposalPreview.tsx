'use client'

import { forwardRef } from 'react'
import { Download, Settings, Printer, FileType, Save } from 'lucide-react'

interface ProposalItem {
  id: string
  operation: string
  product: string
  quantity: number
  unit: string
  pricePerUnit: number
  totalPrice: number
}

interface AdditionalService {
  id: string
  name: string
  price: number
  addToTotal: boolean
}

interface CompanyInfo {
  logo: string
  name: string
  address: string
  phone: string
  email: string
  website: string
  tax_id: string
}

interface ProposalData {
  companyInfo: CompanyInfo
  header: string
  beforeTable: string
  afterTable: string
  businessCard: string
  items: ProposalItem[]
  additionalServices: AdditionalService[]
  discount: number
  totalArea: number
}

interface CommercialProposalPreviewProps {
  proposalData: ProposalData
  onEdit: () => void
  onPrint: () => void
  onSaveAsPDF: () => void
  onExportToWord: () => void
  onSave?: () => void
}

const CommercialProposalPreview = forwardRef<HTMLDivElement, CommercialProposalPreviewProps>(
  ({ proposalData, onEdit, onPrint, onSaveAsPDF, onExportToWord, onSave }, ref) => {
    const calculateTotal = () => {
      const itemsTotal = proposalData.items.reduce((sum, item) => sum + item.totalPrice, 0)
      const servicesTotal = proposalData.additionalServices
        .filter(service => service.addToTotal)
        .reduce((sum, service) => sum + service.price, 0)
      const subtotal = itemsTotal + servicesTotal
      const total = subtotal - (subtotal * proposalData.discount / 100)
      return { itemsTotal, servicesTotal, subtotal, total }
    }

    const { itemsTotal, servicesTotal, subtotal, total } = calculateTotal()

    return (
      <div className="min-h-screen bg-white">


        {/* Action Bar - hidden when printing */}
        <div className="no-print sticky top-0 bg-white border-b shadow-sm z-10 p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <button
              onClick={onEdit}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Редактировать
            </button>
            <div className="flex space-x-2">
              {onSave && (
                <button
                  onClick={onSave}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                  title="Сохранить предложение"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Сохранить
                </button>
              )}
              <button
                onClick={onPrint}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                title="Печатать только содержимое предложения"
              >
                <Printer className="w-4 h-4 mr-2" />
                Печать
              </button>
              <button
                onClick={onSaveAsPDF}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg hover:shadow-xl"
                title="Сохранить как PDF только содержимое предложения"
              >
                <Download className="w-4 h-4 mr-2" />
                Скачать PDF
              </button>
              <button
                onClick={onExportToWord}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                title="Экспорт в Word для редактирования"
              >
                <FileType className="w-4 h-4 mr-2" />
                Экспорт в Word
              </button>
            </div>
          </div>
        </div>

        {/* Proposal Preview */}
        <div ref={ref} className="max-w-4xl mx-auto p-8 bg-white proposal-print-content">
          {/* Header with Logo */}
          <div className="flex items-start justify-between mb-8 no-page-break">
            <div className="flex items-center space-x-4">
              {proposalData.companyInfo.logo && (
                <img
                  src={proposalData.companyInfo.logo}
                  alt="Company Logo"
                  className="w-20 h-20 object-contain"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {proposalData.companyInfo.name}
                </h1>
                <div className="text-sm text-gray-600 mt-2">
                  <p>{proposalData.companyInfo.address}</p>
                  <p>{proposalData.companyInfo.phone}</p>
                  <p>{proposalData.companyInfo.email}</p>
                  <p>{proposalData.companyInfo.website}</p>
                  <p>{proposalData.companyInfo.tax_id}</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-semibold text-gray-900">
                {proposalData.header}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Дата: {new Date().toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>

          {/* Before Table Text */}
          <div className="mb-8">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {proposalData.beforeTable}
            </div>
          </div>

          {/* Main Table */}
          <div className="mb-8 no-page-break">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">№</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Наименование операции</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Наименование товара</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Количество</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Ед. изм.</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Цена за ед.</th>
                  <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Сумма</th>
                </tr>
              </thead>
              <tbody>
                {proposalData.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{item.operation}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{item.product}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{item.quantity}</td>
                    <td className="border border-gray-300 px-4 py-3 text-sm">{item.unit}</td>
                                  <td className="border border-gray-300 px-4 py-3 text-sm">{item.pricePerUnit.toLocaleString()}</td>
              <td className="border border-gray-300 px-4 py-3 text-sm font-semibold">{item.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Additional Services */}
            {proposalData.additionalServices.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Дополнительные услуги:</h4>
                <div className="space-y-2">
                  {proposalData.additionalServices.map(service => (
                    <div key={service.id} className="flex justify-between items-center py-2 border-b border-gray-200">
                      <span className="text-sm">{service.name}</span>
                      <span className="text-sm font-semibold">
                        {service.price.toLocaleString()}
                        {!service.addToTotal && (
                          <span className="text-xs text-gray-500 ml-2">(отдельно)</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Итого по работам:</span>
                    <span>{itemsTotal.toLocaleString()}</span>
                  </div>
                  {servicesTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Доп. услуги:</span>
                      <span>{servicesTotal.toLocaleString()}</span>
                    </div>
                  )}
                  {proposalData.discount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Скидка ({proposalData.discount}%):</span>
                      <span>-{((subtotal * proposalData.discount) / 100).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>К оплате:</span>
                    <span>{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* After Table Text */}
          <div className="mb-8">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {proposalData.afterTable}
            </div>
          </div>

          {/* Business Card */}
          <div className="border-t pt-8">
            <div className="whitespace-pre-wrap text-sm text-gray-700">
              {proposalData.businessCard}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

CommercialProposalPreview.displayName = 'CommercialProposalPreview'

export default CommercialProposalPreview 