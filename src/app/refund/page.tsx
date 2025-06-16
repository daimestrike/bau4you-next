import Link from 'next/link';

export default function Refund() {
  return (
    <main className="min-h-screen bg-white overflow-hidden">
      {/* Hero секция */}
      <section className="relative text-gray-900 overflow-hidden">
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-8">
              <span className="text-blue-600">Политика отмены</span>
              <br />
              <span className="text-gray-900">и возврата средств</span>
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Подробная информация о правилах отмены заказов и возврата денежных средств на платформе Bau4You
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
                <span className="text-green-600">Общие положения</span>
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                Bau4You стремится обеспечить справедливые условия для всех участников платформы. 
                Наша политика отмены разработана с учетом интересов как заказчиков, так и исполнителей.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Мы понимаем, что иногда обстоятельства могут измениться, поэтому предоставляем 
                гибкие условия для отмены заказов и возврата средств в соответствии с законодательством.
              </p>
            </div>
            <div className="glass-card rounded-3xl p-8 border border-gray-200/50">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">24ч</div>
                  <div className="text-gray-600">Бесплатная отмена</div>
                </div>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">100%</div>
                    <div className="text-sm text-gray-600">Возврат средств</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 mb-1">7 дней</div>
                    <div className="text-sm text-gray-600">На рассмотрение</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Условия отмены */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Отмена в течение 24 часов</h3>
              <p className="text-gray-700 leading-relaxed">
                Полный возврат средств без комиссии при отмене заказа в течение 24 часов после оформления
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Отмена после начала работ</h3>
              <p className="text-gray-700 leading-relaxed">
                Возврат средств за вычетом выполненных работ и понесенных исполнителем расходов
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Завершенные проекты</h3>
              <p className="text-gray-700 leading-relaxed">
                Возврат возможен только при существенных нарушениях условий договора или браке в работе
              </p>
            </div>
          </div>

          {/* Детальные условия */}
          <div className="bg-gray-50 rounded-3xl p-12 mb-20">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                Условия возврата средств
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Для товаров</h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="leading-relaxed">
                      <strong>• Новые товары:</strong> Возврат в течение 14 дней с момента получения при сохранении товарного вида
                    </p>
                    <p className="leading-relaxed">
                      <strong>• Бракованные товары:</strong> Полный возврат средств или замена товара за счет продавца
                    </p>
                    <p className="leading-relaxed">
                      <strong>• Товары не подлежащие возврату:</strong> Материалы, изготовленные по индивидуальному заказу
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Для услуг</h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="leading-relaxed">
                      <strong>• До начала работ:</strong> Полный возврат средств за вычетом комиссии платформы (3%)
                    </p>
                    <p className="leading-relaxed">
                      <strong>• В процессе выполнения:</strong> Возврат за невыполненную часть работ
                    </p>
                    <p className="leading-relaxed">
                      <strong>• После завершения:</strong> Возврат только при доказанном нарушении условий договора
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Для тендеров и проектов</h3>
                  <div className="space-y-3 text-gray-700">
                    <p className="leading-relaxed">
                      <strong>• Отмена тендера:</strong> Возврат всех средств участникам, комиссия не взимается
                    </p>
                    <p className="leading-relaxed">
                      <strong>• Изменение условий:</strong> Участники могут отозвать заявки с полным возвратом средств
                    </p>
                    <p className="leading-relaxed">
                      <strong>• Споры по проектам:</strong> Рассматриваются службой поддержки в течение 7 рабочих дней
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Процедура возврата */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Как оформить возврат
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Подача заявки</h3>
                <p className="text-gray-600">Обратитесь в службу поддержки через личный кабинет</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Рассмотрение</h3>
                <p className="text-gray-600">Анализ заявки и проверка оснований для возврата</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-yellow-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Решение</h3>
                <p className="text-gray-600">Уведомление о принятом решении в течение 7 дней</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">4</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Возврат</h3>
                <p className="text-gray-600">Перевод средств на указанные реквизиты в течение 10 дней</p>
              </div>
            </div>
          </div>

          {/* Контактная информация */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Нужна помощь с возвратом?
            </h2>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
              Наша служба поддержки готова помочь вам с оформлением возврата 
              и ответить на все вопросы по политике отмены
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
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Важно знать</h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                Все возвраты обрабатываются в соответствии с действующим законодательством РФ. 
                Сроки возврата могут варьироваться в зависимости от способа оплаты и банка-эмитента.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}