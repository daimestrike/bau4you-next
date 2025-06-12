import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Hero секция */}
      <section className="relative text-gray-900 overflow-hidden min-h-screen">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
        </div>

        {/* Верхние кнопки */}
        <div className="absolute top-32 left-8 z-20">
          <div className="flex gap-4">
            <button className="glass-card hover-glass px-6 py-3 rounded-2xl font-medium text-blue-600 border border-blue-200/50 transition-all duration-300 hover:scale-105">
              Наши новости
            </button>
            <button className="glass-card hover-glass px-6 py-3 rounded-2xl font-medium text-purple-600 border border-purple-200/50 transition-all duration-300 hover:scale-105 flex items-center gap-2">
              Приложение BAU.PRO
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>

        {/* Основной контент */}
        <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">
            {/* Левая колонка - текст */}
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-6">
                <h1 className="text-6xl lg:text-7xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Строительная
                  </span>
                  <br />
                  <span className="text-gray-900">экосистема</span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    будущего
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Объединяем заказчиков, подрядчиков и поставщиков в единой цифровой платформе для эффективного взаимодействия
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Начать работу
                </Link>
                <Link 
                  href="/about"
                  className="inline-flex items-center justify-center px-8 py-4 glass-card hover-glass text-gray-700 rounded-2xl font-semibold border border-gray-200/50 transition-all duration-300 hover:scale-105"
                >
                  Узнать больше
                </Link>
              </div>

              {/* Статистика */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">1000+</div>
                  <div className="text-sm text-gray-600 mt-1">Компаний</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">5000+</div>
                  <div className="text-sm text-gray-600 mt-1">Проектов</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">50M+</div>
                  <div className="text-sm text-gray-600 mt-1">Оборот</div>
                </div>
              </div>
            </div>

            {/* Правая колонка - интерактивная панель */}
            <div className="relative animate-slide-up animation-delay-1000">
              <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/20 hover-glass">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Быстрый старт
                  </h3>
                  <p className="text-gray-600">
                    Переходите по нашим главным разделам и работайте.
                  </p>
                </div>
                
                {/* Кнопки разделов */}
                <div className="space-y-4 mb-8">
                  <Link href="/companies" className="w-full glass-card hover-glass text-blue-600 px-6 py-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-4 border border-blue-200/50">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    Компании
                  </Link>
                  
                  <Link href="/tenders" className="w-full glass-card hover-glass text-green-600 px-6 py-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-4 border border-green-200/50">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    Тендеры
                  </Link>
                  
                  <Link href="/products" className="w-full glass-card hover-glass text-purple-600 px-6 py-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-4 border border-purple-200/50">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    Материалы
                  </Link>
                  
                  <Link href="/projects" className="w-full glass-card hover-glass text-orange-600 px-6 py-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-4 border border-orange-200/50">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    Проекты
                  </Link>
                </div>
                
                {/* Кнопки входа */}
                <div className="space-y-3">
                  <Link 
                    href="/login"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-center block"
                  >
                    Войти в систему
                  </Link>
                  <Link 
                    href="/register"
                    className="w-full glass-card hover-glass text-gray-700 px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:scale-105 border border-gray-200/50 text-center block"
                  >
                    Регистрация
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Остальные секции с обновленным дизайном */}
      {/* ... остальной контент ... */}
    </main>
  )
}
