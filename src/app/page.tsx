'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSearchSuggestions, getPopularSearches, globalSearch, getLatestProducts, getLatestTenders, getLatestProjects, getLatestCompanies, supabase } from '@/lib/supabase';
import { formatPriceSimple } from '@/utils/formatPrice';
import ClientOnly from '@/components/ClientOnly';

interface SearchResult {
  tenders: any[]
  products: any[]
  companies: any[]
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [latestProducts, setLatestProducts] = useState<any[]>([]);
  const [latestTenders, setLatestTenders] = useState<any[]>([]);
  const [latestProjects, setLatestProjects] = useState<any[]>([]);
  const [latestCompanies, setLatestCompanies] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Функция для очистки недействительных токенов
  const clearAuthTokens = async () => {
    try {
      if (typeof window !== 'undefined') {
        // Очищаем все ключи Supabase из localStorage
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
        
        // Принудительно выходим из системы
        await supabase.auth.signOut({ scope: 'local' });
        
        console.log('Cleared invalid auth tokens');
      }
    } catch (error) {
      console.error('Error clearing auth tokens:', error);
    }
  };

  // Загружаем популярные запросы и динамические данные при загрузке компонента
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingData(true);
      try {
        // Загружаем популярные запросы
        const { data: popularData } = await getPopularSearches();
        if (popularData) setPopularSearches(popularData);

        // Загружаем последние продукты
        const { data: productsData } = await getLatestProducts(4);
        if (productsData) setLatestProducts(productsData);

        // Загружаем проекты
        const { data: projectsData } = await getLatestProjects(4);
        if (projectsData) setLatestProjects(projectsData);

        // Загружаем последние компании
        const { data: companiesData } = await getLatestCompanies(3);
        if (companiesData) setLatestCompanies(companiesData);
      } catch (error: any) {
        console.error('Ошибка загрузки данных:', error);
        // Если ошибка связана с аутентификацией, очищаем токены
        if (error?.message?.includes('Invalid Refresh Token') || 
            error?.message?.includes('Refresh Token Not Found')) {
          await clearAuthTokens();
        }
      } finally {
        setLoadingData(false);
      }
    };
    loadInitialData();
  }, []);

  // Получаем подсказки при изменении запроса
  useEffect(() => {
    const getSuggestions = async () => {
      if (searchQuery.length >= 2) {
        setIsLoading(true);
        try {
          const { data } = await getSearchSuggestions(searchQuery);
          if (data) {
            setSuggestions(data);
          }
        } catch (error: any) {
          console.error('Error fetching suggestions:', error);
          if (error?.message?.includes('Invalid Refresh Token') || 
              error?.message?.includes('Refresh Token Not Found')) {
            await clearAuthTokens();
          }
        }
        setIsLoading(false);
      } else {
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(getSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performQuickSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const { data } = await globalSearch(searchQuery, { limit: 6 });
      if (data) {
        setSearchResults(data);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Quick search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setShowResults(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Задержка, чтобы клик по подсказке успел сработать
    setTimeout(() => setShowSuggestions(false), 200);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100" suppressHydrationWarning={true}>
      {/* Hero секция */}
      <section className="relative py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6" suppressHydrationWarning={true}>
          {/* Статистика */}
          <div className="text-center mb-8 sm:mb-12" suppressHydrationWarning={true}>
            <div className="inline-flex items-center bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full text-lg sm:text-2xl font-bold mb-4 sm:mb-6" suppressHydrationWarning={true}>
              Bau4You
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              Цифровая платформа
              <br />
              для строительства
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-4">
              Материалы, подрядчики, тендеры — всё что нужно для успешного проекта
            </p>
          </div>

          {/* Быстрые переходы к разделам платформы */}
          <div className="flex justify-center mb-6 sm:mb-8 px-2 sm:px-4" suppressHydrationWarning={true}>
            <div className="flex flex-wrap sm:flex-nowrap bg-white/60 backdrop-blur-md rounded-full p-1 sm:p-2 shadow-lg border border-white/20 gap-1 sm:gap-0 max-w-full" suppressHydrationWarning={true}>
              <Link
                href="/tenders"
                className="px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full font-medium transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-xs sm:text-sm lg:text-base whitespace-nowrap"
              >
                <span className="mr-1 sm:mr-2">📋</span>
                <span className="hidden sm:inline">Bau.</span>Тендеры
              </Link>
              <Link
                href="/companies"
                className="px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full font-medium transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-xs sm:text-sm lg:text-base whitespace-nowrap"
              >
                <span className="mr-1 sm:mr-2">🏢</span>
                <span className="hidden sm:inline">Bau.</span>Компании
              </Link>
              <Link
                href="/products"
                className="px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full font-medium transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-xs sm:text-sm lg:text-base whitespace-nowrap"
              >
                <span className="mr-1 sm:mr-2">🛒</span>
                <span className="hidden sm:inline">Bau.</span>Маркет
              </Link>
              <Link
                href="/about"
                className="px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full font-medium transition-all duration-300 text-gray-600 hover:bg-gray-100 hover:text-blue-600 text-xs sm:text-sm lg:text-base whitespace-nowrap"
              >
                <span className="mr-1 sm:mr-2">ℹ️</span>
                <span className="hidden sm:inline">О платформе</span>
                <span className="sm:hidden">О нас</span>
              </Link>
            </div>
          </div>

          {/* Поисковая форма */}
          <div className="max-w-4xl mx-auto px-2 sm:px-4" suppressHydrationWarning={true}>
            <form onSubmit={handleSearch} className="relative">
              <div className="bg-white/60 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl border border-white/20 p-1.5 sm:p-2" suppressHydrationWarning={true}>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-1.5 sm:gap-2" suppressHydrationWarning={true}>
                  {/* Поле поиска */}
                  <div className="md:col-span-5 relative" suppressHydrationWarning={true}>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={handleInputFocus}
                      onBlur={handleInputBlur}
                      placeholder="Поиск проектов, услуг, материалов..."
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg border-0 rounded-lg sm:rounded-xl focus:outline-none focus:ring-0"
                    />
                    
                    {/* Подсказки поиска */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-md mt-2 z-[9999] max-h-80 overflow-y-auto">
                        {isLoading && (
                          <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          </div>
                        )}
                        
                        {suggestions.length > 0 && (
                          <div>
                            <div className="px-4 py-2 text-sm font-medium text-gray-500 border-b">
                              Предложения
                            </div>
                            {suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Кнопка поиска */}
                  <div className="md:col-span-1" suppressHydrationWarning={true}>
                    <button
                      type="submit"
                      className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl transition-colors duration-300 flex items-center justify-center min-h-[40px] sm:min-h-[48px] lg:min-h-[56px]"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </form>
            
            {/* Кнопки входа и регистрации */}
            <div className="flex justify-center gap-2 sm:gap-4 mt-4 sm:mt-6 px-2 sm:px-4" suppressHydrationWarning={true}>
              <Link
                href="/login"
                className="px-3 sm:px-6 lg:px-8 py-2 sm:py-3 bg-white/80 backdrop-blur-md text-blue-600 font-semibold rounded-lg sm:rounded-xl border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 shadow-lg text-xs sm:text-sm lg:text-base"
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="px-3 sm:px-6 lg:px-8 py-2 sm:py-3 bg-blue-600 text-white font-semibold rounded-lg sm:rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg text-xs sm:text-sm lg:text-base"
              >
                Зарегистроваться
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Главное - Экосистема Bau4You */}
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
                <img 
                  src="https://s3.twcstorage.ru/5e559db6-b49dc67b-2ab0-4413-9567-c6e34e6a5bd4/uploads/t1.png"
                  alt="BAU.Маркет"
                  className="w-full h-full object-cover"
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
                <img 
                  src="https://s3.twcstorage.ru/5e559db6-b49dc67b-2ab0-4413-9567-c6e34e6a5bd4/uploads/t2.png"
                  alt="BAU.Тендеры"
                  className="w-full h-full object-cover"
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
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
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
              {latestProjects.length > 0 ? (
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {latestProjects[0].title || latestProjects[0].name}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm font-medium text-gray-600">Назначение проекта:</span>
                      <span className="text-sm font-semibold text-gray-800">{latestProjects[0].category || 'Промышленные'}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm font-medium text-gray-600">Адрес:</span>
                      <span className="text-sm text-gray-800">{latestProjects[0].location || 'Россия'}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      Дата создания: {latestProjects[0].created_at ? new Date(latestProjects[0].created_at).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                  

                  
                  <Link href={`/projects/${latestProjects[0].id}`} className="bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors w-full block text-center">
                    Перейти
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Загрузка проектов...
                  </h3>

                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Projects Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestProjects.slice(1, 4).map((project, index) => (
              <div key={project.id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">

                <h4 className="text-lg font-bold text-gray-900 mb-2">{project.title || project.name}</h4>
                <p className="text-sm text-gray-600 mb-4">{project.location || 'Россия'}</p>
                <Link href={`/projects/${project.id}`} className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                  Подробнее →
                </Link>
              </div>
            ))}
            
            {/* Fallback cards if not enough projects */}
            {latestProjects.length < 4 && Array.from({ length: Math.max(0, 3 - (latestProjects.length - 1)) }).map((_, index) => (
              <div key={`fallback-${index}`} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">

                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {index === 0 ? 'Реконструкция офисного здания' : 
                   index === 1 ? 'Строительство жилого комплекса' : 
                   'Модернизация производства'}
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  {index === 0 ? 'Москва, Центральный район' : 
                   index === 1 ? 'Санкт-Петербург, Приморский район' : 
                   'Екатеринбург, Промышленный район'}
                </p>
                <button className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                  Подробнее →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Результаты быстрого поиска */}
      {showResults && searchResults && (
        <section className="relative py-8 sm:py-10 bg-white/50">
          <div className="container mx-auto px-4 sm:px-6" suppressHydrationWarning={true}>
            <div className="max-w-6xl mx-auto" suppressHydrationWarning={true}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3" suppressHydrationWarning={true}>
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  Результаты поиска для "{searchQuery}"
                </h2>
                <div className="flex gap-2 sm:gap-3" suppressHydrationWarning={true}>
                  <Link 
                    href={`/search?q=${encodeURIComponent(searchQuery)}`}
                    className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                  >
                    Все результаты
                  </Link>
                  <button 
                    onClick={() => setShowResults(false)}
                    className="px-3 sm:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
                  >
                    Скрыть
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" suppressHydrationWarning={true}>
                {/* Тендеры и Проекты */}
                {searchResults.tenders.length > 0 && (
                  <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 sm:p-6" suppressHydrationWarning={true}>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                      <span className="text-xl sm:text-2xl mr-2">📋</span>
                      <span className="truncate">Тендеры и Проекты ({searchResults.tenders.length})</span>
                    </h3>
                    <div className="space-y-3" suppressHydrationWarning={true}>
                      {searchResults.tenders.slice(0, 3).map((tender: any) => (
                        <Link 
                          key={tender.id} 
                          href={tender.type === 'project' ? `/projects/${tender.id}` : `/tenders/${tender.id}`}
                          className="block p-2 sm:p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between" suppressHydrationWarning={true}>
                            <div className="flex-1 min-w-0" suppressHydrationWarning={true}>
                              <h4 className="font-medium text-gray-900 text-xs sm:text-sm mb-1 truncate">
                                {tender.title || tender.name}
                              </h4>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {tender.description}
                              </p>
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-500" suppressHydrationWarning={true}>
                                {tender.type === 'project' && (
                                  <span className="bg-green-100 text-green-800 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs">
                                    Проект
                                  </span>
                                )}
                                <span className="truncate">{tender.location || 'Россия'}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Продукты */}
                {searchResults.products.length > 0 && (
                  <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 sm:p-6" suppressHydrationWarning={true}>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                      <span className="text-xl sm:text-2xl mr-2">🛒</span>
                      <span className="truncate">Товары ({searchResults.products.length})</span>
                    </h3>
                    <div className="space-y-3" suppressHydrationWarning={true}>
                      {searchResults.products.slice(0, 3).map((product: any) => (
                        <Link 
                          key={product.id} 
                          href={`/products/${product.id}`}
                          className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start gap-2 sm:gap-3" suppressHydrationWarning={true}>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0" suppressHydrationWarning={true}>
                              {product.images && product.images.length > 0 ? (
                                <img src={`/api/image-proxy?url=${encodeURIComponent(product.images[0])}`} alt={product.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg" />
                              ) : (
                                <span className="text-base sm:text-lg">📦</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0" suppressHydrationWarning={true}>
                              <h4 className="font-medium text-gray-900 text-xs sm:text-sm mb-1 line-clamp-1">
                                {product.name}
                              </h4>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                                {product.description}
                              </p>
                              <div className="text-xs sm:text-sm font-bold text-purple-600" suppressHydrationWarning={true}>
                                {formatPriceSimple(product.price)} ₽
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Компании */}
                {searchResults.companies.length > 0 && (
                  <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4 sm:p-6" suppressHydrationWarning={true}>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                      <span className="text-xl sm:text-2xl mr-2">🏢</span>
                      <span className="truncate">Компании ({searchResults.companies.length})</span>
                    </h3>
                    <div className="space-y-3" suppressHydrationWarning={true}>
                      {searchResults.companies.slice(0, 3).map((company: any) => (
                        <Link 
                          key={company.id} 
                          href={`/companies/${company.id}`}
                          className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 sm:gap-3" suppressHydrationWarning={true}>
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0" suppressHydrationWarning={true}>
                              {company.logo ? (
                                <img src={`/api/image-proxy?url=${encodeURIComponent(company.logo)}`} alt={company.name} className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-lg" />
                              ) : (
                                <span className="text-xs sm:text-sm">{company.name.charAt(0)}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0" suppressHydrationWarning={true}>
                              <h4 className="font-medium text-gray-900 text-xs sm:text-sm mb-1 line-clamp-1">
                                {company.name}
                              </h4>
                              <p className="text-xs text-gray-600 line-clamp-1">
                                {company.specialization || 'Строительная компания'}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Основной контент */}
      <section className="relative py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6" suppressHydrationWarning={true}>


          {/* Bau.Компании - Подрядчики */}
          <div className="mb-16" suppressHydrationWarning={true}>
            <div className="flex items-center justify-between mb-8" suppressHydrationWarning={true}>
              <div suppressHydrationWarning={true}>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  <span className="text-green-600">
                    Bau.Компании
                  </span>
                </h3>
                <p className="text-gray-600">Надежные партнеры и подрядчики для ваших проектов</p>
              </div>
              <Link href="/companies" className="bg-white/60 backdrop-blur-md hover:bg-white/70 px-6 py-3 rounded-2xl font-medium text-green-600 border border-white/20 shadow-lg transition-all duration-300 hover:scale-105">
                Смотреть все
              </Link>
            </div>
            
            {loadingData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" suppressHydrationWarning={true}>
                {[1, 2, 3].map((index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg animate-pulse" suppressHydrationWarning={true}>
                    <div className="flex items-center gap-4 mb-4" suppressHydrationWarning={true}>
                      <div className="w-12 h-12 bg-gray-300 rounded-xl" suppressHydrationWarning={true}></div>
                      <div className="flex-1" suppressHydrationWarning={true}>
                        <div className="h-5 bg-gray-300 rounded mb-2" suppressHydrationWarning={true}></div>
                        <div className="h-4 bg-gray-300 rounded w-24" suppressHydrationWarning={true}></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-300 rounded w-32" suppressHydrationWarning={true}></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" suppressHydrationWarning={true}>
                {latestCompanies.slice(0, 3).map((company) => (
                  <Link key={company.id} href={`/companies/${company.id}`} className="bg-white/60 backdrop-blur-md hover:bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer block" suppressHydrationWarning={true}>
                    <div className="flex items-center gap-4 mb-4" suppressHydrationWarning={true}>
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg" suppressHydrationWarning={true}>
                        {company.logo ? (
                          <img src={`/api/image-proxy?url=${encodeURIComponent(company.logo)}`} alt={company.name} className="w-12 h-12 object-cover rounded-xl" />
                        ) : (
                          company.name.charAt(0)
                        )}
                      </div>
                      <div suppressHydrationWarning={true}>
                        <h4 className="font-bold text-gray-900 line-clamp-1">{company.name}</h4>
                        <div className="flex items-center gap-2" suppressHydrationWarning={true}>
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-gray-600">{company.rating || '5.0'} • {company.regions?.name || 'Россия'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-green-600 font-medium line-clamp-2" suppressHydrationWarning={true}>{company.description || company.specialization || 'Строительная компания'}</div>
                  </Link>
                ))}
                {latestCompanies.length === 0 && (
                  <div className="col-span-full text-center py-8" suppressHydrationWarning={true}>
                    <div className="text-4xl mb-4">🏢</div>
                    <p className="text-gray-600">Пока нет компаний</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bau.Маркет - Материалы */}
          <div className="mb-16" suppressHydrationWarning={true}>
            <div className="flex items-center justify-between mb-8" suppressHydrationWarning={true}>
              <div suppressHydrationWarning={true}>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  <span className="text-purple-600">
                    Bau.Маркет
                  </span>
                </h3>
                <p className="text-gray-600">Качественные строительные материалы от проверенных поставщиков</p>
              </div>
              <Link href="/products" className="bg-white/60 backdrop-blur-md hover:bg-white/70 px-6 py-3 rounded-2xl font-medium text-purple-600 border border-white/20 shadow-lg transition-all duration-300 hover:scale-105">
                Смотреть все
              </Link>
            </div>
            
            {loadingData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" suppressHydrationWarning={true}>
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-lg animate-pulse" suppressHydrationWarning={true}>
                    <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-4" suppressHydrationWarning={true}></div>
                    <div className="h-4 bg-gray-300 rounded mb-2" suppressHydrationWarning={true}></div>
                    <div className="h-6 bg-gray-300 rounded mb-2" suppressHydrationWarning={true}></div>
                    <div className="h-5 bg-gray-300 rounded w-20" suppressHydrationWarning={true}></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" suppressHydrationWarning={true}>
                {latestProducts.slice(0, 4).map((product) => (
                  <Link key={product.id} href={`/products/${product.id}`} className="bg-white/60 backdrop-blur-md hover:bg-white/70 rounded-2xl p-6 border border-white/20 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer block" suppressHydrationWarning={true}>
                    <div className="text-4xl mb-4 text-center" suppressHydrationWarning={true}>
                      {product.images && product.images.length > 0 ? (
                        <img src={`/api/image-proxy?url=${encodeURIComponent(product.images[0])}`} alt={product.name} className="w-16 h-16 object-cover rounded-lg mx-auto" />
                      ) : (
                        '📦'
                      )}
                    </div>

                    <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h4>
                    <div className="text-lg font-bold text-purple-600" suppressHydrationWarning={true}>
                      {formatPriceSimple(product.price)} ₽
                    </div>
                  </Link>
                ))}
                {latestProducts.length === 0 && (
                  <div className="col-span-full text-center py-8" suppressHydrationWarning={true}>
                    <div className="text-4xl mb-4">📦</div>
                    <p className="text-gray-600">Пока нет товаров</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Описание платформы и ролей */}
      <section className="relative py-20">
        <div className="container mx-auto px-6" suppressHydrationWarning={true}>
          <div className="mb-16" suppressHydrationWarning={true}>
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl p-8 sm:p-12 border border-blue-100" suppressHydrationWarning={true}>
              <div className="text-center mb-12" suppressHydrationWarning={true}>
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Как работает <span className="text-blue-600">BAU4YOU</span>
                </h3>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                  Единая экосистема для всех участников строительного рынка — от заказчиков до поставщиков
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" suppressHydrationWarning={true}>
                {/* Заказчики */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/80 transition-all duration-300" suppressHydrationWarning={true}>
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4" suppressHydrationWarning={true}>
                    <span className="text-3xl">🏢</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Заказчики</h4>
                  <p className="text-sm text-gray-600 mb-3">Размещают тендеры и ищут подрядчиков</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Публикация проектов</li>
                    <li>• Выбор исполнителей</li>
                    <li>• Контроль качества</li>
                  </ul>
                </div>
                
                {/* Подрядчики */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/80 transition-all duration-300" suppressHydrationWarning={true}>
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4" suppressHydrationWarning={true}>
                    <span className="text-3xl">👷</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Подрядчики</h4>
                  <p className="text-sm text-gray-600 mb-3">Участвуют в тендерах и выполняют работы</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Подача заявок</li>
                    <li>• Портфолио проектов</li>
                    <li>• Рейтинг и отзывы</li>
                  </ul>
                </div>
                
                {/* Поставщики */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/80 transition-all duration-300" suppressHydrationWarning={true}>
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4" suppressHydrationWarning={true}>
                    <span className="text-3xl">🚛</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Поставщики</h4>
                  <p className="text-sm text-gray-600 mb-3">Продают материалы и оборудование</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Каталог товаров</li>
                    <li>• Онлайн-продажи</li>
                    <li>• Логистика</li>
                  </ul>
                </div>
                
                {/* Покупатели */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/80 transition-all duration-300" suppressHydrationWarning={true}>
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4" suppressHydrationWarning={true}>
                    <span className="text-3xl">🛒</span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Покупатели</h4>
                  <p className="text-sm text-gray-600 mb-3">Приобретают материалы для строительства</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Поиск материалов</li>
                    <li>• Сравнение цен</li>
                    <li>• Быстрая покупка</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-12 text-center" suppressHydrationWarning={true}>
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto" suppressHydrationWarning={true}>
                  <h4 className="font-bold text-gray-900 mb-3">Что объединяет платформа</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm" suppressHydrationWarning={true}>
                    <div className="flex items-center justify-center gap-2" suppressHydrationWarning={true}>
                      <span className="text-blue-600">📋</span>
                      <span className="text-gray-700">Тендерная система</span>
                    </div>
                    <div className="flex items-center justify-center gap-2" suppressHydrationWarning={true}>
                      <span className="text-purple-600">🛍️</span>
                      <span className="text-gray-700">Маркетплейс материалов</span>
                    </div>
                    <div className="flex items-center justify-center gap-2" suppressHydrationWarning={true}>
                      <span className="text-green-600">🤝</span>
                      <span className="text-gray-700">База подрядчиков</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Преимущества платформы */}
          <div className="text-center" suppressHydrationWarning={true}>
            <h3 className="text-3xl font-bold text-gray-900 mb-12">
              Почему нас выбирают  
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8" suppressHydrationWarning={true}>
              {[
                {
                  icon: '🔒',
                  title: 'Безопасность',
                  description: 'Все участники проходят верификацию. Гарантия безопасных сделок.'
                },
                {
                  icon: '⚡',
                  title: 'Скорость',
                  description: 'Быстрый поиск партнеров и материалов. Автоматизация процессов.'
                },
                {
                  icon: '💎',
                  title: 'Качество',
                  description: 'Только проверенные поставщики и подрядчики с высоким рейтингом.'
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-md hover:bg-white/70 rounded-2xl p-8 border border-white/20 shadow-lg transition-all duration-300 hover:scale-105" suppressHydrationWarning={true}>
                  <div className="text-4xl mb-4" suppressHydrationWarning={true}>{benefit.icon}</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h4>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
