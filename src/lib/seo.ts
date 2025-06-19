import { SEOData, OrganizationSchema, BreadcrumbSchema, ArticleSchema } from '@/types/seo'

const SITE_NAME = 'Bau4You'
const SITE_URL = 'https://bau4you.co'
const DEFAULT_DESCRIPTION = 'Bau4You - это онлайн-платформа, соединяющая местных разнорабочих и клиентов. Наша миссия - упростить процесс поиска и найма квалифицированных специалистов для решения любых задач, связанных со строительством.'

// Генерация SEO данных для главной страницы
export function generateHomeSEO(): SEOData {
  return {
    title: 'Bau4You - Цифровая платформа для строительства',
    description: DEFAULT_DESCRIPTION,
    canonical: '/',
    ogType: 'website',
    keywords: [
      'строительство',
      'ремонт',
      'специалисты',
      'разнорабочие',
      'тендеры',
      'строительные услуги',
      'поиск подрядчиков',
      'строительная платформа'
    ]
  }
}

// Генерация SEO данных для страницы тендеров
export function generateTendersSEO(): SEOData {
  return {
    title: 'Тендеры - Строительные проекты',
    description: 'Найдите строительные тендеры и проекты на Bau4You. Подавайте заявки на участие в тендерах и развивайте свой бизнес.',
    canonical: '/tenders',
    keywords: [
      'тендеры',
      'строительные тендеры',
      'проекты',
      'заявки на тендеры',
      'строительные проекты'
    ]
  }
}

// Генерация SEO данных для конкретного тендера
export function generateTenderSEO(tender: any): SEOData {
  const title = tender.title || 'Тендер'
  const description = tender.description 
    ? `${tender.description.substring(0, 150)}${tender.description.length > 150 ? '...' : ''}`
    : 'Подробная информация о строительном тендере на Bau4You'

  return {
    title,
    description,
    canonical: `/tenders/${tender.id}`,
    ogType: 'article',
    publishedTime: tender.created_at,
    modifiedTime: tender.updated_at,
    section: 'Тендеры',
    tags: ['тендер', 'строительство', tender.category].filter(Boolean),
    keywords: [
      'тендер',
      'строительный тендер',
      tender.category,
      'заявка на тендер',
      'строительный проект'
    ].filter(Boolean)
  }
}

// Генерация SEO данных для страницы компаний
export function generateCompaniesSEO(): SEOData {
  return {
    title: 'Компании - Строительные организации',
    description: 'Каталог строительных компаний на Bau4You. Найдите надежных подрядчиков, поставщиков и специалистов для ваших проектов.',
    canonical: '/companies',
    keywords: [
      'строительные компании',
      'подрядчики',
      'поставщики',
      'строительные организации',
      'каталог компаний'
    ]
  }
}

// Генерация SEO данных для конкретной компании  
export function generateCompanySEO(company: any): SEOData {
  const title = company.name || 'Компания'
  const description = company.description 
    ? `${company.description.substring(0, 150)}${company.description.length > 150 ? '...' : ''}`
    : `Информация о компании ${company.name} на Bau4You`

  return {
    title,
    description,
    canonical: `/companies/${company.id}`,
    ogType: 'profile',
    ogImage: company.logo_url || undefined,
    keywords: [
      company.name,
      company.industry,
      company.type,
      'строительная компания',
      'подрядчик'
    ].filter(Boolean)
  }
}

// Генерация SEO данных для поиска
export function generateSearchSEO(query?: string): SEOData {
  const title = query ? `Поиск: ${query}` : 'Поиск'
  const description = query 
    ? `Результаты поиска "${query}" на Bau4You. Найдите специалистов, компании и услуги.`
    : 'Поиск специалистов, компаний и услуг на Bau4You'

  return {
    title,
    description,
    canonical: query ? `/search?q=${encodeURIComponent(query)}` : '/search',
    keywords: query ? [query, 'поиск', 'строительство'] : ['поиск', 'строительство']
  }
}

// Генерация Organization Schema для главной страницы
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    description: DEFAULT_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressCountry: "KZ"
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "info@bau4you.co"
    },
    sameAs: [
      // Добавьте ссылки на социальные сети при наличии
    ],
    foundingDate: "2024"
  }
}

// Генерация Breadcrumb Schema
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>): BreadcrumbSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`
    }))
  }
}

// Генерация Article Schema для тендеров
export function generateTenderArticleSchema(tender: any): ArticleSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: tender.title,
    description: tender.description,
    author: {
      "@type": "Person",
      name: tender.profiles?.name_first 
        ? `${tender.profiles.name_first} ${tender.profiles.name_last || ''}`.trim()
        : "Заказчик"
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/images/logo.png`
      }
    },
    datePublished: tender.created_at,
    dateModified: tender.updated_at || tender.created_at,
    url: `${SITE_URL}/tenders/${tender.id}`
  }
}

// Утилита для генерации meta description из текста
export function generateMetaDescription(text: string, maxLength: number = 160): string {
  if (!text) return DEFAULT_DESCRIPTION
  
  const cleanText = text.replace(/<[^>]*>/g, '').trim()
  if (cleanText.length <= maxLength) return cleanText
  
  const truncated = cleanText.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  
  return lastSpace > 0 
    ? `${truncated.substring(0, lastSpace)}...`
    : `${truncated}...`
}

// Утилита для генерации ключевых слов из текста
export function generateKeywords(text: string, category?: string): string[] {
  const baseKeywords = ['строительство', 'ремонт', 'Bau4You']
  
  if (category) {
    baseKeywords.push(category.toLowerCase())
  }
  
  // Простая экстракция ключевых слов (можно улучшить)
  const words = text.toLowerCase()
    .replace(/[^\w\s\u0400-\u04FF]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
    .slice(0, 5)
  
  return [...new Set([...baseKeywords, ...words])]
} 