'use client';

import Link from 'next/link';

export default function About() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Hero секция */}
      <section className="relative text-gray-900 overflow-hidden">
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-8">
              <span className="text-blue-600">О платформе</span>
              <br />
              <span className="text-gray-900">Bau4You</span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Мы создаем будущее строительной индустрии через инновационные цифровые решения
            </p>
          </div>
        </div>
      </section>

      {/* Основная информация */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                <span className="text-green-600">Наша миссия</span>
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Bau4You объединяет всех участников строительного рынка в единой цифровой экосистеме. 
                Мы стремимся сделать строительную индустрию более прозрачной, эффективной и доступной 
                для всех участников процесса.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Наша платформа помогает заказчикам находить надежных подрядчиков, подрядчикам — 
                участвовать в тендерах и находить качественные материалы, а поставщикам — 
                расширять свою клиентскую базу.
              </p>
            </div>
            <div className="glass-card rounded-3xl p-8 border border-gray-200/50">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">2024</div>
                  <div className="text-gray-600">Год основания</div>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-1">1000+</div>
                    <div className="text-sm text-gray-600">Компаний</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-600 mb-1">500+</div>
                    <div className="text-sm text-gray-600">Тендеров</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Преимущества платформы */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12">
              <span className="text-blue-600">Преимущества</span>
              <span className="text-gray-900"> платформы</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card rounded-2xl p-8 border border-blue-200/50 hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Быстрота</h3>
                <p className="text-gray-600">
                  Мгновенный поиск партнеров, материалов и тендеров. Автоматизация рутинных процессов.
                </p>
              </div>
              
              <div className="glass-card rounded-2xl p-8 border border-green-200/50 hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Надежность</h3>
                <p className="text-gray-600">
                  Проверенные компании, прозрачные рейтинги и отзывы. Безопасные сделки.
                </p>
              </div>
              
              <div className="glass-card rounded-2xl p-8 border border-orange-200/50 hover:scale-105 transition-all duration-300">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Сообщество</h3>
                <p className="text-gray-600">
                  Объединяем профессионалов строительной отрасли в единую экосистему.
                </p>
              </div>
            </div>
          </div>

          {/* Наши сервисы */}
          <div className="mb-20">
            <h2 className="text-4xl font-bold text-center mb-12">
              <span className="text-green-600">Наши</span>
              <span className="text-gray-900"> сервисы</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="glass-card rounded-2xl p-8 border border-blue-200/50">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">Bau.Компании</h3>
                <p className="text-gray-700 mb-4">
                  Каталог проверенных строительных компаний с рейтингами, портфолио и отзывами клиентов.
                </p>
                <Link href="/companies" className="text-blue-600 font-medium hover:underline">
                  Перейти к компаниям →
                </Link>
              </div>
              
              <div className="glass-card rounded-2xl p-8 border border-green-200/50">
                <h3 className="text-2xl font-bold text-green-600 mb-4">Bau.Тендеры</h3>
                <p className="text-gray-700 mb-4">
                  Площадка для размещения и участия в строительных тендерах с прозрачной системой отбора.
                </p>
                <Link href="/tenders" className="text-green-600 font-medium hover:underline">
                  Перейти к тендерам →
                </Link>
              </div>
              
              <div className="glass-card rounded-2xl p-8 border border-orange-200/50">
                <h3 className="text-2xl font-bold text-orange-600 mb-4">Bau.Материалы</h3>
                <p className="text-gray-700 mb-4">
                  Маркетплейс строительных материалов с возможностью сравнения цен и характеристик.
                </p>
                <Link href="/products" className="text-orange-600 font-medium hover:underline">
                  Перейти к материалам →
                </Link>
              </div>
              
              <div className="glass-card rounded-2xl p-8 border border-purple-200/50">
                <h3 className="text-2xl font-bold text-purple-600 mb-4">Bau.Проекты</h3>
                <p className="text-gray-700 mb-4">
                  Система управления строительными проектами с возможностью отслеживания прогресса.
                </p>
                <Link href="/projects" className="text-purple-600 font-medium hover:underline">
                  Перейти к проектам →
                </Link>
              </div>
            </div>
          </div>

          {/* Команда */}
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-8">
              <span className="text-blue-600">Наша команда</span>
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-12">
              Мы — команда профессионалов с многолетним опытом в строительной отрасли и IT-разработке. 
              Наша цель — создать платформу, которая действительно решает проблемы участников рынка.
            </p>
            
            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Свяжитесь с нами</h3>
              <p className="text-gray-700 mb-6">
                Есть вопросы или предложения? Мы всегда открыты для диалога и готовы помочь.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact" 
                  className="glass-card hover-glass px-8 py-3 rounded-2xl font-medium text-blue-600 border border-blue-200/50 transition-all duration-300 hover:scale-105"
                >
                  Связаться с нами
                </Link>
                <Link 
                  href="/register" 
                  className="glass-card hover-glass px-8 py-3 rounded-2xl font-medium text-green-600 border border-green-200/50 transition-all duration-300 hover:scale-105"
                >
                  Присоединиться
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}