import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api/', '/profile', '/orders', '/track'],
    },
    sitemap: 'https://shedoo.com/sitemap.xml',
  }
}
