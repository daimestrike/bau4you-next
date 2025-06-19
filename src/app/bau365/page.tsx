import Link from 'next/link';

export default function Bau365Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              BAU365
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Уникальная строительная подписка в России
            </p>
            <p className="text-lg mb-10 opacity-80">
              Все лучшее для строительства: предложения от банков, скидки на материалы, персональные проекты и продвижение бизнеса
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Оформить подписку
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Узнать больше
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Наши услуги в BAU365
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Проекты и тендеры */}
              <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/70 transition-all duration-300">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Проекты и тендеры
                </h3>
                <p className="text-gray-600 mb-4">
                  Персональные проекты и тендеры для вашей организации еженедельно на протяжении всего срока подписки
                </p>
                <p className="text-sm text-blue-600">
                  Проекты подстраиваются под запросы вашей организации
                </p>
              </div>

              {/* Скидки от партнеров */}
              <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/70 transition-all duration-300">
                <div className="text-4xl mb-4">💰</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Скидки от партнеров
                </h3>
                <p className="text-gray-600 mb-4">
                  Множество скидок от наших партнеров для подписчиков Bau365
                </p>
                <p className="text-sm text-blue-600">
                  Персональные предложения при отсутствии готовых скидок
                </p>
              </div>

              {/* Маркетинг и продвижение */}
              <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/70 transition-all duration-300">
                <div className="text-4xl mb-4">📈</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Маркетинг и продвижение
                </h3>
                <p className="text-gray-600 mb-4">
                  Помощь в продвижении вашей организации с помощью нашей платформы
                </p>
                <p className="text-sm text-blue-600">
                  Персональная реклама в рассылке на 10 тыс пользователей
                </p>
              </div>

              {/* Строительные проекты */}
              <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl hover:bg-white/70 transition-all duration-300">
                <div className="text-4xl mb-4">🏗️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Строительные проекты
                </h3>
                <p className="text-gray-600 mb-4">
                  Уникальные персональные проекты в строительстве ежемесячно для вашего бизнеса
                </p>
                <p className="text-sm text-blue-600">
                  Подходящие под ваши потребности
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sber Technologies */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Наш главный партнер
              </h2>
              <p className="text-lg text-gray-600">
                СберТехнологии для бизнеса
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Сбер CRM */}
              <div className="bg-gradient-to-br from-green-50/60 to-green-100/60 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-6 hover:shadow-xl hover:from-green-50/70 hover:to-green-100/70 transition-all duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Сбер CRM
                </h3>
                <p className="text-gray-600 mb-4">
                  Платформа для комплексного управления бизнесом, продажами и клиентским сервисом
                </p>
                <button className="text-green-600 font-semibold hover:text-green-700">
                  Перейти →
                </button>
              </div>

              {/* СберТаргет */}
              <div className="bg-gradient-to-br from-blue-50/60 to-blue-100/60 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-6 hover:shadow-xl hover:from-blue-50/70 hover:to-blue-100/70 transition-all duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  СберТаргет
                </h3>
                <p className="text-gray-600 mb-4">
                  Сопровождение сервиса для запуска рекламных кампаний в интернете из одного окна
                </p>
                <button className="text-blue-600 font-semibold hover:text-blue-700">
                  Перейти →
                </button>
              </div>

              {/* Банковские предложения */}
              <div className="bg-gradient-to-br from-yellow-50/60 to-yellow-100/60 backdrop-blur-md rounded-xl border border-white/20 shadow-lg p-6 hover:shadow-xl hover:from-yellow-50/70 hover:to-yellow-100/70 transition-all duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Банковские предложения
                </h3>
                <p className="text-gray-600 mb-4">
                  Уникальные предложения для бизнеса от Сбер Банка
                </p>
                <button className="text-yellow-600 font-semibold hover:text-yellow-700">
                  Перейти →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Service */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Уникальные предложения
            </h2>
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8 hover:bg-white/70 transition-all duration-300">
              <div className="text-5xl mb-6">🤖</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                НАЙМИ - ваш ИИ отдел кадров
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">📄</div>
                  <p className="text-gray-600">Проверяет сотни резюме в день</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⭐</div>
                  <p className="text-gray-600">Оценивает наиболее подходящих кандидатов</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">📞</div>
                  <p className="text-gray-600">Связывается с кандидатом сама и назначает встречу</p>
                </div>
              </div>
              <button className="bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                Подробнее
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Как это работает
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Шаг 1 */}
              <div className="text-center">
                <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Оплата
                </h3>
                <p className="text-gray-600">
                  Вы оплачиваете 1 месяц или на иной период. Получаете звонок от нашего менеджера для уточнения всех деталей
                </p>
              </div>

              {/* Шаг 2 */}
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Ваш профиль
                </h3>
                <p className="text-gray-600">
                  После оплаты наш менеджер создаст профиль компании на платформе Bau4You. Все просто и быстро
                </p>
              </div>

              {/* Шаг 3 */}
              <div className="text-center">
                <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Персональный подход
                </h3>
                <p className="text-gray-600">
                  Мы уточняем у вас какие проекты хотите получать и контактную почту. Также уточняем специальные предложения
                </p>
              </div>

              {/* Шаг 4 */}
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">4</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Ваша реклама
                </h3>
                <p className="text-gray-600">
                  После создания профиля вы получаете персональную рекламу в рассылке на 10 тыс пользователей
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Benefits */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Участие на платформе Bau365
            </h2>
            <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-8 mb-8 hover:bg-white/70 transition-all duration-300">
              <p className="text-lg text-gray-600 mb-6">
                Вы можете предлагать свои услуги как поставщик услуг или товаров на BAU365
              </p>
              <p className="text-gray-600 mb-8">
                Более 150 компаний уже на платформе готовых к сотрудничеству и работе в строительстве. 
                Более ни у какой платформы нет подобного.
              </p>
              <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Отправить запрос
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Готовы начать с BAU365?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Присоединяйтесь к уникальной строительной подписке и получите доступ ко всем преимуществам
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Оформить подписку сейчас
              </button>
              <Link 
                href="/contact" 
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-block"
              >
                Связаться с нами
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}