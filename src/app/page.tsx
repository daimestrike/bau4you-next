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

  // Initialize interactive dots animation
  useEffect(() => {
    // Initialize concentric dots animation
    const initConcentricDots = () => {
      const container = document.getElementById('concentricDots-1');
      if (!container) return;

      // Clear existing dots
      container.innerHTML = '';

      // Create center dot
      const center = document.createElement('div');
      center.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #6366f1;
        left: calc(50% - 2px);
        top: calc(50% - 2px);
        opacity: 0.96;
        animation: concentricExpand 2.2s infinite cubic-bezier(0.4,0,0.2,1);
        animation-delay: 0s;
      `;
      container.appendChild(center);

      // Create rings
      const rings = 5;
      const radiusStep = 25;
      
      for (let r = 0; r < rings; r++) {
        const radius = 20 + r * radiusStep;
        const dots = 20 + r * 4;
        
        for (let i = 0; i < dots; i++) {
          const angle = (2 * Math.PI * i) / dots;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          const dot = document.createElement('div');
          dot.style.cssText = `
            position: absolute;
            width: 3px;
            height: 3px;
            border-radius: 50%;
            background: #6366f1;
            left: calc(50% + ${x}px - 1.5px);
            top: calc(50% + ${y}px - 1.5px);
            opacity: ${0.56 - r * 0.08};
            transform: scale(0.55);
            animation: concentricExpand 2.2s infinite cubic-bezier(0.4,0,0.2,1);
            animation-delay: ${(r * 0.15 + i * 0.06) % 2.2}s;
          `;
          container.appendChild(dot);
        }
      }
    };

    const initGlowingInteractiveDotsGrid = () => {
      if (typeof window === 'undefined') return;
      
      document.querySelectorAll('[data-dots-container-init]').forEach(container => {
        const colors = { base: "rgba(66, 98, 255, 0.15)", active: "#4262ff" };
        const threshold = 120;
        const speedThreshold = 80;
        const shockRadius = 200;
        const shockPower = 3;
        const maxSpeed = 3000;
        let dots: (HTMLDivElement & { _inertiaApplied?: boolean })[] = [];
        let dotCenters: { el: HTMLDivElement & { _inertiaApplied?: boolean }, x: number, y: number }[] = [];

        function buildGrid() {
          container.innerHTML = "";
          dots = [];
          dotCenters = [];
          const style = getComputedStyle(container);
          const dotPx = parseFloat(style.fontSize) * 0.5;
          const gapPx = dotPx * 3;
          const contW = container.clientWidth;
          const contH = container.clientHeight;
          const cols = Math.floor((contW + gapPx) / (dotPx + gapPx));
          const rows = Math.floor((contH + gapPx) / (dotPx + gapPx));
          const total = cols * rows;
          for (let i = 0; i < total; i++) {
            const d = document.createElement("div") as HTMLDivElement & { _inertiaApplied?: boolean };
            d.classList.add("dot");
            d.style.transform = 'translate(0, 0)';
            d.style.backgroundColor = colors.base;
            d._inertiaApplied = false;
            container.appendChild(d);
            dots.push(d);
          }
          requestAnimationFrame(() => {
            dotCenters = dots.map(d => {
              const r = d.getBoundingClientRect();
              return {
                el: d,
                x: r.left + window.scrollX + r.width / 2,
                y: r.top + window.scrollY + r.height / 2
              };
            });
          });
        }

        const handleResize = () => buildGrid();
        window.addEventListener("resize", handleResize);
        buildGrid();

        let lastTime = 0, lastX = 0, lastY = 0;
        const handleMouseMove = (e: MouseEvent) => {
          const now = performance.now();
          const dt = now - lastTime || 16;
          let dx = e.pageX - lastX;
          let dy = e.pageY - lastY;
          let vx = dx / dt * 1000;
          let vy = dy / dt * 1000;
          let speed = Math.hypot(vx, vy);
          if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            vx *= scale; vy *= scale; speed = maxSpeed;
          }
          lastTime = now;
          lastX = e.pageX;
          lastY = e.pageY;
          
          requestAnimationFrame(() => {
            dotCenters.forEach(({ el, x, y }) => {
              const dist = Math.hypot(x - e.pageX, y - e.pageY);
              const t = Math.max(0, 1 - dist / threshold);
              const baseMatch = colors.base.match(/\d+/g);
              const r = parseInt(baseMatch?.[0] || '66');
              const g = parseInt(baseMatch?.[1] || '98');
              const b = parseInt(baseMatch?.[2] || '255');
              const activeR = parseInt(colors.active.slice(1, 3), 16);
              const activeG = parseInt(colors.active.slice(3, 5), 16);
              const activeB = parseInt(colors.active.slice(5, 7), 16);
              
              const finalR = Math.round(r + (activeR - r) * t);
              const finalG = Math.round(g + (activeG - g) * t);
              const finalB = Math.round(b + (activeB - b) * t);
              const alpha = 0.15 + t * 0.85;
              
              el.style.backgroundColor = `rgba(${finalR}, ${finalG}, ${finalB}, ${alpha})`;
              
              if (speed > speedThreshold && dist < threshold && !el._inertiaApplied) {
                el._inertiaApplied = true;
                const pushX = (x - e.pageX) + vx * 0.003;
                const pushY = (y - e.pageY) + vy * 0.003;
                
                // Simple animation without GSAP
                let startTime: number | null = null;
                const animate = (currentTime: number) => {
                  if (!startTime) startTime = currentTime;
                  const elapsed = currentTime - startTime;
                  const progress = Math.min(elapsed / 1000, 1);
                  
                  const easeOut = 1 - Math.pow(1 - progress, 3);
                  const currentX = pushX * (1 - easeOut);
                  const currentY = pushY * (1 - easeOut);
                  
                  el.style.transform = `translate(${currentX}px, ${currentY}px)`;
                  
                  if (progress < 1) {
                    requestAnimationFrame(animate);
                  } else {
                    // Return to original position
                    let returnStartTime: number | null = null;
                    const returnAnimate = (currentTime: number) => {
                      if (!returnStartTime) returnStartTime = currentTime;
                      const returnElapsed = currentTime - returnStartTime;
                      const returnProgress = Math.min(returnElapsed / 1500, 1);
                      
                      const elasticEase = returnProgress === 1 ? 1 : 
                        1 - Math.pow(2, -10 * returnProgress) * Math.cos((returnProgress - 0.1) * (2 * Math.PI) / 0.4);
                      
                      const returnX = currentX * (1 - elasticEase);
                      const returnY = currentY * (1 - elasticEase);
                      
                      el.style.transform = `translate(${returnX}px, ${returnY}px)`;
                      
                      if (returnProgress < 1) {
                        requestAnimationFrame(returnAnimate);
                      } else {
                        el._inertiaApplied = false;
                      }
                    };
                    requestAnimationFrame(returnAnimate);
                  }
                };
                requestAnimationFrame(animate);
              }
            });
          });
        };

        const handleClick = (e: MouseEvent) => {
          dotCenters.forEach(({ el, x, y }) => {
            const dist = Math.hypot(x - e.pageX, y - e.pageY);
            if (dist < shockRadius && !el._inertiaApplied) {
              el._inertiaApplied = true;
              const falloff = Math.max(0, 1 - dist / shockRadius);
              const pushX = (x - e.pageX) * shockPower * falloff;
              const pushY = (y - e.pageY) * shockPower * falloff;
              
              // Simple shock animation
              let startTime: number | null = null;
              const animate = (currentTime: number) => {
                if (!startTime) startTime = currentTime;
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / 800, 1);
                
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const currentX = pushX * (1 - easeOut);
                const currentY = pushY * (1 - easeOut);
                
                el.style.transform = `translate(${currentX}px, ${currentY}px)`;
                
                if (progress < 1) {
                  requestAnimationFrame(animate);
                } else {
                  // Return to original position
                  let returnStartTime: number | null = null;
                  const returnAnimate = (currentTime: number) => {
                    if (!returnStartTime) returnStartTime = currentTime;
                    const returnElapsed = currentTime - returnStartTime;
                    const returnProgress = Math.min(returnElapsed / 1500, 1);
                    
                    const elasticEase = returnProgress === 1 ? 1 : 
                      1 - Math.pow(2, -10 * returnProgress) * Math.cos((returnProgress - 0.1) * (2 * Math.PI) / 0.4);
                    
                    const returnX = currentX * (1 - elasticEase);
                    const returnY = currentY * (1 - elasticEase);
                    
                    el.style.transform = `translate(${returnX}px, ${returnY}px)`;
                    
                    if (returnProgress < 1) {
                      requestAnimationFrame(returnAnimate);
                    } else {
                      el._inertiaApplied = false;
                    }
                  };
                  requestAnimationFrame(returnAnimate);
                }
              };
              requestAnimationFrame(animate);
            }
          });
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("click", handleClick);

        // Cleanup function
        return () => {
          window.removeEventListener("resize", handleResize);
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("click", handleClick);
        };
      });
    };

    const cleanup = initGlowingInteractiveDotsGrid();
    
    // Initialize concentric dots with a slight delay
    setTimeout(() => {
      initConcentricDots();
    }, 100);
    
    return cleanup;
  }, []);

  return (
    <>
      <main className="min-h-screen bg-white futura-font" suppressHydrationWarning={true}>
      {/* Hero секция */}
      <section className="relative py-12 sm:py-20 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        {/* Animated Sunflower Spiral Background */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
          <svg width="800" height="800" viewBox="0 0 800 800" className="max-w-none">
            <defs>
              <radialGradient id="spiralGradient1" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#4262ff" stopOpacity="0.8"/>
                <stop offset="30%" stopColor="#06b6d4" stopOpacity="0.6"/>
                <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.2"/>
              </radialGradient>
              <radialGradient id="spiralGradient2" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7"/>
                <stop offset="30%" stopColor="#ef4444" stopOpacity="0.5"/>
                <stop offset="70%" stopColor="#a855f7" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1"/>
              </radialGradient>
              <radialGradient id="spiralGradient3" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.6"/>
                <stop offset="30%" stopColor="#4262ff" stopOpacity="0.4"/>
                <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.1"/>
              </radialGradient>
            </defs>
            <g>
              {(() => {
                const circles = [];
                const N = 420, SIZE = 800, DOT_R = 1.5, MARGIN = 20;
                const CX = SIZE/2, CY = SIZE/2, MAX_R = CX - MARGIN - DOT_R;
                const GOLDEN = Math.PI * (3 - Math.sqrt(5)), DUR = 3;
                
                // Массив цветов для более красочной анимации
                const colors = ['#4262ff', '#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#a855f7', '#3b82f6'];
                const gradients = ['url(#spiralGradient1)', 'url(#spiralGradient2)', 'url(#spiralGradient3)'];
                
                for(let i = 0; i < N; i++) {
                  const frac = (i + 0.5) / N;
                  const r = Math.sqrt(frac) * MAX_R;
                  const theta = (i + 0.5) * GOLDEN;
                  const x = CX + r * Math.cos(theta);
                  const y = CY + r * Math.sin(theta);
                  
                  // Выбираем цвет или градиент в зависимости от позиции
                  let fillColor;
                  if (i % 10 === 0) {
                    fillColor = gradients[i % gradients.length];
                  } else {
                    fillColor = colors[i % colors.length];
                  }
                  
                  circles.push(
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r={DOT_R}
                      fill={fillColor}
                      opacity="0.6"
                    >
                      <animate
                        attributeName="r"
                        values={`${DOT_R * 0.5};${DOT_R * 2.2};${DOT_R * 0.5}`}
                        dur={`${DUR}s`}
                        begin={`${frac * DUR}s`}
                        repeatCount="indefinite"
                        calcMode="spline"
                        keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.1;0.9;0.1"
                        dur={`${DUR}s`}
                        begin={`${frac * DUR}s`}
                        repeatCount="indefinite"
                        calcMode="spline"
                        keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
                      />
                      <animateTransform
                        attributeName="transform"
                        type="scale"
                        values="0.8;1.4;0.8"
                        dur={`${DUR * 1.5}s`}
                        begin={`${frac * DUR * 0.5}s`}
                        repeatCount="indefinite"
                        calcMode="spline"
                        keySplines="0.4 0 0.6 1;0.4 0 0.6 1"
                      />
                    </circle>
                  );
                }
                return circles;
              })()}
            </g>
          </svg>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10" suppressHydrationWarning={true}>
          {/* Статистика */}
          <div className="text-center mb-8 sm:mb-12" suppressHydrationWarning={true}>
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-lg sm:text-2xl font-bold mb-4 sm:mb-6 glass-effect shadow-lg" style={{backgroundColor: '#4262ff20', color: '#4262ff', border: '1px solid rgba(66, 98, 255, 0.2)'}} suppressHydrationWarning={true}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6">
                <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/>
                <circle cx="12" cy="8" r="6"/>
              </svg>
              Bau4You
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-gray-900 mb-3 sm:mb-4 px-4 tracking-tight leading-tight">
              Цифровая платформа
              <br />
              <span className="font-light italic" style={{color: '#4262ff'}}>для строительства</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 px-4 leading-relaxed">
              Материалы, подрядчики, тендеры — всё что нужно для успешного проекта
            </p>
          </div>

          {/* Быстрые переходы к разделам платформы */}
          <div className="flex justify-center mb-6 sm:mb-8 px-2 sm:px-4" suppressHydrationWarning={true}>
            <div className="flex flex-wrap sm:flex-nowrap glass-effect rounded-full p-1 sm:p-2 shadow-xl border gap-1 sm:gap-0 max-w-full" style={{backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(66, 98, 255, 0.1)'}} suppressHydrationWarning={true}>
              <Link
                href="/tenders"
                className="px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full font-medium transition-all duration-300 text-gray-600 hover:text-white text-xs sm:text-sm lg:text-base whitespace-nowrap"
                style={{backgroundColor: 'transparent'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4262ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span className="mr-1 sm:mr-2">📋</span>
                <span className="hidden sm:inline">Bau.</span>Тендеры
              </Link>
              <Link
                href="/companies"
                className="px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full font-medium transition-all duration-300 text-gray-600 hover:text-white text-xs sm:text-sm lg:text-base whitespace-nowrap"
                style={{backgroundColor: 'transparent'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4262ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span className="mr-1 sm:mr-2">🏢</span>
                <span className="hidden sm:inline">Bau.</span>Компании
              </Link>
              <Link
                href="/products"
                className="px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full font-medium transition-all duration-300 text-gray-600 hover:text-white text-xs sm:text-sm lg:text-base whitespace-nowrap"
                style={{backgroundColor: 'transparent'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4262ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <span className="mr-1 sm:mr-2">🛒</span>
                <span className="hidden sm:inline">Bau.</span>Маркет
              </Link>
              <Link
                href="/about"
                className="px-2 sm:px-3 lg:px-6 py-1.5 sm:py-2 lg:py-3 rounded-full font-medium transition-all duration-300 text-gray-600 hover:text-white text-xs sm:text-sm lg:text-base whitespace-nowrap"
                style={{backgroundColor: 'transparent'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4262ff'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
              <div className="glass-effect rounded-2xl sm:rounded-3xl shadow-2xl p-2 sm:p-3" style={{backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(66, 98, 255, 0.1)'}} suppressHydrationWarning={true}>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-2 sm:gap-3" suppressHydrationWarning={true}>
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
                      className="w-full px-4 sm:px-6 py-3 sm:py-4 lg:py-5 text-sm sm:text-base lg:text-lg border-0 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 glass-effect"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(66, 98, 255, 0.1)'
                      }}
                    />
                    
                    {/* Подсказки поиска */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 glass-effect rounded-2xl shadow-2xl mt-3 z-[9999] max-h-80 overflow-y-auto" style={{backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(66, 98, 255, 0.1)'}}>
                        {isLoading && (
                          <div className="p-4 text-center text-gray-500">
                            <div className="animate-spin rounded-full h-6 w-6 mx-auto" style={{borderTop: '2px solid #4262ff', borderRight: '2px solid transparent', borderBottom: '2px solid #4262ff', borderLeft: '2px solid transparent'}}></div>
                          </div>
                        )}
                        
                        {suggestions.length > 0 && (
                          <div>
                            <div className="px-4 py-3 text-sm font-medium border-b" style={{color: '#4262ff', borderColor: 'rgba(66, 98, 255, 0.1)'}}>
                              Предложения
                            </div>
                            {suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full text-left px-4 py-3 transition-all duration-300 hover:text-white rounded-none first:rounded-t-2xl last:rounded-b-2xl"
                                style={{backgroundColor: 'transparent'}}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4262ff'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                      className="w-full h-full text-white rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center min-h-[52px] sm:min-h-[60px] lg:min-h-[68px] shadow-lg hover:shadow-xl glass-effect"
                      style={{
                        backgroundColor: '#4262ff',
                        border: '1px solid rgba(66, 98, 255, 0.2)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3651e6'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4262ff'}
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </form>
            
            {/* Кнопки входа и регистрации */}
            <div className="flex justify-center gap-3 sm:gap-6 mt-6 sm:mt-8 px-2 sm:px-4" suppressHydrationWarning={true}>
              <Link
                href="/login"
                className="px-4 sm:px-8 lg:px-10 py-3 sm:py-4 font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base lg:text-lg glass-effect"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#4262ff',
                  border: '1px solid rgba(66, 98, 255, 0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4262ff';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                  e.currentTarget.style.color = '#4262ff';
                }}
              >
                Войти
              </Link>
              <Link
                href="/register"
                className="shiny-cta focus:outline-none text-sm sm:text-base lg:text-lg"
              >
                <span>Зарегистроваться</span>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Новый дизайн-блок */}
      <section className="relative bg-white py-20">
        {/* Custom Styles */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Futura:wght@300;400;500;600;700&display=swap');
          
          .futura-font {
            font-family: 'Futura', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          }
          
          .dot {
            will-change: transform, background-color;
            transform-origin: center;
            background-color: rgba(66, 98, 255, 0.15);
            border-radius: 50%;
            width: 0.5em;
            height: 0.5em;
            position: relative;
            transform: translate(0);
            box-shadow: 0 1px 3px 0 rgba(66, 98, 255, 0.1);
            border: 1px solid rgba(66, 98, 255, 0.2);
            transition: background 0.18s;
          }
          .dots-container {
            grid-column-gap: 1.5em;
            grid-row-gap: 1.5em;
            pointer-events: none;
            flex-flow: wrap;
            justify-content: center;
            align-items: center;
            display: flex;
            position: absolute;
            inset: 0;
          }
          
          .animate-delay-200 { animation-delay: 0.2s; }
          .animate-delay-400 { animation-delay: 0.4s; }
          .animate-delay-600 { animation-delay: 0.6s; }
          .animate-delay-800 { animation-delay: 0.8s; }
          .animate-delay-1000 { animation-delay: 1.0s; }
          .animate-delay-1200 { animation-delay: 1.2s; }
          
          .gradient-border {
            background: linear-gradient(white, white) padding-box,
                        linear-gradient(135deg, #4262ff, #4262ff) border-box;
            border: 2px solid transparent;
          }
          
          .glass-effect {
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            0% { opacity: 0; transform: translateY(40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideLeft {
            0% { opacity: 0; transform: translateX(40px); }
            100% { opacity: 1; transform: translateX(0); }
          }
          @keyframes scaleIn {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }

          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }
          .animate-slide-up {
            animation: slideUp 0.8s ease-out forwards;
          }
          .animate-slide-left {
            animation: slideLeft 0.8s ease-out forwards;
          }
          .animate-scale-in {
            animation: scaleIn 0.6s ease-out forwards;
          }

          /* Mesh Gradient Animation for BAU.Тендеры */
          @keyframes mesh1 {
            0%   { transform: translate(-60%, -59%) rotate(12deg) scale(1);}
            25%  { transform: translate(-80%, -69%) rotate(27deg) scale(1.28);}
            50%  { transform: translate(-40%, -50%) rotate(7deg) scale(0.65);}
            75%  { transform: translate(-75%, -81%) rotate(36deg) scale(1.35);}
            100% { transform: translate(-60%, -59%) rotate(12deg) scale(1);}
          }
          @keyframes mesh2 {
            0%   { transform: translate(-45%, -45%) rotate(-12deg) scale(1);}
            20%  { transform: translate(-60%, -25%) rotate(-25deg) scale(1.30);}
            50%  { transform: translate(-30%, -30%) rotate(-19deg) scale(0.62);}
            80%  { transform: translate(-65%, -70%) rotate(-35deg) scale(1.39);}
            100% { transform: translate(-45%, -45%) rotate(-12deg) scale(1);}
          }
          @keyframes mesh3 {
            0%   { transform: translate(-42%, -49%) scale(1);}
            30%  { transform: translate(-70%, -60%) scale(1.33);}
            60%  { transform: translate(-15%, -25%) scale(0.58);}
            100% { transform: translate(-42%, -49%) scale(1);}
          }
          @keyframes mesh4 {
            0%   { transform: translate(-48%, -54%) scale(1);}
            25%  { transform: translate(-70%, -80%) scale(1.25);}
            50%  { transform: translate(-20%, -38%) scale(0.65);}
            75%  { transform: translate(-60%, -72%) scale(1.34);}
            100% { transform: translate(-48%, -54%) scale(1);}
          }
          .mesh1 { animation: mesh1 8s ease-in-out infinite alternate; }
          .mesh2 { animation: mesh2 9s ease-in-out infinite alternate; }
          .mesh3 { animation: mesh3 7s ease-in-out infinite alternate; }
          .mesh4 { animation: mesh4 10s ease-in-out infinite alternate; }
          
          @keyframes concentricExpand {
            0%, 100% { 
              transform: scale(0.5); 
              opacity: 0.25; 
            }
            18% { 
              transform: scale(1.2); 
              opacity: 1; 
            }
            65% { 
              transform: scale(1.2); 
              opacity: 1; 
            }
            85% { 
              transform: scale(0.5); 
              opacity: 0.25; 
            }
          }

          /* Shiny CTA Button Styles */
          @property --gradient-angle {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
          }
          @property --gradient-angle-offset {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
          }
          @property --gradient-percent {
            syntax: "<percentage>";
            initial-value: 20%;
            inherits: false;
          }
          @property --gradient-shine {
            syntax: "<color>";
            initial-value: #6d7bff;
            inherits: false;
          }

          .shiny-cta {
            --shiny-cta-bg: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%);
            --shiny-cta-bg-subtle: rgba(66, 98, 255, 0.1);
            --shiny-cta-fg: #4262ff;
            --shiny-cta-highlight: #4262ff;
            --shiny-cta-highlight-subtle: #6d7bff;
            --gradient-angle: 0deg;
            --gradient-angle-offset: 0deg;
            --gradient-percent: 20%;
            --gradient-shine: var(--shiny-cta-highlight-subtle);
            --shadow-size: 2px;
            position: relative;
            overflow: hidden;
            border-radius: 9999px;
            padding: 0.75rem 2rem;
            font-weight: 600;
            color: var(--shiny-cta-fg);
            background: var(--shiny-cta-bg) padding-box,
              conic-gradient(
                from calc(var(--gradient-angle) - var(--gradient-angle-offset)),
                transparent 0%,
                var(--shiny-cta-highlight) 5%,
                var(--gradient-shine) 15%,
                var(--shiny-cta-highlight) 30%,
                transparent 40%,
                transparent 100%
              ) border-box;
            border: 2px solid transparent;
            box-shadow: 
              inset 0 0 0 1px var(--shiny-cta-bg-subtle),
              0 4px 12px rgba(66, 98, 255, 0.15),
              0 2px 4px rgba(66, 98, 255, 0.1);
            outline: none;
            transition: 
              --gradient-angle-offset 800ms cubic-bezier(0.25, 1, 0.5, 1),
              --gradient-percent 800ms cubic-bezier(0.25, 1, 0.5, 1),
              --gradient-shine 800ms cubic-bezier(0.25, 1, 0.5, 1),
              box-shadow 0.3s,
              transform 0.2s;
            cursor: pointer;
            isolation: isolate;
            outline-offset: 4px;
            font-family: inherit;
            z-index: 0;
            animation: border-spin 2.5s linear infinite;
            display: inline-block;
            text-decoration: none;
          }

          @keyframes border-spin {
            to { --gradient-angle: 360deg; }
          }

          .shiny-cta:active {
            transform: translateY(1px) scale(0.98);
          }

          .shiny-cta:hover {
            box-shadow: 
              inset 0 0 0 1px rgba(66, 98, 255, 0.2),
              0 8px 25px rgba(66, 98, 255, 0.25),
              0 4px 12px rgba(66, 98, 255, 0.15);
            transform: translateY(-2px);
          }

          .shiny-cta::before {
            content: '';
            pointer-events: none;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 0;
            --size: calc(100% - 6px);
            --position: 2px;
            --space: 4px;
            width: var(--size);
            height: var(--size);
            background: radial-gradient(circle at var(--position) var(--position), rgba(66, 98, 255, 0.3) 0.5px, transparent 0) padding-box;
            background-size: var(--space) var(--space);
            background-repeat: space;
            mask-image: conic-gradient(
              from calc(var(--gradient-angle) + 45deg),
              black,
              transparent 10% 90%,
              black
            );
            border-radius: inherit;
            opacity: 0.6;
            pointer-events: none;
          }

          .shiny-cta::after {
            content: '';
            pointer-events: none;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
            width: 100%;
            aspect-ratio: 1;
            background: linear-gradient(-50deg, transparent, rgba(66, 98, 255, 0.4), rgba(109, 123, 255, 0.6), transparent);
            mask-image: radial-gradient(circle at bottom, transparent 40%, black);
            opacity: 0.8;
            animation: shimmer 4s linear infinite;
            animation-play-state: running;
          }

          .shiny-cta span {
            position: relative;
            z-index: 2;
            display: inline-block;
          }

          .shiny-cta span::before {
            content: '';
            pointer-events: none;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            z-index: -1;
            --size: calc(100% + 1rem);
            width: var(--size);
            height: var(--size);
            box-shadow: inset 0 -1ex 2rem 4px rgba(66, 98, 255, 0.3);
            opacity: 0.3;
            border-radius: inherit;
            transition: opacity 800ms cubic-bezier(0.25, 1, 0.5, 1);
            animation: breathe 4.5s linear infinite;
          }

          @keyframes shimmer {
            to { transform: translate(-50%, -50%) rotate(360deg);}
          }

          @keyframes breathe {
            0%, 100% { transform: translate(-50%, -50%) scale(1);}
            50% { transform: translate(-50%, -50%) scale(1.20);}
          }
        `}</style>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between mb-16 opacity-0 animate-fade-in futura-font">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-6" style={{backgroundColor: '#4262ff20', color: '#4262ff'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/>
                  <circle cx="12" cy="8" r="6"/>
                </svg>
                Лидер строительного рынка
              </div>
              <h1 className="sm:text-5xl lg:text-6xl xl:text-7xl leading-[0.9] text-4xl font-medium tracking-tight">
                Стройте будущее<br/>
                <span className="font-light italic text-gray-600">с Bau4You</span>
            </h1>
              <p className="text-lg text-gray-600 mt-6 leading-relaxed">
                Единая экосистема для строительства: маркетплейс, тендерная площадка и каталог компаний. 
                Всё что нужно для успешного строительного бизнеса.
              </p>
            </div>
          </div>

          {/* Bento Grid Layout */}
          <div className="space-y-8 lg:space-y-12 futura-font">
            {/* Row 1 - Hero Section */}
            <div className="grid grid-cols-2 lg:grid-cols-8 gap-4 lg:gap-6">
              {/* Main Hero Card - Large */}
              <div className="col-span-2 lg:col-span-5 opacity-0 animate-scale-in animate-delay-400">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl group h-[400px] lg:h-[500px]">
                  <img 
                    src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1080&q=80" 
                    alt="Современная стройка" 
                    className="w-full h-full transition-transform duration-700 group-hover:scale-105 object-cover"
                  />
                  
                  {/* Floating Card */}
                  <div className="absolute bottom-6 left-6 right-6 lg:right-auto lg:max-w-sm">
                    <div className="glass-effect p-5 lg:p-6 rounded-2xl shadow-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{backgroundColor: '#4262ff20'}}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" style={{color: '#4262ff'}}>
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H5"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-medium leading-tight">
                            Проверенные
                            <span className="italic font-light" style={{color: '#4262ff'}}> Проекты</span>
                          </h3>
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                            95% проектов завершаются в срок с нашими подрядчиками.
                          </p>
                          <div className="flex items-center gap-6 mt-4">
                            <div className="text-center">
                              <div className="font-semibold text-lg" style={{color: '#4262ff'}}>250+</div>
                              <div className="text-xs text-gray-500">Проектов</div>
                </div>
                            <div className="text-center">
                              <div className="font-semibold text-lg" style={{color: '#4262ff'}}>98%</div>
                              <div className="text-xs text-gray-500">В срок</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            {/* BAU.Тендеры Card */}
               <div className="col-span-2 lg:col-span-3 opacity-0 animate-slide-up animate-delay-600">
                 <div className="rounded-3xl text-white p-6 lg:p-8 relative overflow-hidden shadow-2xl group h-[400px] lg:h-[500px] flex flex-col" style={{background: `linear-gradient(135deg, #4262ff, #4262ff)`}}>
                   {/* Animated Mesh Gradient Background */}
                   <div className="absolute inset-0 pointer-events-none">
                     <div className="absolute top-1/2 left-1/2 w-36 h-32 rounded-full mesh1 opacity-50"
                       style={{background: 'linear-gradient(90deg, #4262ff 75%, transparent 100%)', filter: 'blur(12px)'}}></div>
                     <div className="absolute top-1/2 left-1/2 w-32 h-36 rounded-full mesh2 opacity-60"
                       style={{background: 'linear-gradient(120deg, #6366f1 90%, transparent 100%)', filter: 'blur(10px)'}}></div>
                     <div className="absolute top-1/2 left-1/2 w-28 h-28 rounded-full bg-white mesh3 opacity-35 mix-blend-overlay"
                       style={{filter: 'blur(10px)'}}></div>
                     <div className="absolute top-1/2 left-1/2 w-28 h-28 rounded-full mesh4 opacity-45"
                       style={{background: 'linear-gradient(105deg, #4262ff 90%, transparent 100%)', filter: 'blur(8px)'}}></div>
                     <div className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full mesh1 opacity-40"
                       style={{background: 'linear-gradient(45deg, #8b5cf6 80%, transparent 100%)', filter: 'blur(6px)'}}></div>
              </div>
              
                   {/* Background Pattern */}
                   <div className="absolute inset-0 opacity-10">
                     <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white/10"></div>
                     <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-white/5"></div>
                   </div>
                  
                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                          </svg>
                        </div>
                        <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur">
                          Тендерная площадка
                        </div>
                      </div>
                      
                      <h3 className="text-2xl lg:text-3xl font-medium leading-tight mb-6">
                        BAU.Тендеры
                      </h3>
                      
                      <div className="space-y-4 text-sm lg:text-base">
                        <p className="text-white/80 leading-relaxed">
                    Более 60 проектов на платформе. Свободная площадка для каждого.
                  </p>
                        <p className="text-white/80 leading-relaxed">
                    Найдите проект или создайте свой.
                  </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <div className="text-sm text-white/70">
                        60+ активных проектов
                      </div>
                      <Link href="/tenders" className="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-3 rounded-full text-sm font-medium transition-colors">
                    Перейти
                  </Link>
                </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2 - Feature Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-8 gap-4 lg:gap-6">

            {/* Bau.Компании Card */}
               <div className="col-span-2 lg:col-span-3 opacity-0 animate-slide-up animate-delay-800">
                 <div className="rounded-3xl text-white p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group h-[350px] flex flex-col justify-between" style={{background: `linear-gradient(135deg, #4262ff, #4262ff)`}}>
                   {/* Animated Mesh Gradient Background - Companies */}
                   <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden">
                     <div className="absolute top-1/2 left-1/2 w-36 h-32 rounded-full mesh2 opacity-20"
                       style={{background: 'linear-gradient(90deg, #8b5cf6 75%, transparent 100%)', filter: 'blur(15px)'}}></div>
                     <div className="absolute top-1/2 left-1/2 w-32 h-36 rounded-full mesh3 opacity-25"
                       style={{background: 'linear-gradient(120deg, #a855f7 90%, transparent 100%)', filter: 'blur(12px)'}}></div>
                     <div className="absolute top-1/2 left-1/2 w-28 h-28 rounded-full bg-white mesh4 opacity-15 mix-blend-overlay"
                       style={{filter: 'blur(12px)'}}></div>
                     <div className="absolute top-1/2 left-1/2 w-28 h-28 rounded-full mesh1 opacity-18"
                       style={{background: 'linear-gradient(105deg, #7c3aed 90%, transparent 100%)', filter: 'blur(10px)'}}></div>
                     <div className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full mesh2 opacity-15"
                       style={{background: 'linear-gradient(45deg, #c084fc 80%, transparent 100%)', filter: 'blur(8px)'}}></div>
              </div>
              
                   <div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 backdrop-blur">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="m22 21-3-3"/>
                        <circle cx="16" cy="14" r="5"/>
                        <path d="M19 11v6"/>
                        <path d="M16 14h6"/>
                      </svg>
                    </div>
                    <h3 className="text-xl lg:text-2xl font-medium leading-tight mb-4">
                      Bau.Компании
                    </h3>
                    <div className="space-y-3 text-sm lg:text-base">
                      <p className="text-white/80 leading-relaxed">
                    Более 170 компаний на платформе. Свободная площадка для каждого.
                  </p>
                      <p className="text-white/80 leading-relaxed">
                    Найдите партнера или создайте свой профиль.
                  </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-white/70">
                      170+ проверенных компаний
                    </div>
                    <Link href="/companies" className="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-3 rounded-full text-sm font-medium transition-colors">
                    Перейти
                  </Link>
                  </div>
                </div>
                </div>
                
                             {/* BAU.Маркет Card */}
               <div className="col-span-2 lg:col-span-2 opacity-0 animate-scale-in animate-delay-1000">
                 <div className="rounded-3xl text-white p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group h-[350px] flex flex-col justify-between" style={{background: `linear-gradient(135deg, #4262ff, #4262ff)`}}>
                   {/* Animated Mesh Gradient Background - Market */}
                   <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden">
                     <div className="absolute top-1/2 left-1/2 w-32 h-28 rounded-full mesh4 opacity-22"
                       style={{background: 'linear-gradient(90deg, #06b6d4 75%, transparent 100%)', filter: 'blur(15px)'}}></div>
                     <div className="absolute top-1/2 left-1/2 w-28 h-32 rounded-full mesh1 opacity-28"
                       style={{background: 'linear-gradient(120deg, #0ea5e9 90%, transparent 100%)', filter: 'blur(12px)'}}></div>
                     <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-white mesh3 opacity-18 mix-blend-overlay"
                       style={{filter: 'blur(12px)'}}></div>
                     <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full mesh2 opacity-20"
                       style={{background: 'linear-gradient(105deg, #0284c7 90%, transparent 100%)', filter: 'blur(10px)'}}></div>
                     <div className="absolute top-1/2 left-1/2 w-18 h-18 rounded-full mesh4 opacity-16"
                       style={{background: 'linear-gradient(45deg, #67e8f9 80%, transparent 100%)', filter: 'blur(8px)'}}></div>
              </div>
                   
                   <div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 backdrop-blur">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white">
                        <path d="m7 7 10 10-5 5-10-10V2h5l5 5Z"/>
                        <path d="M13 5 9 1 5 5"/>
                        <path d="m15 16 5 5"/>
                        <circle cx="18" cy="18" r="3"/>
                      </svg>
            </div>
                    <h3 className="text-lg lg:text-xl font-medium leading-tight mb-4">
                      BAU.Маркет
                    </h3>
                    <div className="space-y-3 text-sm">
                      <p className="text-white/80 leading-relaxed">
                        Строительный маркетплейс для всех и каждого.
                      </p>
                      <p className="text-white/80 leading-relaxed">
                        Размещайте товар и продвигайте свой профиль.
                      </p>
          </div>
        </div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-white/70">
                      Тысячи товаров
                    </div>
                    <Link href="/products" className="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-3 rounded-full text-sm font-medium transition-colors">
                      Перейти
                    </Link>
                  </div>
                </div>
              </div>

              {/* Platform Overview Card */}
              <div className="col-span-2 lg:col-span-3 opacity-0 animate-slide-left animate-delay-1200">
                <div className="relative rounded-3xl overflow-hidden shadow-xl group h-[350px]">
                  <img 
                    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&q=80" 
                    alt="Строительная платформа" 
                    className="w-full h-full transition-transform duration-700 group-hover:scale-105 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Content */}
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-xl lg:text-2xl font-medium mb-3">
                      Единая экосистема
                    </h3>
                    <p className="text-sm lg:text-base text-white/90 mb-4">
                      Все инструменты строительного бизнеса в одном месте: проекты, партнеры, материалы
                    </p>
                    <Link href="/about" className="bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-3 rounded-full text-sm font-medium transition-colors inline-block">
                      Узнать больше
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* JavaScript for animations */}
        <script dangerouslySetInnerHTML={{
          __html: `
            // Intersection Observer for animations
            const observerOptions = {
              threshold: 0.1,
              rootMargin: '0px 0px -50px 0px'
            };
            
            const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  entry.target.style.animationPlayState = 'running';
                }
              });
            }, observerOptions);
            
            // Observe all animated elements
            document.querySelectorAll('[class*="animate-"]').forEach(el => {
              el.style.animationPlayState = 'paused';
              observer.observe(el);
            });
            
            // Smooth hover effects
            document.querySelectorAll('.group').forEach(element => {
              element.addEventListener('mouseenter', () => {
                element.style.transform = 'translateY(-2px)';
              });
              
              element.addEventListener('mouseleave', () => {
                element.style.transform = 'translateY(0)';
              });
            });
          `
        }} />
      </section>



      {/* BAU.Тендеры Section - Bento Grid */}
      <section className="relative py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-white overflow-hidden futura-font">
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-20 blur-2xl animate-pulse" style={{background: 'linear-gradient(45deg, #4262ff, #06b6d4)'}}></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full opacity-15 blur-3xl animate-pulse" style={{background: 'linear-gradient(135deg, #10b981, #4262ff)', animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full opacity-25 blur-xl animate-pulse" style={{background: 'linear-gradient(90deg, #8b5cf6, #06b6d4)', animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-gray-900 mb-3 sm:mb-4">
                BAU.Тендеры
              </h2>
            <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed max-w-2xl mx-auto">
              100+ актуальных проектов на платформе
                <br />
              <span className="font-medium" style={{color: '#4262ff'}}>Найдите проект мечты или создайте свой</span>
              </p>
            </div>
            
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Main Featured Project - Large Card */}
              {latestProjects.length > 0 ? (
              <div className="lg:col-span-2 lg:row-span-2 glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(66, 98, 255, 0.1)'}}>
                {/* Animated mesh gradient for this card */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-4 right-4 w-16 h-16 rounded-full opacity-30 blur-xl" style={{background: 'linear-gradient(45deg, #4262ff, #06b6d4)'}}></div>
                  <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full opacity-25 blur-lg" style={{background: 'linear-gradient(135deg, #10b981, #8b5cf6)'}}></div>
                </div>
                
                <div className="relative z-10">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium px-2 py-1 rounded-full" style={{backgroundColor: '#4262ff20', color: '#4262ff'}}>
                        Главный проект
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {latestProjects[0].title || latestProjects[0].name}
                  </h3>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 p-2 rounded-lg glass-effect" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}}>
                      <div className="text-xs">
                        <span className="font-medium text-gray-600">Назначение:</span>
                        <span className="font-bold text-gray-900 ml-1">{latestProjects[0].category || 'Промышленные'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 p-2 rounded-lg glass-effect" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}}>
                      <div className="text-xs">
                        <span className="font-medium text-gray-600">Адрес:</span>
                        <span className="text-gray-900 ml-1">{latestProjects[0].location || 'Россия'}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 p-2 rounded-lg glass-effect" style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}}>
                      <div className="text-xs">
                        <span className="font-medium text-gray-600">Дата:</span>
                        <span className="text-gray-900 ml-1">{latestProjects[0].created_at ? new Date(latestProjects[0].created_at).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/projects/${latestProjects[0].id}`} 
                    className="w-full px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl block text-center text-sm"
                    style={{backgroundColor: '#4262ff'}}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3651e6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4262ff'}
                  >
                    Подробнее →
                  </Link>
                </div>
                </div>
              ) : (
              <div className="lg:col-span-2 lg:row-span-2 glass-effect rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(66, 98, 255, 0.1)'}}>
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center font-bold text-lg" style={{backgroundColor: '#4262ff20', color: '#4262ff'}}>
                      ...
                </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Загрузка проектов...</h3>
                    <p className="text-sm text-gray-600">Подождите, данные загружаются</p>
            </div>
          </div>
        </div>
            )}

            {/* Project Cards - Smaller Cards */}
            {latestProjects.slice(1, 5).map((project, index) => (
              <div key={project.id} className="glass-effect rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 group" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(66, 98, 255, 0.1)'}}>
                <div className="mb-3">
                  <h4 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2 group-hover:text-[#4262ff] transition-colors">
                    {project.title || project.name}
                  </h4>
                  <p className="text-xs text-gray-600 mb-2">{project.location || 'Россия'}</p>
                </div>
                
                <div className="space-y-1 mb-3">
                  <div className="text-xs text-gray-500">
                    {project.created_at ? new Date(project.created_at).toLocaleDateString('ru-RU') : new Date().toLocaleDateString('ru-RU')}
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full inline-block" style={{backgroundColor: '#4262ff15', color: '#4262ff'}}>
                    {project.category || 'Промышленные'}
                  </div>
                </div>
                
                <Link 
                  href={`/projects/${project.id}`} 
                  className="text-xs font-semibold transition-colors hover:underline block"
                  style={{color: '#4262ff'}}
                >
                  Подробнее →
                </Link>
              </div>
            ))}
            
            {/* Fallback cards if not enough projects */}
            {latestProjects.length < 5 && Array.from({ length: Math.max(0, 4 - (latestProjects.length - 1)) }).map((_, index) => (
              <div key={`fallback-${index}`} className="glass-effect rounded-xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300 group" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(66, 98, 255, 0.1)'}}>
                <div className="mb-3">
                  <h4 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-[#4262ff] transition-colors">
                  {index === 0 ? 'Реконструкция офисного здания' : 
                   index === 1 ? 'Строительство жилого комплекса' : 
                     index === 2 ? 'Модернизация производства' : 'Торговый центр'}
                </h4>
                  <p className="text-xs text-gray-600 mb-2">
                  {index === 0 ? 'Москва, Центральный район' : 
                   index === 1 ? 'Санкт-Петербург, Приморский район' : 
                     index === 2 ? 'Екатеринбург, Промышленный район' : 'Казань, Вахитовский район'}
                  </p>
                </div>
                
                <div className="space-y-1 mb-3">
                  <div className="text-xs text-gray-500">
                    {new Date().toLocaleDateString('ru-RU')}
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full inline-block" style={{backgroundColor: '#4262ff15', color: '#4262ff'}}>
                    {index === 0 ? 'Коммерческие' : index === 1 ? 'Жилые' : index === 2 ? 'Промышленные' : 'Торговые'}
                  </div>
                </div>
                
                <button className="text-xs font-semibold transition-colors hover:underline" style={{color: '#4262ff'}}>
                  Подробнее →
                </button>
              </div>
            ))}

            {/* View All Projects Card */}
            <div className="lg:col-span-2 glass-effect rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden" style={{backgroundColor: 'rgba(66, 98, 255, 0.05)', border: '1px solid rgba(66, 98, 255, 0.2)'}}>
              {/* Interactive Dots Animation Background */}
              <div className="absolute inset-0 pointer-events-none">
                <div data-dots-container-init className="dots-container">
                  <div className="dot"></div>
                </div>
              </div>
              
              <div className="relative z-10 p-4 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl flex items-center justify-center font-bold text-xl sm:text-2xl group-hover:scale-105 transition-transform" style={{backgroundColor: '#4262ff', color: 'white'}}>
                  #
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                  Все проекты
                </h3>
                <p className="text-sm text-gray-600 mb-4 sm:mb-6">
                  Просмотрите полный каталог из 100+ актуальных строительных проектов
                </p>
                <Link 
                  href="/projects" 
                  className="inline-flex items-center gap-2 px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-white transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
                  style={{backgroundColor: '#4262ff'}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3651e6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4262ff'}
                >
                  <span>Смотреть все</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
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
          <div className="relative mb-12 py-6 sm:py-8" suppressHydrationWarning={true}>
            {/* Animated Mesh Gradient Background */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute top-8 left-8 w-24 h-24 bg-gradient-to-br from-orange-500 to-red-500 rounded-full opacity-15 blur-xl animate-pulse"></div>
              <div className="absolute top-12 right-16 w-32 h-32 bg-gradient-to-br from-red-500 to-pink-500 rounded-full opacity-12 blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-12 left-1/4 w-28 h-28 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full opacity-14 blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
              <div className="absolute bottom-8 right-1/3 w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-full opacity-18 blur-lg animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-gradient-to-br from-red-400 to-orange-500 rounded-full opacity-10 blur-2xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6" suppressHydrationWarning={true}>
                <div suppressHydrationWarning={true}>
                  <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-1">
                    <span className="text-orange-500">
                      Bau.Компании
                    </span>
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">Надежные партнеры и подрядчики для ваших проектов</p>
                </div>
                <Link href="/companies" className="bg-white/80 backdrop-blur-md hover:bg-orange-500 hover:text-white px-3 sm:px-4 py-2 rounded-lg font-medium text-sm text-orange-500 border border-orange-200 shadow-lg transition-all duration-300 hover:scale-105">
                  Смотреть все
                </Link>
              </div>
              
              {loadingData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" suppressHydrationWarning={true}>
                  {/* Main Loading Card */}
                  <div className="sm:col-span-2 lg:row-span-2 bg-white/80 backdrop-blur-md rounded-xl p-4 border border-orange-200/50 shadow-lg animate-pulse" suppressHydrationWarning={true}>
                    <div className="flex items-center gap-3 mb-3" suppressHydrationWarning={true}>
                      <div className="w-12 h-12 bg-gray-300 rounded-lg" suppressHydrationWarning={true}></div>
                      <div className="flex-1" suppressHydrationWarning={true}>
                        <div className="h-4 bg-gray-300 rounded mb-2" suppressHydrationWarning={true}></div>
                        <div className="h-3 bg-gray-300 rounded w-24" suppressHydrationWarning={true}></div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="h-3 bg-gray-300 rounded" suppressHydrationWarning={true}></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4" suppressHydrationWarning={true}></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-5 bg-gray-300 rounded w-16" suppressHydrationWarning={true}></div>
                      <div className="h-5 bg-gray-300 rounded w-20" suppressHydrationWarning={true}></div>
                    </div>
                  </div>
                  
                  {/* Small Loading Cards */}
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-md rounded-xl p-3 border border-orange-200/50 shadow-lg animate-pulse" suppressHydrationWarning={true}>
                      <div className="flex items-center gap-2 mb-2" suppressHydrationWarning={true}>
                        <div className="w-8 h-8 bg-gray-300 rounded-lg" suppressHydrationWarning={true}></div>
                        <div className="flex-1" suppressHydrationWarning={true}>
                          <div className="h-3 bg-gray-300 rounded mb-1" suppressHydrationWarning={true}></div>
                          <div className="h-2 bg-gray-300 rounded w-12" suppressHydrationWarning={true}></div>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-300 rounded w-16" suppressHydrationWarning={true}></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" suppressHydrationWarning={true}>
                  {/* Main Featured Company */}
                  {latestCompanies.slice(0, 1).map((company) => (
                    <Link key={company.id} href={`/companies/${company.id}`} className="sm:col-span-2 lg:row-span-2 bg-white/80 backdrop-blur-md hover:bg-white/90 rounded-xl p-4 border border-orange-200/50 shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer block group relative overflow-hidden" suppressHydrationWarning={true}>
                      {/* Hover gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-3">
                          <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-lg text-xs font-medium">
                            Топ компания
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3" suppressHydrationWarning={true}>
                          <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg" suppressHydrationWarning={true}>
                            {company.logo ? (
                              <img src={`/api/image-proxy?url=${encodeURIComponent(company.logo)}`} alt={company.name} className="w-12 h-12 object-cover rounded-lg" />
                            ) : (
                              company.name.charAt(0)
                            )}
                          </div>
                          <div className="flex-1" suppressHydrationWarning={true}>
                            <h4 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{company.name}</h4>
                            <div className="flex items-center gap-2" suppressHydrationWarning={true}>
                              <span className="text-yellow-500 text-sm">★</span>
                              <span className="text-xs text-gray-600">{company.rating || '5.0'}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs text-gray-600">{company.regions?.name || 'Россия'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2" suppressHydrationWarning={true}>
                          {company.description || company.specialization || 'Профессиональная строительная компания с многолетним опытом работы'}
                        </p>
                        
                        <div className="flex flex-wrap gap-1">
                          <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg text-xs">
                            Строительство
                          </span>
                          <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg text-xs">
                            Ремонт
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {/* Small Company Cards */}
                  {latestCompanies.slice(1, 4).map((company) => (
                    <Link key={company.id} href={`/companies/${company.id}`} className="bg-white/80 backdrop-blur-md hover:bg-white/90 rounded-xl p-3 border border-orange-200/50 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer block group" suppressHydrationWarning={true}>
                      <div className="flex items-center gap-2 mb-2" suppressHydrationWarning={true}>
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-xs" suppressHydrationWarning={true}>
                          {company.logo ? (
                            <img src={`/api/image-proxy?url=${encodeURIComponent(company.logo)}`} alt={company.name} className="w-8 h-8 object-cover rounded-lg" />
                          ) : (
                            company.name.charAt(0)
                          )}
                        </div>
                        <div className="flex-1 min-w-0" suppressHydrationWarning={true}>
                          <h4 className="font-bold text-gray-900 text-xs line-clamp-1">{company.name}</h4>
                          <div className="flex items-center gap-1" suppressHydrationWarning={true}>
                            <span className="text-yellow-500 text-xs">★</span>
                            <span className="text-xs text-gray-600">{company.rating || '5.0'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-orange-600 font-medium line-clamp-1 group-hover:text-orange-700" suppressHydrationWarning={true}>
                        {company.specialization || 'Строительство'}
                      </div>
                    </Link>
                  ))}
                  
                  {/* View All Companies Card */}
                  <Link href="/companies" className="bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-xl p-3 border border-orange-200/50 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer block group text-center" suppressHydrationWarning={true}>
                    <div className="text-xl mb-1 group-hover:scale-110 transition-transform duration-300">#</div>
                    <h4 className="font-bold text-gray-900 text-xs mb-1">Все компании</h4>
                    <p className="text-xs text-gray-600">170+ партнеров</p>
                  </Link>
                  
                  {latestCompanies.length === 0 && (
                    <div className="col-span-full text-center py-6" suppressHydrationWarning={true}>
                      <div className="text-2xl mb-2">...</div>
                      <p className="text-sm text-gray-600">Загружаем компании</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Bau.Маркет - Материалы */}
          <div className="relative mb-12 py-6 sm:py-8" suppressHydrationWarning={true}>
            {/* Animated Mesh Gradient Background */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <div className="absolute top-8 left-8 w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full opacity-15 blur-xl animate-pulse"></div>
              <div className="absolute top-12 right-16 w-32 h-32 bg-gradient-to-br from-green-500 to-teal-500 rounded-full opacity-12 blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-12 left-1/4 w-28 h-28 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full opacity-14 blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
              <div className="absolute bottom-8 right-1/3 w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full opacity-18 blur-lg animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-10 blur-2xl animate-pulse" style={{animationDelay: '1.5s'}}></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6" suppressHydrationWarning={true}>
                <div suppressHydrationWarning={true}>
                  <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-1">
                    <span className="text-emerald-500">
                      Bau.Маркет
                    </span>
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">Качественные строительные материалы от проверенных поставщиков</p>
                </div>
                <Link href="/products" className="bg-white/80 backdrop-blur-md hover:bg-emerald-500 hover:text-white px-3 sm:px-4 py-2 rounded-lg font-medium text-sm text-emerald-500 border border-emerald-200 shadow-lg transition-all duration-300 hover:scale-105">
                  Смотреть все
                </Link>
              </div>
              
              {loadingData ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" suppressHydrationWarning={true}>
                  {/* Main Loading Card */}
                  <div className="sm:col-span-2 lg:row-span-2 bg-white/80 backdrop-blur-md rounded-xl p-4 border border-emerald-200/50 shadow-lg animate-pulse" suppressHydrationWarning={true}>
                    <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-3" suppressHydrationWarning={true}></div>
                    <div className="h-4 bg-gray-300 rounded mb-2" suppressHydrationWarning={true}></div>
                    <div className="h-3 bg-gray-300 rounded mb-3" suppressHydrationWarning={true}></div>
                    <div className="h-5 bg-gray-300 rounded w-20 mx-auto" suppressHydrationWarning={true}></div>
                  </div>
                  
                  {/* Small Loading Cards */}
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-md rounded-xl p-3 border border-emerald-200/50 shadow-lg animate-pulse" suppressHydrationWarning={true}>
                      <div className="w-12 h-12 bg-gray-300 rounded-lg mx-auto mb-2" suppressHydrationWarning={true}></div>
                      <div className="h-3 bg-gray-300 rounded mb-1" suppressHydrationWarning={true}></div>
                      <div className="h-4 bg-gray-300 rounded w-16 mx-auto" suppressHydrationWarning={true}></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" suppressHydrationWarning={true}>
                  {/* Main Featured Product */}
                  {latestProducts.slice(0, 1).map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`} className="sm:col-span-2 lg:row-span-2 bg-white/80 backdrop-blur-md hover:bg-white/90 rounded-xl p-4 border border-emerald-200/50 shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer block group relative overflow-hidden" suppressHydrationWarning={true}>
                      {/* Hover gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10 text-center">
                        <div className="flex items-start justify-between mb-3">
                          <span className="bg-emerald-100 text-emerald-600 px-2 py-1 rounded-lg text-xs font-medium">
                            Хит продаж
                          </span>
                        </div>
                        
                        <div className="mb-3" suppressHydrationWarning={true}>
                          {product.images && product.images.length > 0 ? (
                            <img src={`/api/image-proxy?url=${encodeURIComponent(product.images[0])}`} alt={product.name} className="w-16 h-16 object-cover rounded-lg mx-auto" />
                          ) : (
                            <div className="w-16 h-16 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-xl mx-auto">
                              #
                            </div>
                          )}
                        </div>

                        <h4 className="font-bold text-gray-900 text-base mb-2 line-clamp-2">{product.name}</h4>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          Высококачественный материал от проверенного поставщика
                        </p>
                        <div className="text-lg font-bold text-emerald-600" suppressHydrationWarning={true}>
                          {formatPriceSimple(product.price)} ₽
                        </div>
                        
                        <div className="flex flex-wrap gap-1 justify-center mt-2">
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-xs">
                            В наличии
                          </span>
                          <span className="bg-green-50 text-green-600 px-2 py-1 rounded-lg text-xs">
                            Доставка
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {/* Small Product Cards */}
                  {latestProducts.slice(1, 4).map((product) => (
                    <Link key={product.id} href={`/products/${product.id}`} className="bg-white/80 backdrop-blur-md hover:bg-white/90 rounded-xl p-3 border border-emerald-200/50 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer block group text-center" suppressHydrationWarning={true}>
                      <div className="mb-2" suppressHydrationWarning={true}>
                        {product.images && product.images.length > 0 ? (
                          <img src={`/api/image-proxy?url=${encodeURIComponent(product.images[0])}`} alt={product.name} className="w-12 h-12 object-cover rounded-lg mx-auto" />
                        ) : (
                          <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto">
                            #
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-gray-900 text-xs mb-1 line-clamp-1">{product.name}</h4>
                      <div className="text-sm font-bold text-emerald-600 group-hover:text-emerald-700" suppressHydrationWarning={true}>
                        {formatPriceSimple(product.price)} ₽
                      </div>
                    </Link>
                  ))}
                  
                  {/* View All Products Card */}
                  <Link href="/products" className="bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 rounded-xl p-3 border border-emerald-200/50 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer block group text-center" suppressHydrationWarning={true}>
                    <div className="text-xl mb-1 group-hover:scale-110 transition-transform duration-300">#</div>
                    <h4 className="font-bold text-gray-900 text-xs mb-1">Все товары</h4>
                    <p className="text-xs text-gray-600">500+ материалов</p>
                  </Link>
                  
                  {latestProducts.length === 0 && (
                    <div className="col-span-full text-center py-6" suppressHydrationWarning={true}>
                      <div className="text-2xl mb-2">...</div>
                      <p className="text-sm text-gray-600">Загружаем товары</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Описание платформы и ролей */}
      <section className="relative py-16">
        <div className="container mx-auto px-6" suppressHydrationWarning={true}>
          <div className="mb-16 flex justify-center" suppressHydrationWarning={true}>
            <div className="relative max-w-5xl w-full">
              {/* Base Card (градиент) */}
              <div 
                className="absolute top-8 left-1/2 transform -translate-x-1/2 rounded-2xl shadow-2xl"
                style={{
                  width: 'calc(100% * 0.85)',
                  height: '28rem',
                  background: 'linear-gradient(135deg, #4262ff 0%, #06b6d4 50%, #10b981 100%)',
                  filter: 'drop-shadow(0 0 30px rgba(66, 98, 255, 0.4))'
                }}
              ></div>
              
              {/* Glass Card */}
              <div 
                className="relative rounded-2xl overflow-hidden"
                style={{
                  width: '100%',
                  height: '32rem',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)'
                }}
                suppressHydrationWarning={true}
              >
                {/* Border overlays */}
                <div 
                  className="absolute inset-0 rounded-2xl border border-white/50"
                  style={{
                    maskImage: 'linear-gradient(135deg, white, transparent 50%)'
                  }}
                ></div>
                <div 
                  className="absolute inset-0 rounded-2xl border border-blue-400/50"
                  style={{
                    maskImage: 'linear-gradient(135deg, transparent 50%, white)'
                  }}
                ></div>
                
                {/* Content */}
                <div className="flex flex-col h-full p-6 sm:p-8 lg:p-10 relative z-10">
                  {/* Header */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light leading-tight tracking-tight text-gray-800 mb-2">
                      Как работает строительная экосистема
                    </h3>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-blue-600">
                      BAU4YOU
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-base sm:text-lg text-gray-700 mb-6 text-center mx-auto max-w-4xl">
                    Единая экосистема для всех участников строительного рынка — от заказчиков до поставщиков
                  </p>
                  
                  {/* Icon strip */}
                  <div className="flex items-center justify-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <span className="text-sm">🏗️</span>
                    </div>
                    <div 
                      className="w-px h-6"
                      style={{
                        background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 80%, transparent)'
                      }}
                    ></div>
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <span className="text-sm">🤝</span>
                    </div>
                    <div 
                      className="w-px h-6"
                      style={{
                        background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 80%, transparent)'
                      }}
                    ></div>
                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <span className="text-sm">🎯</span>
                    </div>
                  </div>
                  
                  {/* Main divider */}
                  <div 
                    className="w-full h-px mb-6"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(75, 85, 99, 0.3) 20%, rgba(75, 85, 99, 0.5) 50%, rgba(75, 85, 99, 0.3) 80%, transparent)'
                    }}
                  ></div>
                  
                  {/* Stats Section */}
                  <div className="flex justify-center mb-6">
                    <div className="flex justify-between max-w-2xl w-full">
                      <div className="text-center px-2">
                        <div className="text-2xl sm:text-3xl font-semibold text-blue-600 mb-1">
                          170<span className="text-lg">+</span>
                        </div>
                        <div className="text-xs uppercase tracking-wide text-gray-600 font-medium">Компаний</div>
                      </div>
                      <div 
                        className="w-px h-16 my-auto"
                        style={{
                          background: 'linear-gradient(180deg, transparent, rgba(75, 85, 99, 0.3) 20%, rgba(75, 85, 99, 0.5) 50%, rgba(75, 85, 99, 0.3) 80%, transparent)'
                        }}
                      ></div>
                      <div className="text-center px-2">
                        <div className="text-2xl sm:text-3xl font-semibold text-blue-600 mb-1">
                          60<span className="text-lg">+</span>
                        </div>
                        <div className="text-xs uppercase tracking-wide text-gray-600 font-medium">Тендеров</div>
                      </div>
                      <div 
                        className="w-px h-16 my-auto"
                        style={{
                          background: 'linear-gradient(180deg, transparent, rgba(75, 85, 99, 0.3) 20%, rgba(75, 85, 99, 0.5) 50%, rgba(75, 85, 99, 0.3) 80%, transparent)'
                        }}
                      ></div>
                      <div className="text-center px-2">
                        <div className="text-2xl sm:text-3xl font-semibold text-blue-600 mb-1">500</div>
                        <div className="text-xs uppercase tracking-wide text-gray-600 font-medium">Товаров</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Secondary divider */}
                  <div 
                    className="w-full h-px mb-4 opacity-70"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(75, 85, 99, 0.3) 20%, rgba(75, 85, 99, 0.5) 50%, rgba(75, 85, 99, 0.3) 80%, transparent)'
                    }}
                  ></div>
                  
                  {/* Feature tags */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600">ТЕНДЕРНАЯ СИСТЕМА</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600">БАЗА ПОДРЯДЧИКОВ</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600">МАРКЕТПЛЕЙС</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600">БЕЗОПАСНЫЕ СДЕЛКИ</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600">БЫСТРЫЙ ПОИСК</span>
                  </div>
                  
                  {/* Bottom Section */}
                  <div className="mt-auto flex justify-between w-full">
                    <div className="flex flex-col">
                      <span className="text-gray-600 flex items-center gap-2 text-sm mb-1">
                        <span className="text-xs">🔒</span> Верифицированные участники
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="text-xs">🏆</span> Высокие стандарты качества
                      </span>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-gray-600 flex items-center gap-2 text-sm mb-1">
                        <span className="text-xs">⚡</span> Быстрые процессы
                      </span>
                      <p className="text-base font-medium text-blue-600 flex items-center gap-2">
                        <span className="text-xs">🌐</span> bau4you.ru
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Преимущества платформы */}
          <div className="relative py-16" suppressHydrationWarning={true}>
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute top-16 left-16 w-40 h-40 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full opacity-10 blur-3xl animate-pulse"></div>
              <div className="absolute top-20 right-20 w-48 h-48 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full opacity-8 blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-20 left-1/4 w-44 h-44 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full opacity-12 blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
              <div className="absolute bottom-16 right-1/3 w-36 h-36 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full opacity-14 blur-xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>

            <div className="relative z-10">
              <div className="text-center mb-12" suppressHydrationWarning={true}>
                <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-2">
                  <span className="text-purple-600">Почему нас выбирают</span>
                </h3>
                <p className="text-sm sm:text-base text-gray-600">Главные преимущества работы с BAU4YOU</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8" suppressHydrationWarning={true}>
                {[
                  {
                    title: 'Безопасность',
                    description: 'Все участники проходят верификацию. Гарантия безопасных сделок.',
                    color: 'purple',
                    stats: '99.8%',
                    statsLabel: 'Безопасность'
                  },
                  {
                    title: 'Скорость',
                    description: 'Быстрый поиск партнеров и материалов. Автоматизация процессов.',
                    color: 'indigo',
                    stats: '24/7',
                    statsLabel: 'Поддержка'
                  },
                  {
                    title: 'Качество',
                    description: 'Только проверенные поставщики и подрядчики с высоким рейтингом.',
                    color: 'pink',
                    stats: '4.9★',
                    statsLabel: 'Рейтинг'
                  }
                ].map((benefit, index) => (
                  <div 
                    key={index} 
                    className="relative group"
                    suppressHydrationWarning={true}
                  >
                    {/* Концентрические точки - только для средней карточки */}
                    {index === 1 && (
                      <div 
                        id={`concentricDots-${index}`}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20"
                        style={{ width: '100%', height: '100%' }}
                      ></div>
                    )}
                    
                    {/* Glass карточка */}
                    <div 
                      className="relative h-full bg-white/80 backdrop-blur-md hover:bg-white/90 rounded-xl p-6 border border-white/50 shadow-lg transition-all duration-300 hover:scale-105 text-center overflow-hidden"
                      suppressHydrationWarning={true}
                    >
                      {/* Градиентный border overlay */}
                      <div 
                        className={`absolute inset-0 rounded-xl border ${
                          benefit.color === 'purple' ? 'border-purple-200/50' :
                          benefit.color === 'indigo' ? 'border-indigo-200/50' :
                          'border-pink-200/50'
                        }`}
                        style={{
                          maskImage: 'linear-gradient(135deg, white, transparent 50%)'
                        }}
                      ></div>
                      
                      <div className="relative z-10">
                        {/* Статистика сверху */}
                        <div className="mb-4">
                          <div className={`text-2xl font-bold mb-1 ${
                            benefit.color === 'purple' ? 'text-purple-600' :
                            benefit.color === 'indigo' ? 'text-indigo-600' :
                            'text-pink-600'
                          }`}>
                            {benefit.stats}
                          </div>
                          <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                            {benefit.statsLabel}
                          </div>
                        </div>
                        
                        {/* Разделитель */}
                        <div 
                          className="w-full h-px mb-4"
                          style={{
                            background: `linear-gradient(90deg, transparent, ${
                              benefit.color === 'purple' ? 'rgba(147, 51, 234, 0.3)' :
                              benefit.color === 'indigo' ? 'rgba(99, 102, 241, 0.3)' :
                              'rgba(236, 72, 153, 0.3)'
                            } 50%, transparent)`
                          }}
                        ></div>
                        
                        {/* Заголовок */}
                        <h4 className="text-lg font-bold text-gray-900 mb-3">{benefit.title}</h4>
                        
                        {/* Описание */}
                        <p className="text-sm text-gray-600 mb-4 line-height-relaxed">{benefit.description}</p>
                        
                        {/* Feature tags */}
                        <div className="flex flex-wrap gap-1 justify-center">
                          <span className={`text-xs px-2 py-1 rounded-full border ${
                            benefit.color === 'purple' ? 'bg-purple-50 border-purple-200 text-purple-600' :
                            benefit.color === 'indigo' ? 'bg-indigo-50 border-indigo-200 text-indigo-600' :
                            'bg-pink-50 border-pink-200 text-pink-600'
                          }`}>
                            {benefit.color === 'purple' ? 'ВЕРИФИКАЦИЯ' :
                             benefit.color === 'indigo' ? 'АВТОМАТИЗАЦИЯ' :
                             'КОНТРОЛЬ КАЧЕСТВА'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
