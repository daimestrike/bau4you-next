import Link from 'next/link';

export default function Terms() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Hero секция */}
      <section className="relative text-gray-900 overflow-hidden">
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-8">
              <span className="text-blue-600">Условия</span>
              <br />
              <span className="text-gray-900">использования</span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Правила и условия использования платформы Bau4You для всех участников строительного рынка
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
                <span className="text-green-600">Добро пожаловать</span>
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Используя платформу Bau4You, вы соглашаетесь с настоящими условиями использования. 
                Пожалуйста, внимательно ознакомьтесь с ними перед началом работы.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Наши условия разработаны для обеспечения безопасной и справедливой среды 
                для всех участников строительного рынка.
              </p>
            </div>
            <div className="glass-card rounded-3xl p-8 border border-gray-200/50">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">2024</div>
                  <div className="text-gray-600">Версия условий</div>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">РФ</div>
                    <div className="text-sm text-gray-600">Юрисдикция</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">18+</div>
                    <div className="text-sm text-gray-600">Возрастное ограничение</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Основные разделы */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Регистрация и аккаунт</h3>
              <p className="text-gray-700 leading-relaxed">
                Правила создания и использования учетной записи, требования к персональным данным
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Права и обязанности</h3>
              <p className="text-gray-700 leading-relaxed">
                Права пользователей платформы и их обязанности при использовании сервисов
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Платежи и комиссии</h3>
              <p className="text-gray-700 leading-relaxed">
                Условия проведения платежей, размер комиссий и порядок расчетов
              </p>
            </div>
          </div>

          {/* Детальные условия */}
          <div className="space-y-12">
            {/* Регистрация */}
            <div className="bg-gray-50 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                1. Регистрация и использование аккаунта
              </h2>
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">1.1 Требования к пользователям</h3>
                  <ul className="space-y-2 list-disc list-inside leading-relaxed">
                    <li>Возраст пользователя должен быть не менее 18 лет</li>
                    <li>Предоставление достоверной и актуальной информации при регистрации</li>
                    <li>Один пользователь может иметь только один активный аккаунт</li>
                    <li>Запрещается передача доступа к аккаунту третьим лицам</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">1.2 Безопасность аккаунта</h3>
                  <ul className="space-y-2 list-disc list-inside leading-relaxed">
                    <li>Пользователь несет ответственность за сохранность логина и пароля</li>
                    <li>Обязательное уведомление о компрометации аккаунта</li>
                    <li>Использование двухфакторной аутентификации рекомендуется</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Права и обязанности */}
            <div className="bg-blue-50 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                2. Права и обязанности сторон
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Права пользователей</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 leading-relaxed">
                    <li>Размещение тендеров и проектов</li>
                    <li>Участие в тендерах</li>
                    <li>Продажа товаров и услуг</li>
                    <li>Получение технической поддержки</li>
                    <li>Защита персональных данных</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Обязанности пользователей</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 leading-relaxed">
                    <li>Соблюдение законодательства РФ</li>
                    <li>Предоставление достоверной информации</li>
                    <li>Своевременная оплата услуг</li>
                    <li>Уважительное отношение к другим пользователям</li>
                    <li>Соблюдение правил платформы</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Запрещенные действия */}
            <div className="bg-red-50 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                3. Запрещенные действия
              </h2>
              <div className="space-y-6 text-gray-700">
                <p className="text-lg leading-relaxed">
                  На платформе Bau4You строго запрещается:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ul className="space-y-2 list-disc list-inside leading-relaxed">
                    <li>Размещение недостоверной информации</li>
                    <li>Мошенничество и обман пользователей</li>
                    <li>Нарушение авторских прав</li>
                    <li>Спам и навязчивая реклама</li>
                    <li>Использование ботов и автоматизации</li>
                  </ul>
                  <ul className="space-y-2 list-disc list-inside leading-relaxed">
                    <li>Попытки взлома системы</li>
                    <li>Создание фиктивных аккаунтов</li>
                    <li>Оскорбления и угрозы</li>
                    <li>Продажа запрещенных товаров</li>
                    <li>Обход платежной системы</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Платежи и комиссии */}
            <div className="bg-green-50 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                4. Платежи и комиссии
              </h2>
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Комиссии платформы</h3>
                  <ul className="space-y-2 list-disc list-inside leading-relaxed">
                    <li>Комиссия за участие в тендерах: 3% от суммы заказа</li>
                    <li>Комиссия за продажу товаров: 2% от стоимости товара</li>
                    <li>Комиссия за размещение проектов: фиксированная плата</li>
                    <li>Комиссия за платежные операции согласно тарифам платежных систем</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Порядок расчетов</h3>
                  <ul className="space-y-2 list-disc list-inside leading-relaxed">
                    <li>Все платежи проводятся через защищенные платежные системы</li>
                    <li>Средства поступают на счет исполнителя после завершения работ</li>
                    <li>Возможность удержания средств при спорных ситуациях</li>
                    <li>Автоматическое начисление комиссий при проведении операций</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Ответственность */}
            <div className="bg-yellow-50 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                5. Ответственность и ограничения
              </h2>
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Ответственность платформы</h3>
                  <p className="leading-relaxed mb-4">
                    Bau4You обеспечивает техническое функционирование платформы и безопасность данных, 
                    но не несет ответственности за:
                  </p>
                  <ul className="space-y-2 list-disc list-inside leading-relaxed">
                    <li>Качество товаров и услуг, предоставляемых пользователями</li>
                    <li>Выполнение обязательств между пользователями</li>
                    <li>Убытки, возникшие в результате действий третьих лиц</li>
                    <li>Технические сбои, не зависящие от платформы</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Ответственность пользователей</h3>
                  <p className="leading-relaxed">
                    Пользователи несут полную ответственность за свои действия на платформе, 
                    включая соблюдение законодательства и выполнение принятых обязательств.
                  </p>
                </div>
              </div>
            </div>

            {/* Изменения условий */}
            <div className="bg-purple-50 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                6. Изменение условий
              </h2>
              <div className="space-y-6 text-gray-700">
                <p className="text-lg leading-relaxed">
                  Bau4You оставляет за собой право изменять настоящие условия использования. 
                  О существенных изменениях пользователи будут уведомлены не менее чем за 30 дней.
                </p>
                <p className="leading-relaxed">
                  Продолжение использования платформы после вступления изменений в силу 
                  означает согласие с новыми условиями.
                </p>
              </div>
            </div>
          </div>

          {/* Контактная информация */}
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Вопросы по условиям использования?
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Если у вас есть вопросы по условиям использования платформы, 
              обратитесь в нашу службу поддержки
            </p>
            <div className="space-x-4">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Личный кабинет
              </Link>
              <Link 
                href="/" 
                className="inline-flex items-center px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                На главную
              </Link>
            </div>
            
            <div className="mt-12 p-6 bg-blue-50 rounded-2xl max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Дата последнего обновления</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Настоящие условия использования вступили в силу 1 января 2024 года 
                и действуют до их изменения или отмены.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}