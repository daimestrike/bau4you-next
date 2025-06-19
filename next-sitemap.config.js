/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: 'https://bau4you.co',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/auth-test/',
          '/test-*',
          '/simple-login/',
          '/test-login/',
          '/_next/',
          '/*.json$',
          '/checkout/',
          '/cart/',
          '/profile/edit',
          '/profile/settings'
        ],
      },
    ],
    additionalSitemaps: [
      'https://bau4you.co/server-sitemap.xml', // для динамических страниц
    ],
  },
  exclude: [
    '/api/*',
    '/dashboard/*',
    '/admin/*',
    '/auth-test/*',
    '/test-*',
    '/simple-login/*',
    '/test-login/*',
    '/_next/*',
    '/checkout/*',
    '/cart/*',
    '/profile/edit',
    '/profile/settings',
    '/server-sitemap.xml'
  ],
  transform: async (config, path) => {
    // Кастомизация приоритета и частоты обновления для разных страниц
    let priority = 0.7
    let changefreq = 'weekly'

    if (path === '/') {
      priority = 1.0
      changefreq = 'daily'
    } else if (path.startsWith('/tenders')) {
      priority = 0.9
      changefreq = 'daily'
    } else if (path.startsWith('/companies')) {
      priority = 0.8
      changefreq = 'weekly'
    } else if (path.startsWith('/search')) {
      priority = 0.6
      changefreq = 'weekly'
    } else if (path.startsWith('/products')) {
      priority = 0.7
      changefreq = 'weekly'
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    }
  },
} 