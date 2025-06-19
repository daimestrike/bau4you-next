import Link from 'next/link';

export default function Privacy() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Hero секция */}
      <section className="relative text-gray-900 overflow-hidden">
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-8">
              <span className="text-blue-600">Политика</span>
              <br />
              <span className="text-gray-900">конфиденциальности</span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Защита ваших персональных данных - наш приоритет. Узнайте, как мы собираем, используем и защищаем вашу информацию
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
                <span className="text-green-600">Ваша приватность</span> важна для нас
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Bau4You серьезно относится к защите персональных данных пользователей. 
                Мы соблюдаем требования российского законодательства о персональных данных.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Настоящая политика конфиденциальности описывает, какую информацию мы собираем, 
                как используем и какие меры принимаем для ее защиты.
              </p>
            </div>
            <div className="glass-card rounded-3xl p-8 border border-gray-200/50">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">152-ФЗ</div>
                  <div className="text-gray-600">Соответствие закону о персональных данных</div>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">SSL</div>
                    <div className="text-sm text-gray-600">Шифрование</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">24/7</div>
                    <div className="text-sm text-gray-600">Мониторинг</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Основные принципы */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Минимизация данных</h3>
              <p className="text-gray-700 leading-relaxed">
                Мы собираем только те данные, которые необходимы для предоставления наших услуг
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Прозрачность</h3>
              <p className="text-gray-700 leading-relaxed">
                Мы четко объясняем, какие данные собираем и для каких целей их используем
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Контроль пользователя</h3>
              <p className="text-gray-700 leading-relaxed">
                Вы можете управлять своими данными, запрашивать их изменение или удаление
              </p>
            </div>
          </div>

          {/* Детальная информация */}
          <div className="space-y-12">
            {/* Какие данные собираем */}
            <div className="bg-gray-50 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                1. Какие данные мы собираем
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Обязательные данные</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 leading-relaxed">
                    <li>Имя и фамилия</li>
                    <li>Адрес электронной почты</li>
                    <li>Номер телефона</li>
                    <li>Данные компании (для юридических лиц)</li>
                    <li>Платежная информация</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Дополнительные данные</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700 leading-relaxed">
                    <li>Фотография профиля</li>
                    <li>Описание деятельности</li>
                    <li>Портфолио и примеры работ</li>
                    <li>Отзывы и рейтинги</li>
                    <li>История заказов и транзакций</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Автоматически собираемые данные</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Технические данные</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>IP-адрес</li>
                      <li>Тип браузера</li>
                      <li>Операционная система</li>
                      <li>Разрешение экрана</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Данные использования</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>Посещенные страницы</li>
                      <li>Время на сайте</li>
                      <li>Клики и действия</li>
                      <li>Источник перехода</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Файлы cookie</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>Сессионные cookie</li>
                      <li>Постоянные cookie</li>
                      <li>Аналитические cookie</li>
                      <li>Рекламные cookie</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Как используем данные */}
            <div className="bg-blue-50 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                2. Как мы используем ваши данные
              </h2>
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Основные цели использования</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ul className="space-y-2 list-disc list-inside leading-relaxed">
                      <li>Предоставление доступа к платформе</li>
                      <li>Обработка заказов и платежей</li>
                      <li>Связь с пользователями</li>
                      <li>Техническая поддержка</li>
                      <li>Улучшение качества услуг</li>
                    </ul>
                    <ul className="space-y-2 list-disc list-inside leading-relaxed">
                      <li>Персонализация контента</li>
                      <li>Аналитика и статистика</li>
                      <li>Предотвращение мошенничества</li>
                      <li>Соблюдение законодательства</li>
                      <li>Маркетинговые коммуникации</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Правовые основания обработки</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Мы обрабатываем ваши персональные данные на основании вашего согласия, 
                    для исполнения договора, соблюдения правовых обязательств и защиты законных интересов.
                  </p>
                </div>
              </div>
            </div>

            {/* Защита данных */}
            <div className="bg-green-50 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                3. Как мы защищаем ваши данные
              </h2>
              <div className="space-y-6 text-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Шифрование</h3>
                    <p className="text-sm text-gray-700">SSL/TLS шифрование всех данных при передаче</p>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Контроль доступа</h3>
                    <p className="text-sm text-gray-700">Строгое ограничение доступа к персональным данным</p>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Мониторинг</h3>
                    <p className="text-sm text-gray-700">Круглосуточный мониторинг безопасности</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Дополнительные меры безопасности</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc list-inside text-gray-700">
                    <li>Регулярное резервное копирование</li>
                    <li>Аудит безопасности</li>
                    <li>Обучение персонала</li>
                    <li>Физическая защита серверов</li>
                    <li>Антивирусная защита</li>
                    <li>Межсетевые экраны</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Передача данных */}
            <div className="bg-yellow-50 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                4. Передача данных третьим лицам
              </h2>
              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Когда мы передаем данные</h3>
                  <p className="leading-relaxed mb-4">
                    Мы можем передавать ваши персональные данные третьим лицам только в следующих случаях:
                  </p>
                  <ul className="space-y-2 list-disc list-inside leading-relaxed">
                    <li>С вашего явного согласия</li>
                    <li>Для исполнения договора (платежные системы, службы доставки)</li>
                    <li>По требованию государственных органов</li>
                    <li>Для защиты наших законных интересов</li>
                  </ul>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Партнеры по обработке</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Платежные системы</li>
                      <li>• Службы аналитики</li>
                      <li>• Облачные провайдеры</li>
                      <li>• Службы поддержки</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Гарантии защиты</h3>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Договоры о конфиденциальности</li>
                      <li>• Соответствие стандартам безопасности</li>
                      <li>• Ограничение целей использования</li>
                      <li>• Контроль за обработкой</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Ваши права */}
            <div className="bg-purple-50 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                5. Ваши права в отношении персональных данных
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Право на доступ</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Вы можете запросить информацию о том, какие данные мы о вас храним
                  </p>
                  <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                    Запросить данные →
                  </button>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Право на исправление</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Вы можете исправить неточные или неполные данные
                  </p>
                  <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                    Исправить данные →
                  </button>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Право на удаление</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Вы можете запросить удаление ваших персональных данных
                  </p>
                  <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                    Удалить данные →
                  </button>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Право на ограничение</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Вы можете ограничить обработку ваших данных
                  </p>
                  <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                    Ограничить обработку →
                  </button>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Право на портативность</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Вы можете получить ваши данные в машиночитаемом формате
                  </p>
                  <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                    Экспортировать данные →
                  </button>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Право на возражение</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    Вы можете возразить против обработки ваших данных
                  </p>
                  <button className="text-purple-600 text-sm font-medium hover:text-purple-700">
                    Подать возражение →
                  </button>
                </div>
              </div>
            </div>

            {/* Файлы cookie */}
            <div className="bg-orange-50 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                6. Использование файлов cookie
              </h2>
              <div className="space-y-6 text-gray-700">
                <p className="text-lg leading-relaxed">
                  Мы используем файлы cookie для улучшения работы сайта и персонализации вашего опыта.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Необходимые cookie</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Обеспечивают базовую функциональность сайта
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Аутентификация пользователя</li>
                      <li>• Сохранение настроек</li>
                      <li>• Безопасность сессии</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Аналитические cookie</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Помогают понять, как пользователи взаимодействуют с сайтом
                    </p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Статистика посещений</li>
                      <li>• Анализ поведения</li>
                      <li>• Улучшение UX</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Управление cookie</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Вы можете управлять настройками cookie в вашем браузере или через наши настройки конфиденциальности.
                  </p>
                  <button className="bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                    Настроить cookie
                  </button>
                </div>
              </div>
            </div>

            {/* Изменения политики */}
            <div className="bg-red-50 rounded-3xl p-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                7. Изменения в политике конфиденциальности
              </h2>
              <div className="space-y-6 text-gray-700">
                <p className="text-lg leading-relaxed">
                  Мы можем периодически обновлять настоящую политику конфиденциальности 
                  для отражения изменений в наших практиках или по другим операционным, 
                  правовым или регулятивным причинам.
                </p>
                <div className="bg-white rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Уведомление об изменениях</h3>
                  <ul className="space-y-2 list-disc list-inside text-gray-700">
                    <li>Существенные изменения будут опубликованы на сайте за 30 дней до вступления в силу</li>
                    <li>Мы отправим уведомление на ваш email о важных изменениях</li>
                    <li>Дата последнего обновления всегда указана в начале документа</li>
                    <li>Продолжение использования сервиса означает согласие с новой политикой</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Контактная информация */}
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Вопросы о конфиденциальности?
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Если у вас есть вопросы о нашей политике конфиденциальности или 
              обработке ваших персональных данных, свяжитесь с нами
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-blue-600">privacy@bau4you.ru</p>
              </div>
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Телефон</h3>
                <p className="text-green-600">+7 (495) 123-45-67</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Почтовый адрес</h3>
                <p className="text-purple-600 text-sm">г. Москва, ул. Примерная, д. 1</p>
              </div>
            </div>
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
            
            <div className="mt-12 p-6 bg-gray-100 rounded-2xl max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Дата последнего обновления</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Настоящая политика конфиденциальности была обновлена 1 января 2024 года 
                и действует до следующего обновления.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}