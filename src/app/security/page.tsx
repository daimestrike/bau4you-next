import Link from 'next/link';

export default function Security() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Hero секция */}
      <section className="relative text-gray-900 overflow-hidden">
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-8">
              <span className="text-blue-600">Безопасность</span>
              <br />
              <span className="text-gray-900">и защита данных</span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Мы обеспечиваем высочайший уровень безопасности для защиты ваших данных и транзакций
            </p>
          </div>
        </div>
      </section>

      {/* Основная информация о безопасности */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                <span className="text-green-600">Защита данных</span>
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Bau4You использует современные технологии шифрования и защиты данных. 
                Все персональные данные пользователей хранятся в зашифрованном виде и 
                защищены от несанкционированного доступа.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Мы соблюдаем все требования законодательства о защите персональных данных 
                и регулярно проводим аудит безопасности наших систем.
              </p>
            </div>
            <div className="glass-card rounded-3xl p-8 border border-gray-200/50">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">SSL</div>
                  <div className="text-gray-600">Шифрование</div>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">24/7</div>
                    <div className="text-sm text-gray-600">Мониторинг</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">99.9%</div>
                    <div className="text-sm text-gray-600">Надежность</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Меры безопасности */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Шифрование данных</h3>
              <p className="text-gray-700 leading-relaxed">
                Все данные передаются по защищенному SSL-соединению и хранятся в зашифрованном виде
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Двухфакторная аутентификация</h3>
              <p className="text-gray-700 leading-relaxed">
                Дополнительный уровень защиты вашего аккаунта с помощью SMS или приложения-аутентификатора
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Мониторинг активности</h3>
              <p className="text-gray-700 leading-relaxed">
                Круглосуточный мониторинг подозрительной активности и автоматическое обнаружение угроз
              </p>
            </div>
          </div>

          {/* Политика конфиденциальности */}
          <div className="bg-gray-50 rounded-3xl p-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Политика конфиденциальности
              </h2>
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Сбор и использование данных</h3>
                  <p className="leading-relaxed">
                    Мы собираем только необходимую информацию для предоставления наших услуг. 
                    Персональные данные используются исключительно для обеспечения работы платформы 
                    и улучшения пользовательского опыта.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Передача данных третьим лицам</h3>
                  <p className="leading-relaxed">
                    Мы не передаем ваши персональные данные третьим лицам без вашего явного согласия, 
                    за исключением случаев, предусмотренных законодательством.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Ваши права</h3>
                  <p className="leading-relaxed">
                    Вы имеете право на доступ к своим персональным данным, их исправление, удаление 
                    или ограничение обработки. Для реализации этих прав обратитесь в службу поддержки.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Контактная информация */}
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Вопросы по безопасности?
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Если у вас есть вопросы о безопасности или защите данных, 
              свяжитесь с нашей службой поддержки
            </p>
            <div className="space-x-4">
              <Link 
                href="/contact" 
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Связаться с нами
              </Link>
              <Link 
                href="/" 
                className="inline-flex items-center px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                На главную
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}