# SEO Настройка для Bau4You

## Обзор

В проекте реализована базовая SEO-оптимизация с использованием Next.js App Router. Система включает:

1. **Meta-теги** - title, description, keywords, Open Graph, Twitter Cards
2. **Динамические мета-теги** - генерируются для страниц тендеров и компаний
3. **Sitemap** - автоматическая генерация с помощью next-sitemap
4. **Structured Data** - JSON-LD схемы для Organization, Article, Breadcrumbs
5. **Robots.txt** - управление индексацией
6. **Canonical URLs** - предотвращение дублированного контента

## Файлы и компоненты

### Типы и интерфейсы
- `src/types/seo.ts` - TypeScript типы для SEO данных

### Утилиты генерации SEO
- `src/lib/seo.ts` - функции для генерации мета-тегов и structured data

### Компоненты
- `src/components/SEO/SEOHead.tsx` - компонент для рендеринга structured data

### Конфигурация
- `next-sitemap.config.js` - настройки sitemap и robots.txt
- `src/app/server-sitemap.xml/route.ts` - динамический sitemap для страниц из БД

## Использование

### Базовые мета-теги
Настраиваются в `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "Заголовок сайта",
  description: "Описание сайта",
  // ... остальные настройки
}
```

### Динамические страницы
Для страниц с динамическим контентом используется `generateMetadata`:

```typescript
// Пример для страницы тендера
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const tender = await getTender(params.id)
  
  return {
    title: tender.title,
    description: tender.description,
    openGraph: {
      title: tender.title,
      description: tender.description,
      type: 'article',
    },
  }
}
```

### Structured Data
Используется компонент `SEOHead` для вставки JSON-LD:

```tsx
import SEOHead from '@/components/SEO/SEOHead'
import { generateOrganizationSchema } from '@/lib/seo'

function HomePage() {
  const organizationSchema = generateOrganizationSchema()
  
  return (
    <>
      <SEOHead structuredData={organizationSchema} />
      {/* остальной контент */}
    </>
  )
}
```

## Настройка для продакшена

### 1. Изображения
Замените заглушки на реальные изображения:
- `/public/images/og-default.jpg` - основное OG изображение (1200x630px)
- ✅ **Логотип уже настроен:** используется локальный файл `/public/images/logo.png`

### 2. Верификация поисковых систем
В `src/app/layout.tsx` добавьте коды верификации:

```typescript
verification: {
  google: "your-google-verification-code",
  yandex: "your-yandex-verification-code",
},
```

### 3. Настройка домена
В файлах:
- `next-sitemap.config.js`
- `src/lib/seo.ts`

Убедитесь, что используется правильный домен `https://bau4you.co`

### 4. Генерация sitemap
Sitemap генерируется автоматически при сборке проекта:

```bash
npm run build  # автоматически запустит next-sitemap
```

Доступен по адресам:
- `/sitemap.xml` - статические страницы
- `/server-sitemap.xml` - динамические страницы из БД

## Структура SEO функций

### Основные функции в `src/lib/seo.ts`:

1. **generateHomeSEO()** - SEO для главной страницы
2. **generateTendersSEO()** - SEO для страницы тендеров
3. **generateTenderSEO(tender)** - SEO для конкретного тендера
4. **generateCompaniesSEO()** - SEO для страницы компаний
5. **generateCompanySEO(company)** - SEO для конкретной компании
6. **generateSearchSEO(query)** - SEO для страницы поиска

### Structured Data схемы:

1. **generateOrganizationSchema()** - схема организации
2. **generateBreadcrumbSchema(items)** - хлебные крошки
3. **generateTenderArticleSchema(tender)** - схема статьи для тендера

## Проверка SEO

### Инструменты для проверки:
1. **Google Search Console** - индексация и ошибки
2. **Lighthouse** - аудит SEO
3. **Rich Results Test** - проверка structured data
4. **Open Graph Debugger** - проверка OG тегов

### Локальная проверка:
```bash
# Запуск в режиме разработки
npm run dev

# Сборка и проверка sitemap
npm run build
```

## Рекомендации

1. **Уникальные заголовки** - каждая страница должна иметь уникальный title
2. **Описания до 160 символов** - для корректного отображения в поисковой выдаче
3. **Ключевые слова** - используйте релевантные ключевые слова в meta description
4. **Изображения с alt** - все изображения должны иметь описание
5. **Быстрая загрузка** - оптимизируйте производительность

## Мониторинг

После внедрения регулярно проверяйте:
- Позиции в поисковой выдаче
- Ошибки индексации в Search Console
- Скорость загрузки страниц
- Корректность отображения сниппетов

## Поддержка

При возникновении вопросов или необходимости доработок обращайтесь к документации Next.js по SEO и используйте инструменты разработчика для отладки. 