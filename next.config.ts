import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compiler: {
    // Удаляем console.log в production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Включаем строгий режим React
  reactStrictMode: true,
  // Настройки для лучшей производительности
  poweredByHeader: false,
  compress: true,
  // Настройки для изображений
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '5e559db6-b49dc67b-2ab0-4413-9567-c6e34e6a5bd4.s3.timeweb.cloud',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Экспериментальные настройки для устранения ошибок гидратации
  experimental: {
    // Отключаем предварительную загрузку для уменьшения ошибок гидратации
    optimizePackageImports: ['@heroicons/react'],
  },
  // Настройки для обработки внешних скриптов и расширений браузера
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // В режиме разработки игнорируем некоторые предупреждения
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    return config;
  },
};

export default nextConfig;
