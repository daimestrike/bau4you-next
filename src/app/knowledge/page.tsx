import Link from 'next/link';

export default function Knowledge() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Hero секция */}
      <section className="relative text-gray-900 overflow-hidden">
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-8">
              <span className="text-blue-600">База</span>
              <br />
              <span className="text-gray-900">знаний</span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Полезные материалы, руководства и ответы на часто задаваемые вопросы для эффективной работы на платформе
            </p>
          </div>
        </div>
      </section>

      {/* Поиск по базе знаний */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по базе знаний..."
                className="w-full px-6 py-4 pl-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm cursor-pointer hover:bg-blue-200">Регистрация</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm cursor-pointer hover:bg-green-200">Тендеры</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm cursor-pointer hover:bg-purple-200">Платежи</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm cursor-pointer hover:bg-orange-200">Безопасность</span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm cursor-pointer hover:bg-red-200">Проблемы</span>
            </div>
          </div>
        </div>
      </section>

      {/* Категории */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Категории
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Начало работы</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Пошаговые инструкции для новых пользователей
              </p>
              <div className="text-sm text-blue-600 font-semibold">12 статей</div>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Тендеры и проекты</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Создание, управление и участие в тендерах
              </p>
              <div className="text-sm text-green-600 font-semibold">18 статей</div>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Товары и услуги</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Размещение и покупка товаров на платформе
              </p>
              <div className="text-sm text-purple-600 font-semibold">15 статей</div>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Платежи и финансы</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Оплата, комиссии и финансовые операции
              </p>
              <div className="text-sm text-orange-600 font-semibold">10 статей</div>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Безопасность</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Защита аккаунта и безопасная работа
              </p>
              <div className="text-sm text-red-600 font-semibold">8 статей</div>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300 cursor-pointer">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Решение проблем</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Частые проблемы и способы их решения
              </p>
              <div className="text-sm text-gray-600 font-semibold">14 статей</div>
            </div>
          </div>

          {/* Популярные статьи */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Популярные статьи
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Как зарегистрироваться на платформе Bau4You
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Пошаговое руководство по созданию аккаунта и настройке профиля
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Обновлено 2 дня назад</span>
                      <span className="text-xs text-blue-600">5 мин чтения</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 font-bold">2</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Создание и размещение тендера
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Подробная инструкция по созданию эффективного тендера
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Обновлено 1 неделю назад</span>
                      <span className="text-xs text-green-600">8 мин чтения</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Как безопасно совершать платежи
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Рекомендации по безопасным финансовым операциям
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Обновлено 3 дня назад</span>
                      <span className="text-xs text-purple-600">6 мин чтения</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-bold">4</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Настройка двухфакторной аутентификации
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Повышение безопасности вашего аккаунта
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Обновлено 5 дней назад</span>
                      <span className="text-xs text-orange-600">4 мин чтения</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 font-bold">5</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Что делать при возникновении спора
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Алгоритм действий для разрешения конфликтных ситуаций
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Обновлено 1 неделю назад</span>
                      <span className="text-xs text-red-600">7 мин чтения</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 font-bold">6</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Оптимизация профиля компании
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      Советы по созданию привлекательного профиля
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Обновлено 4 дня назад</span>
                      <span className="text-xs text-gray-600">10 мин чтения</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Видео-руководства */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Видео-руководства
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Обзор платформы Bau4You
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Знакомство с основными функциями и возможностями
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">12:34</span>
                    <span className="text-xs text-blue-600">Просмотров: 1,234</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Создание первого тендера
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Пошаговое создание тендера от начала до публикации
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">8:45</span>
                    <span className="text-xs text-green-600">Просмотров: 892</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Безопасность на платформе
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    Настройка безопасности и защита от мошенников
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">15:22</span>
                    <span className="text-xs text-purple-600">Просмотров: 567</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Часто задаваемые вопросы
            </h2>
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl">
                <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors">
                  <span className="font-semibold text-gray-900">Как начать работу на платформе?</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl">
                <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors">
                  <span className="font-semibold text-gray-900">Какие комиссии взимает платформа?</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl">
                <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors">
                  <span className="font-semibold text-gray-900">Как обеспечивается безопасность платежей?</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl">
                <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors">
                  <span className="font-semibold text-gray-900">Что делать при возникновении спора?</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl">
                <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors">
                  <span className="font-semibold text-gray-900">Как изменить данные профиля?</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Обратная связь */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Не нашли нужную информацию?
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Мы постоянно обновляем базу знаний. Если у вас есть вопрос, на который нет ответа, 
              свяжитесь с нами, и мы добавим его в базу знаний.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Связаться с нами
              </Link>
              <Link 
                href="/support" 
                className="inline-flex items-center justify-center px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Служба поддержки
              </Link>
            </div>
            
            <div className="mt-8 p-4 bg-white/50 rounded-2xl max-w-md mx-auto">
              <h3 className="font-semibold text-gray-900 mb-2">Предложить статью</h3>
              <p className="text-sm text-gray-600 mb-3">
                Есть идея для полезной статьи? Поделитесь с нами!
              </p>
              <button className="text-blue-600 font-semibold hover:text-blue-700 text-sm">
                Отправить предложение
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}