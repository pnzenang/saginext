export const siteName = 'SAGI'

export const siteTitle = 'SAGI: Active Solidarity Ltd.'

export const siteDescription =
  'SAGI is a mutual aid community helping members and families prepare for funeral expenses through shared contributions and organized support.'

export const siteKeywords = ['SAGI', 'mutual aid', 'funeral support', 'member contributions', 'family support']

const productionFallbackSiteUrl = 'https://sagiusa.org'

const trimTrailingSlashes = (url: string) => url.replace(/\/+$/, '')

const getVercelSiteUrl = () => {
  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL

  return vercelUrl ? `https://${vercelUrl}` : undefined
}

export const siteUrl = trimTrailingSlashes(
  process.env.NEXT_PUBLIC_APP_URL?.trim() || getVercelSiteUrl() || productionFallbackSiteUrl
)
