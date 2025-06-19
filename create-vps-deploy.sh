#!/bin/bash

echo "🚀 Создание пакета для развертывания на VPS..."

# Создаем временную директорию
mkdir -p ./vps-deploy/src/app/api/sb/[...path]

# Копируем необходимые файлы
cp ./src/app/api/sb/[...path]/route.ts ./vps-deploy/src/app/api/sb/[...path]/
cp ./tsconfig.json ./vps-deploy/
cp ./next.config.ts ./vps-deploy/

# Создаем package.json для VPS
cat > ./vps-deploy/package.json << 'EOL'
{
  "name": "supabase-proxy",
  "version": "1.0.0",
  "description": "Supabase Proxy Server",
  "main": "server.js",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOL

# Создаем .env.local
cat > ./vps-deploy/.env.local << 'EOL'
NEXT_PUBLIC_SUPABASE_URL=https://gcbwqqwmqjolxxrvfbzz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjYndxcXdtcWpvbHh4cnZmYnp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODA2OTUsImV4cCI6MjA2NDQ1NjY5NX0.l4MmmUaF6YmNRRcorzdx_YdgQZerqqoS86N_T3TX7io
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjYndxcXdtcWpvbHh4cnZmYnp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg4MDY5NSwiZXhwIjoyMDY0NDU2Njk1fQ.HEFHYE0an6cEQEY4OsWQf7t-twcHFv6qtgDRxu6zpgw
EOL

# Создаем next.config.js с поддержкой CORS
cat > ./vps-deploy/next.config.js << 'EOL'
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS, PATCH' },
          { key: 'Access-Control-Allow-Headers', value: 'authorization, x-client-info, apikey, content-type, x-use-service-role' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
EOL

# Создаем README для VPS
cat > ./vps-deploy/README.md << 'EOL'
# Supabase Proxy для VPS

## Установка на VPS

1. Загрузите все файлы в `/var/www/supabase-proxy/`
2. Выполните: `npm install`
3. Выполните: `npm run build`
4. Запустите: `pm2 start npm --name "supabase-proxy" -- start`

## Тестирование

```bash
curl "https://api.bau4you.co/api/sb/rest/v1/commercial_proposals?limit=1" \
  -H "Content-Type: application/json"
```

Должен вернуть JSON ответ от Supabase.
EOL

# Создаем архив
cd vps-deploy
tar -czf ../supabase-proxy-vps.tar.gz .
cd ..

# Очищаем временную директорию
rm -rf ./vps-deploy

echo "✅ Пакет создан: supabase-proxy-vps.tar.gz"
echo ""
echo "📋 Следующие шаги:"
echo "1. Загрузите файл supabase-proxy-vps.tar.gz на ваш VPS"
echo "2. Разархивируйте: tar -xzf supabase-proxy-vps.tar.gz"
echo "3. Следуйте инструкциям в deploy-to-vps.md"
echo ""
echo "🔗 Тест: https://api.bau4you.co/api/sb/rest/v1/commercial_proposals?limit=1" 