'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function TestDiPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Custom Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Futura:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Futura', 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
      `}</style>

      <div className="bg-white text-gray-900 antialiased overflow-x-hidden">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          {/* Header Section */}
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between mb-16 opacity-0 animate-fade-in">
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

                    {/* Bento Grid Layout - Fixed Overlapping */}
          <section className="space-y-8 lg:space-y-12">
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
          </section>


        </main>
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
    </>
  )
}