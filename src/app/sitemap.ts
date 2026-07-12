import type { MetadataRoute } from 'next'

import { siteUrl } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = ['' /* This is equivalent to / */]

  return routes.map(route => ({
    url: `${siteUrl}${route}`
  }))
}
