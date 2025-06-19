'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-6 py-16" suppressHydrationWarning={true}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8" suppressHydrationWarning={true}>
          {/* Логотип и описание */}
          <div className="space-y-4" suppressHydrationWarning={true}>
            <div className="flex items-center space-x-3" suppressHydrationWarning={true}>
              <img 
                src="https://s3.twcstorage.ru/5e559db6-b49dc67b-2ab0-4413-9567-c6e34e6a5bd4/uploads/%D0%BA%D1%80%D1%83%D0%B3%D0%B8%D0%B7%20%D1%87%D0%B0%D1%81%D1%82%D0%B8%D1%86%20%D0%BD%D0%B0%20%D1%81%D0%B5%D1%80%D0%BE%D0%BC.png"
                alt="Bau4You Logo"
                className="w-12 h-12 rounded-xl shadow-lg object-cover"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Bau4You</span>
            </div>
            <p className="text-gray-600 max-w-sm">
              Bau4You — не просто строительная IT-компания. Мы предоставляем уникальные инструменты для развития и упрощения строительства и бизнеса.
            </p>
          </div>

          {/* Наши сервисы */}
          <div suppressHydrationWarning={true}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Наши сервисы</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/bau365" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Bau365
                </Link>
              </li>
              <li>
                <Link href="/companies" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Bau.Компании
                </Link>
              </li>
              <li>
                <Link href="/tenders" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Bau.Тендеры
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Bau.Маркет
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Bau.PRO
                </Link>
              </li>
            </ul>
          </div>

          {/* Медиа и связь */}
          <div suppressHydrationWarning={true}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Медиа и связь</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://dzen.ru" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Дзен
                </a>
              </li>
              <li>
                <a href="https://t.me/bau4you" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Telegram
                </a>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Связаться
                </Link>
              </li>
              <li>
                <Link href="/knowledge" className="text-gray-600 hover:text-blue-600 transition-colors">
                  База знаний
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Поддержка
                </Link>
              </li>
            </ul>
          </div>

          {/* Информация */}
          <div suppressHydrationWarning={true}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Конфиденциальность
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Условия использования
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Политика отмены
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Безопасность
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
                  О нас
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижняя часть */}
        <div className="border-t border-gray-200 mt-12 pt-8" suppressHydrationWarning={true}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0" suppressHydrationWarning={true}>
            <div className="text-gray-600 text-sm" suppressHydrationWarning={true}>
              © Все права защищены 2024, ИП Попов Иван Владимирович
            </div>
            
            {/* Социальные сети */}
            <div className="flex space-x-4" suppressHydrationWarning={true}>
              <a 
                href="https://t.me/bau4you" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.377 2.618-1.415 3.051-2.896 1.899l-2.837-2.135-1.415 1.36c-.896.896-1.415 1.415-2.896.896l.896-2.837L18.314 7.264c.377-.338-.169-.507-.896-.169L8.537 11.2l-2.837-.896c-.896-.169-.896-.896.169-1.415L18.314 6.368c.896-.338 1.584.169 1.254 1.792z"/>
                </svg>
              </a>
              
              <a 
                href="https://github.com/bau4you" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-800 hover:text-white transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              
              <a 
                href="https://linkedin.com/company/bau4you" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}