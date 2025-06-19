'use client'

import TendersClient from './TendersClient'
import SEOHead from '@/components/SEO/SEOHead'
import { generateTendersSEO } from '@/lib/seo'

export default function TendersPage() {
  const tendersSEO = generateTendersSEO()
  
  return (
    <>
      <SEOHead structuredData={undefined} />
      <TendersClient initialProjects={[]} />
    </>
  )
}