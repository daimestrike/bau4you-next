import Link from 'next/link';

export default function Support() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Hero секция */}
      <section className="relative text-gray-900 overflow-hidden">
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-8">
              <span className="text-blue-600">Служба</span>
              <br />
              <span className="text-gray-900">поддержки</span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Мы готовы помочь вам в любое время. Свяжитесь с нами удобным для вас способом
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
                <span className="text-green-600">Мы всегда</span> на связи
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Наша команда поддержки работает для того, чтобы ваш опыт использования 
                платформы Bau4You был максимально комфортным и продуктивным.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Независимо от того, нужна ли вам техническая помощь, консультация по использованию 
                сервисов или у вас есть предложения по улучшению платформы - мы готовы помочь.
              </p>
            </div>
            <div className="glass-card rounded-3xl p-8 border border-gray-200/50">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                  <div className="text-gray-600">Техническая поддержка</div>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">&lt;1ч</div>
                    <div className="text-sm text-gray-600">Время ответа</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">99%</div>
                    <div className="text-sm text-gray-600">Решение проблем</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Способы связи */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Email поддержка</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Отправьте нам письмо с описанием вашего вопроса
              </p>
              <a href="mailto:info@bau4you.co" className="text-blue-600 font-semibold hover:text-blue-700">
                info@bau4you.co
              </a>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Телефонная поддержка</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Позвоните нам для быстрого решения вопросов
              </p>
              <a href="tel:+79280397888" className="text-green-600 font-semibold hover:text-green-700">
                +7 (928) 039-78-88
              </a>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Онлайн чат</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Получите мгновенную помощь через чат на сайте
              </p>
              <button className="text-purple-600 font-semibold hover:text-purple-700">
                Начать чат
              </button>
            </div>
          </div>

          {/* Часто задаваемые вопросы */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Часто задаваемые вопросы
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Как зарегистрироваться на платформе?
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Нажмите кнопку "Регистрация" в правом верхнем углу сайта, заполните форму 
                    с основными данными и подтвердите email адрес.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Как разместить тендер или проект?
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    После регистрации перейдите в личный кабинет, выберите раздел "Мои проекты" 
                    и нажмите "Создать новый проект".
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Какие комиссии взимает платформа?
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Комиссия составляет 3% за участие в тендерах и 2% за продажу товаров. 
                    Подробности в разделе "Условия использования".
                  </p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Как обеспечивается безопасность платежей?
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Все платежи проходят через защищенные платежные системы с SSL шифрованием. 
                    Средства поступают исполнителю только после завершения работ.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Что делать при возникновении спора?
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Обратитесь в службу поддержки с описанием ситуации. Мы поможем 
                    разрешить спор справедливо для всех сторон.
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Как изменить данные профиля?
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    Войдите в личный кабинет, перейдите в раздел "Профиль" и внесите 
                    необходимые изменения. Некоторые изменения требуют подтверждения.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Форма обратной связи */}
          <div className="bg-blue-50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Не нашли ответ на свой вопрос?
            </h2>
            <p className="text-lg text-gray-700 text-center mb-12 max-w-2xl mx-auto">
              Заполните форму ниже, и мы свяжемся с вами в ближайшее время
            </p>
            
            <form className="max-w-2xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ваше имя"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+7 (___) ___-__-__"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Тема обращения *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Выберите тему</option>
                  <option value="technical">Техническая проблема</option>
                  <option value="account">Вопросы по аккаунту</option>
                  <option value="payment">Проблемы с платежами</option>
                  <option value="project">Вопросы по проектам/тендерам</option>
                  <option value="products">Вопросы по товарам</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Сообщение *
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Опишите ваш вопрос или проблему подробно..."
                ></textarea>
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Отправить сообщение
                </button>
              </div>
            </form>
          </div>

          {/* Время работы */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Время работы</h3>
              <p className="text-gray-700">Пн-Пт: 9:00 - 18:00</p>
              <p className="text-gray-700">Сб-Вс: 10:00 - 16:00</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Быстрый ответ</h3>
              <p className="text-gray-700">Email: до 1 часа</p>
              <p className="text-gray-700">Телефон: мгновенно</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Локация</h3>
              <p className="text-gray-700">Россия, Москва</p>
              <p className="text-gray-700">Удаленная поддержка</p>
            </div>
          </div>

          {/* Дополнительные ресурсы */}
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Дополнительные ресурсы
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Изучите наши руководства и документацию для более эффективного использования платформы
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <Link 
                href="/about" 
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                О платформе
              </Link>
              <Link 
                href="/terms" 
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Условия использования
              </Link>
              <Link 
                href="/privacy" 
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Конфиденциальность
              </Link>
              <Link 
                href="/security" 
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Безопасность
              </Link>
            </div>
            
            <div className="mt-12 p-6 bg-green-50 rounded-2xl max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Экстренная поддержка</h3>
              <p className="text-gray-700 text-sm leading-relaxed mb-3">
                При критических проблемах, влияющих на безопасность или работу платформы, 
                звоните по телефону поддержки в любое время.
              </p>
              <a href="tel:+79280397888" className="text-green-600 font-semibold hover:text-green-700">
                +7 (928) 039-78-88
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}