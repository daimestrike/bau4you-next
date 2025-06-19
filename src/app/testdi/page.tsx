'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function TestDiPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Главное
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Маркетплейс, тендерая площадка, организации.
              <br />
              Это лишь часть экосистемы Bau4You
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* BAU.Маркет Card */}
            <div className="rounded-3xl overflow-hidden shadow-2xl relative bg-gradient-to-br from-blue-600 to-blue-800">
              {/* Full Image Section */}
              <div className="h-64 relative overflow-hidden">
                <Image 
                  src="https://s3.twcstorage.ru/5e559db6-b49dc67b-2ab0-4413-9567-c6e34e6a5bd4/uploads/t1.png"
                  alt="BAU.Маркет"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              
              {/* Content Block - positioned under image */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 relative">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3">BAU.Маркет</h3>
                  <p className="text-blue-100 text-sm mb-2">
                    Строительный маркетплейс для всех и каждого.
                  </p>
                  <p className="text-blue-100 text-sm mb-4">
                    Размещайте товар и продвигайте свой профиль.
                  </p>
                  <Link href="/products" className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg inline-block">
                    Перейти
                  </Link>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/10 rounded-full backdrop-blur-sm"></div>
              </div>
            </div>

            {/* BAU.Тендеры Card */}
            <div className="rounded-3xl overflow-hidden shadow-2xl relative bg-gradient-to-br from-green-600 to-green-800">
              {/* Full Image Section */}
              <div className="h-64 relative overflow-hidden">
                <Image 
                  src="https://s3.twcstorage.ru/5e559db6-b49dc67b-2ab0-4413-9567-c6e34e6a5bd4/uploads/t2.png"
                  alt="BAU.Тендеры"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              
              {/* Content Block - positioned under image */}
              <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 relative rounded-b-3xl">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3">BAU.Тендеры</h3>
                  <p className="text-green-100 text-sm mb-2">
                    Более 60 проектов на платформе. Свободная площадка для каждого.
                  </p>
                  <p className="text-green-100 text-sm mb-4">
                    Найдите проект или создайте свой.
                  </p>
                  <Link href="/tenders" className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg inline-block">
                    Перейти
                  </Link>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/10 rounded-full backdrop-blur-sm"></div>
              </div>
            </div>

            {/* Bau.Компании Card */}
            <div className="rounded-3xl overflow-hidden shadow-2xl relative bg-gradient-to-br from-purple-600 to-purple-800">
              {/* Full Image Section */}
              <div className="h-64 relative overflow-hidden">
                <img 
                  src="https://s3.twcstorage.ru/5e559db6-b49dc67b-2ab0-4413-9567-c6e34e6a5bd4/uploads/t3.png"
                  alt="Bau.Компании"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
              
              {/* Content Block - positioned under image */}
              <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 relative rounded-b-3xl">
                <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-3">Bau.Компании</h3>
                  <p className="text-purple-100 text-sm mb-2">
                    Более 170 компаний на платформе. Свободная площадка для каждого.
                  </p>
                  <p className="text-purple-100 text-sm mb-4">
                    Найдите партнера или создайте свой профиль.
                  </p>
                  <Link href="/companies" className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg inline-block">
                    Перейти
                  </Link>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full backdrop-blur-sm"></div>
                <div className="absolute bottom-4 left-4 w-6 h-6 bg-white/10 rounded-full backdrop-blur-sm"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BAU.Тендеры Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-bold text-green-600 mb-6">
                BAU.Тендеры
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                100+ проектов актуальных проектов.
                <br />
                Нажмите, чтобы просмотреть больше.
              </p>
              <div className="w-20 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mb-8"></div>
            </div>
            
            <div className="lg:w-1/2">
              {/* Project Card */}
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Строительство завода для производства эпоксидных смол
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-600">Назначение проекта:</span>
                    <span className="text-sm font-semibold text-gray-800">Промышленные</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-600">Адрес:</span>
                    <span className="text-sm text-gray-800">Свердловская область, Первоуральск.</span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Дата создания: 04.04.2025
                  </div>
                </div>
                
                {/* Project Image Placeholder */}
                <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl mb-6 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                
                <button className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors w-full">
                  Перейти
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Projects Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Project Card 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-full h-40 bg-gradient-to-br from-blue-200 to-blue-300 rounded-xl mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Реконструкция офисного здания</h4>
              <p className="text-sm text-gray-600 mb-4">Москва, Центральный район</p>
              <button className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                Подробнее →
              </button>
            </div>

            {/* Project Card 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-full h-40 bg-gradient-to-br from-purple-200 to-purple-300 rounded-xl mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v8h12V6H4z" clipRule="evenodd" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Строительство жилого комплекса</h4>
              <p className="text-sm text-gray-600 mb-4">Санкт-Петербург, Приморский район</p>
              <button className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                Подробнее →
              </button>
            </div>

            {/* Project Card 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="w-full h-40 bg-gradient-to-br from-orange-200 to-orange-300 rounded-xl mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Модернизация производства</h4>
              <p className="text-sm text-gray-600 mb-4">Екатеринбург, Промышленный район</p>
              <button className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                Подробнее →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Готовы начать свой проект?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Присоединяйтесь к экосистеме Bau4You и найдите идеальных партнеров для вашего бизнеса
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-green-600 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors">
              Зарегистрироваться
            </Link>
            <Link href="/projects" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-green-600 transition-colors">
              Просмотреть проекты
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}