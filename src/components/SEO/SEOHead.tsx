import { SEOData } from '@/types/seo'

interface SEOHeadProps {
  structuredData?: object | object[]
}

export default function SEOHead({ structuredData }: SEOHeadProps) {
  // В App Router мы используем только structured data
  // Все остальные meta теги обрабатываются через generateMetadata
  
  if (!structuredData) return null

  const structuredDataArray = Array.isArray(structuredData) ? structuredData : [structuredData]

  return (
    <>
      {structuredDataArray.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data)
          }}
        />
      ))}
    </>
  )
} 