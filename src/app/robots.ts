import type { MetadataRoute } from 'next'

import { siteUrl } from '@/lib/site'

const protectedRoutes = [
  '/add-member',
  '/additions',
  '/admin-',
  '/all-members',
  '/contribution-table',
  '/contributions',
  '/datatable-component-05',
  '/death-documentations',
  '/deceased-members',
  '/financial-position',
  '/internal-rules',
  '/member-transfer',
  '/name-modification',
  '/navigation-instructions',
  '/payment-instructions',
  '/profile',
  '/registrationsPayments',
  '/removed-members'
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: protectedRoutes
    },
    sitemap: `${siteUrl}/sitemap.xml`
  }
}
