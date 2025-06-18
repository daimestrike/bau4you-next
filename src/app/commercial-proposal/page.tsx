'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  FileText, 
  Download, 
  Upload, 
  Building2, 
  Calculator, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  User,
  Settings,
  Save,
  Eye,
  Printer,
  FileType
} from 'lucide-react'
import CommercialProposalPreview from '@/components/CommercialProposalPreview'
import { printProposal, exportToPDF, exportToWordHTML } from '@/utils/printUtils'

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

function CommercialProposalPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const printRef = useRef<HTMLDivElement>(null)
  
  const mode = searchParams.get('mode') // 'edit' or 'preview'
  
  const [proposalData, setProposalData] = useState<ProposalData>({
    companyInfo: {
      logo: '',
      name: 'Название вашей компании',
      address: 'Адрес компании',
      phone: '+7 (XXX) XXX-XX-XX',
      email: 'info@company.com',
      website: 'www.company.com',
      tax_id: 'ИНН: XXXXXXXXXX'
    },
    header: 'Коммерческое предложение',
    beforeTable: 'Уважаемый заказчик!\n\nПредставляем вашему вниманию коммерческое предложение на выполнение строительных работ.',
    afterTable: 'Все материалы соответствуют ГОСТ и имеют необходимые сертификаты качества.\n\nСроки выполнения работ: 30 рабочих дней.\nГарантия на выполненные работы: 2 года.',
    businessCard: 'С уважением,\nИванов Иван Иванович\nДиректор\n+7 (XXX) XXX-XX-XX\ninfo@company.com',
    items: [
      {
        id: '1',
        operation: 'Укладка плитки',
        product: 'Керамическая плитка 60x60',
        quantity: 100,
        unit: 'м²',
        pricePerUnit: 1500,
        totalPrice: 150000
      }
    ],
    additionalServices: [],
    discount: 0,
    totalArea: 100
  })

  const [isPreviewMode, setIsPreviewMode] = useState(mode === 'preview')
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingProposalId, setEditingProposalId] = useState<string | null>(null)

  // Загрузка данных для редактирования или просмотра
  useEffect(() => {
    const editId = searchParams.get('edit')
    if (editId) {
      // Загружаем предложение из базы данных для редактирования
      loadProposalForEdit(editId)
    } else if (mode === 'preview') {
      const previewData = localStorage.getItem('preview-proposal-data')
      if (previewData) {
        setProposalData(JSON.parse(previewData))
        setIsPreviewMode(true)
        // Очищаем временные данные
        localStorage.removeItem('preview-proposal-data')
      }
    }
  }, [mode, searchParams])

  const loadProposalForEdit = async (id: string) => {
    try {
      // Сначала пытаемся загрузить из Supabase
      const { getCommercialProposals } = await import('@/lib/supabase')
      const { data: proposals } = await getCommercialProposals()
      
      const proposal = proposals?.find((p: any) => p.id === id)
      
      if (proposal && proposal.proposal_data) {
        setProposalData(proposal.proposal_data)
        setEditingProposalId(id)
        setIsEditMode(true)
        return
      }
    } catch (error) {
      console.error('Error loading from Supabase, trying localStorage:', error)
    }
    
    try {
      // Fallback к localStorage
      const userType = localStorage.getItem('userType') || 'contractor'
      const storageKey = `saved-proposals-${userType}`
      const proposals = JSON.parse(localStorage.getItem(storageKey) || '[]')
      const proposal = proposals.find((p: any) => p.id === id)
      
      if (proposal && proposal.proposalData) {
        setProposalData(proposal.proposalData)
        setEditingProposalId(id)
        setIsEditMode(true)
      }
    } catch (error) {
      console.error('Error loading proposal for edit:', error)
    }
  }

  const addItem = () => {
    const newItem: ProposalItem = {
      id: Date.now().toString(),
      operation: '',
      product: '',
      quantity: 1,
      unit: 'м²',
      pricePerUnit: 0,
      totalPrice: 0
    }
    setProposalData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItem = (id: string) => {
    setProposalData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }

  const updateItem = (id: string, field: keyof ProposalItem, value: any) => {
    setProposalData(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === 'quantity' || field === 'pricePerUnit') {
            updatedItem.totalPrice = updatedItem.quantity * updatedItem.pricePerUnit
          }
          return updatedItem
        }
        return item
      })
    }))
  }

  const addService = () => {
    const newService: AdditionalService = {
      id: Date.now().toString(),
      name: '',
      price: 0,
      addToTotal: true
    }
    setProposalData(prev => ({
      ...prev,
      additionalServices: [...prev.additionalServices, newService]
    }))
  }

  const removeService = (id: string) => {
    setProposalData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.filter(service => service.id !== id)
    }))
  }

  const updateService = (id: string, field: keyof AdditionalService, value: any) => {
    setProposalData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.map(service =>
        service.id === id ? { ...service, [field]: value } : service
      )
    }))
  }

  const calculateTotal = () => {
    const itemsTotal = proposalData.items.reduce((sum, item) => sum + item.totalPrice, 0)
    const servicesTotal = proposalData.additionalServices
      .filter(service => service.addToTotal)
      .reduce((sum, service) => sum + service.price, 0)
    const subtotal = itemsTotal + servicesTotal
    const total = subtotal - (subtotal * proposalData.discount / 100)
    return { itemsTotal, servicesTotal, subtotal, total }
  }

  const handlePrint = () => {
    const title = `Коммерческое предложение - ${proposalData.companyInfo.name}`
    printProposal(title)
  }

  const handleSaveAsPDF = () => {
    const title = `Коммерческое предложение - ${proposalData.companyInfo.name}`
    exportToPDF(title)
  }

  const handleExportToWord = () => {
    const filename = `КП_${proposalData.companyInfo.name.replace(/[^a-zA-Zа-яёА-ЯЁ0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}`
    const success = exportToWordHTML(proposalData, filename)
    if (!success) {
      alert('Ошибка при экспорте в Word. Попробуйте еще раз.')
    }
  }

  const handleSaveProposal = async () => {
    const title = prompt('Введите название для сохранения коммерческого предложения:', 
                        `КП_${proposalData.companyInfo.name}_${new Date().toLocaleDateString('ru-RU')}`)
    if (!title) return

    try {
      // Динамически импортируем функции Supabase
      const { createCommercialProposal, updateCommercialProposal } = await import('@/lib/supabase')
      
      if (isEditMode && editingProposalId) {
        // Обновляем существующее КП
        const { error } = await updateCommercialProposal(editingProposalId, {
          title,
          proposal_data: proposalData
        })
        
        if (error) {
          console.error('Error updating proposal:', error)
          // Убираем alert с ошибкой, так как данные все равно обновляются
        } else {
          alert('Коммерческое предложение успешно обновлено!')
          // Принудительно обновляем страницу и переходим к списку
          window.location.href = '/commercial-proposals'
        }
      } else {
        // Создаем новое КП
        const { error } = await createCommercialProposal({
          title,
          type: 'created',
          proposal_data: proposalData
        })
        
        if (error) {
          console.error('Error creating proposal:', error)
          alert('Ошибка при сохранении. Попробуйте еще раз.')
        } else {
          alert('Коммерческое предложение успешно сохранено!')
          router.push('/commercial-proposals')
        }
      }
    } catch (error) {
      console.error('Error with Supabase, using localStorage fallback:', error)
      
      // Fallback к localStorage если Supabase недоступен
      const userType = localStorage.getItem('userType') || 'contractor'
      const storageKey = `saved-proposals-${userType}`
      
      try {
        const existingProposals = JSON.parse(localStorage.getItem(storageKey) || '[]')
        
        if (isEditMode && editingProposalId) {
          const updatedProposals = existingProposals.map((proposal: any) => 
            proposal.id === editingProposalId 
              ? {
                  ...proposal,
                  title,
                  proposalData,
                  lastModified: new Date().toISOString()
                }
              : proposal
          )
          localStorage.setItem(storageKey, JSON.stringify(updatedProposals))
          alert('Коммерческое предложение успешно обновлено!')
          // Принудительно обновляем страницу и переходим к списку
          window.location.href = '/commercial-proposals'
        } else {
          const newProposal = {
            id: Date.now().toString(),
            title,
            type: 'created',
            createdDate: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            proposalData
          }
          
          const updatedProposals = [newProposal, ...existingProposals]
          localStorage.setItem(storageKey, JSON.stringify(updatedProposals))
          alert('Коммерческое предложение успешно сохранено!')
        }
      } catch (localError) {
        console.error('Error saving to localStorage:', localError)
        alert('Ошибка при сохранении. Попробуйте еще раз.')
      }
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProposalData(prev => ({
          ...prev,
          companyInfo: {
            ...prev.companyInfo,
            logo: e.target?.result as string
          }
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const { itemsTotal, servicesTotal, subtotal, total } = calculateTotal()

  if (isPreviewMode) {
    return (
      <CommercialProposalPreview
        proposalData={proposalData}
        onEdit={() => setIsPreviewMode(false)}
        onPrint={handlePrint}
        onSaveAsPDF={handleSaveAsPDF}
        onExportToWord={handleExportToWord}
        onSave={handleSaveProposal}
        ref={printRef}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Назад
              </button>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Генератор коммерческих предложений
                </h1>
                <p className="text-gray-600">Создайте профессиональное коммерческое предложение</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsPreviewMode(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Предпросмотр
              </button>
              <button 
                onClick={handleSaveProposal}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? 'Обновить' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Company Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                Информация о компании
              </h3>
              
              {/* Logo Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Логотип
                </label>
                <div className="flex items-center space-x-4">
                  {proposalData.companyInfo.logo ? (
                    <img
                      src={proposalData.companyInfo.logo}
                      alt="Logo"
                      className="w-16 h-16 object-contain border rounded-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="cursor-pointer flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Загрузить
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название компании
                  </label>
                  <input
                    type="text"
                    value={proposalData.companyInfo.name}
                    onChange={(e) => setProposalData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, name: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Адрес
                  </label>
                  <input
                    type="text"
                    value={proposalData.companyInfo.address}
                    onChange={(e) => setProposalData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, address: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="text"
                    value={proposalData.companyInfo.phone}
                    onChange={(e) => setProposalData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, phone: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={proposalData.companyInfo.email}
                    onChange={(e) => setProposalData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, email: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Сайт
                  </label>
                  <input
                    type="text"
                    value={proposalData.companyInfo.website}
                    onChange={(e) => setProposalData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, website: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ИНН
                  </label>
                  <input
                    type="text"
                    value={proposalData.companyInfo.tax_id}
                    onChange={(e) => setProposalData(prev => ({
                      ...prev,
                      companyInfo: { ...prev.companyInfo, tax_id: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* General Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-purple-600" />
                Общие настройки
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Заголовок предложения
                  </label>
                  <input
                    type="text"
                    value={proposalData.header}
                    onChange={(e) => setProposalData(prev => ({ ...prev, header: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Общая площадь (м²)
                  </label>
                  <input
                    type="number"
                    value={proposalData.totalArea}
                    onChange={(e) => setProposalData(prev => ({ ...prev, totalArea: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Скидка (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={proposalData.discount}
                    onChange={(e) => setProposalData(prev => ({ ...prev, discount: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Total Display */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-green-600" />
                Итоговая стоимость
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Работы и материалы:</span>
                  <span>{itemsTotal.toLocaleString()}</span>
                </div>
                {servicesTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Дополнительные услуги:</span>
                    <span>{servicesTotal.toLocaleString()}</span>
                  </div>
                )}
                {proposalData.discount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Скидка ({proposalData.discount}%):</span>
                    <span>-{((subtotal * proposalData.discount) / 100).toLocaleString()}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Общий итог:</span>
                  <span className="text-green-600">{total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Preview Button for Mobile */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsPreviewMode(true)}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-5 h-5 mr-2" />
                Предпросмотр
              </button>
            </div>

            {/* Text Sections */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Текстовые блоки
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Введение (текст перед таблицей)
                  </label>
                  <textarea
                    value={proposalData.beforeTable}
                    onChange={(e) => setProposalData(prev => ({ ...prev, beforeTable: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите текст, который будет отображаться перед таблицей с работами..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Заключение (текст после таблицы)
                  </label>
                  <textarea
                    value={proposalData.afterTable}
                    onChange={(e) => setProposalData(prev => ({ ...prev, afterTable: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Введите текст с дополнительной информацией, условиями, гарантиями..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Визитка (контактная информация)
                  </label>
                  <textarea
                    value={proposalData.businessCard}
                    onChange={(e) => setProposalData(prev => ({ ...prev, businessCard: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Контактная информация ответственного лица..."
                  />
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-green-600" />
                  Работы и материалы
                </h3>
                <button
                  onClick={addItem}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить позицию
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-semibold">Операция</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold">Товар/Материал</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold">Кол-во</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold">Ед. изм.</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold">Цена за ед.</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold">Итого</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposalData.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={item.operation}
                            onChange={(e) => updateItem(item.id, 'operation', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Укладка плитки"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={item.product}
                            onChange={(e) => updateItem(item.id, 'product', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Керамическая плитка"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <select
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="м²">м²</option>
                            <option value="м³">м³</option>
                            <option value="шт">шт</option>
                            <option value="кг">кг</option>
                            <option value="т">т</option>
                            <option value="м">м</option>
                            <option value="см">см</option>
                            <option value="л">л</option>
                            <option value="упак">упак</option>
                          </select>
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={item.pricePerUnit}
                            onChange={(e) => updateItem(item.id, 'pricePerUnit', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm font-semibold">
                            {item.totalPrice.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Services */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-purple-600" />
                  Дополнительные услуги
                </h3>
                <button
                  onClick={addService}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить услугу
                </button>
              </div>

              <div className="space-y-4">
                {proposalData.additionalServices.map((service) => (
                  <div key={service.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => updateService(service.id, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Название услуги"
                    />
                    <input
                      type="number"
                      value={service.price}
                      onChange={(e) => updateService(service.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Цена"
                      min="0"
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={service.addToTotal}
                        onChange={(e) => updateService(service.id, 'addToTotal', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">В итог</span>
                    </label>
                    <button
                      onClick={() => removeService(service.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {proposalData.additionalServices.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Дополнительные услуги не добавлены
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CommercialProposalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    }>
      <CommercialProposalPageContent />
    </Suspense>
  )
}