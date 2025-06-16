import { NextResponse } from 'next/server'
import { getServerSideSitemap, ISitemapField } from 'next-sitemap'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const siteUrl = 'https://bau4you.co'
  
  try {
    // Получаем данные из базы данных
    const [tendersResult, companiesResult] = await Promise.all([
      supabase
        .from('tenders')
        .select('id, updated_at, created_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(1000),
      supabase
        .from('companies')
        .select('id, updated_at, created_at')
        .order('updated_at', { ascending: false })
        .limit(1000)
    ])

    const fields: ISitemapField[] = []

    // Добавляем тендеры
    if (tendersResult.data) {
      tendersResult.data.forEach((tender) => {
        fields.push({
          loc: `${siteUrl}/tenders/${tender.id}`,
          lastmod: tender.updated_at || tender.created_at,
          changefreq: 'weekly',
          priority: 0.8,
        })
      })
    }

    // Добавляем компании
    if (companiesResult.data) {
      companiesResult.data.forEach((company) => {
        fields.push({
          loc: `${siteUrl}/companies/${company.id}`,
          lastmod: company.updated_at || company.created_at,
          changefreq: 'weekly',
          priority: 0.7,
        })
      })
    }

    return getServerSideSitemap(fields)
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Возвращаем пустой sitemap в случае ошибки
    return getServerSideSitemap([])
  }
} 