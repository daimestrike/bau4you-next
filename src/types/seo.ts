export interface SEOData {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'profile'
  twitterCard?: 'summary' | 'summary_large_image'
  keywords?: string[]
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

export interface OrganizationSchema {
  "@context": string
  "@type": string
  name: string
  url: string
  logo: string
  description: string
  address?: {
    "@type": string
    streetAddress?: string
    addressLocality?: string
    addressRegion?: string
    postalCode?: string
    addressCountry?: string
  }
  contactPoint?: {
    "@type": string
    telephone?: string
    contactType?: string
    email?: string
  }
  sameAs?: string[]
  foundingDate?: string
  numberOfEmployees?: string
}

export interface BreadcrumbSchema {
  "@context": string
  "@type": string
  itemListElement: Array<{
    "@type": string
    position: number
    name: string
    item: string
  }>
}

export interface ArticleSchema {
  "@context": string
  "@type": string
  headline: string
  description: string
  author: {
    "@type": string
    name: string
  }
  publisher: {
    "@type": string
    name: string
    logo: {
      "@type": string
      url: string
    }
  }
  datePublished: string
  dateModified?: string
  image?: string
  url: string
} 